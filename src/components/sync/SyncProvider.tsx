'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  exportData,
  getSyncMetadata,
  markStateSynced,
  readAppState,
  replaceAppState,
  saveSyncMetadata,
  seedIfEmpty,
  subscribeStorageChanges,
  type SyncMetadata,
} from '@/lib/storage';

type SyncStatus = 'synced' | 'syncing' | 'offline' | 'conflict';
interface ServerState { data: Record<string, unknown> | null; version: number }
interface SyncContextValue { status: SyncStatus }

const SyncContext = createContext<SyncContextValue>({ status: 'syncing' });
const STATUS_LABEL: Record<SyncStatus, string> = {
  synced: 'Synced', syncing: 'Syncing', offline: 'Offline', conflict: 'Conflict',
};

function sameData(left: unknown, right: unknown): boolean {
  const canonical = (value: unknown): string => {
    if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
    if (typeof value === 'object' && value !== null) {
      return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`).join(',')}}`;
    }
    return JSON.stringify(value);
  };
  return canonical(left) === canonical(right);
}

function saveJsonFile(name: string, data: Record<string, unknown>): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function useSyncStatus(): SyncStatus {
  return useContext(SyncContext).status;
}

export default function SyncProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<SyncStatus>('syncing');
  const [conflict, setConflict] = useState<ServerState | null>(null);
  const [localConflict, setLocalConflict] = useState<Record<string, unknown> | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const running = useRef(false);

  const setConflictState = useCallback((localData: Record<string, unknown>, server: ServerState) => {
    setLocalConflict(localData);
    setConflict(server);
    setStatus('conflict');
  }, []);

  const fetchServer = useCallback(async (): Promise<ServerState | null> => {
    const response = await fetch('/api/state', { cache: 'no-store' });
    if (response.status === 404) return { data: null, version: 0 };
    if (!response.ok) throw new Error(`State fetch failed (${response.status})`);
    return await response.json() as ServerState;
  }, []);

  const putState = useCallback(async (data: Record<string, unknown>, baseVersion: number): Promise<ServerState | null> => {
    const response = await fetch('/api/state', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data, baseVersion }),
    });
    const result = await response.json() as ServerState & { error?: string };
    if (response.status === 409) return result;
    if (!response.ok) throw new Error(result.error ?? `State save failed (${response.status})`);
    return result;
  }, []);

  const pushLocal = useCallback(async (data: Record<string, unknown>, baseVersion: number) => {
    const result = await putState(data, baseVersion);
    if (!result || result.data === null) {
      setConflictState(data, result ?? { data: null, version: 0 });
      return false;
    }
    await markStateSynced(result.version);
    setLocalConflict(null);
    setConflict(null);
    setStatus('synced');
    return true;
  }, [putState, setConflictState]);

  const reconcile = useCallback(async () => {
    if (running.current || conflict) return;
    running.current = true;
    setStatus('syncing');
    try {
      const [server, local] = await Promise.all([fetchServer(), readAppState()]);
      const metadata = getSyncMetadata();

      if (!server || server.data === null) {
        await pushLocal(local, 0);
        return;
      }

      if (!metadata.initialized) {
        if (sameData(local, server.data)) {
          await markStateSynced(server.version);
          setStatus('synced');
        } else {
          setConflictState(local, server);
        }
        return;
      }

      if (metadata.hasUnsyncedChanges) {
        if (server.version === metadata.lastSyncedVersion) {
          await pushLocal(local, metadata.lastSyncedVersion);
        } else {
          setConflictState(local, server);
        }
        return;
      }

      if (server.version > metadata.lastSyncedVersion) {
        await replaceAppState(server.data);
        await markStateSynced(server.version);
        setStatus('synced');
      } else if (server.version === metadata.lastSyncedVersion) {
        setStatus('synced');
      } else {
        setConflictState(local, server);
      }
    } catch {
      setStatus(navigator.onLine ? 'offline' : 'offline');
    } finally {
      running.current = false;
    }
  }, [conflict, fetchServer, pushLocal, setConflictState]);

  useEffect(() => {
    let mounted = true;
    void seedIfEmpty().then(() => { if (mounted) void reconcile(); });
    const unsubscribe = subscribeStorageChanges(() => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => { void reconcile(); }, 2000);
    });
    const handleOnline = () => { void reconcile(); };
    const handleOffline = () => setStatus('offline');
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      mounted = false;
      unsubscribe();
      if (timer.current) clearTimeout(timer.current);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [reconcile]);

  const keepServer = async () => {
    if (!conflict?.data) return;
    setStatus('syncing');
    await replaceAppState(conflict.data);
    await markStateSynced(conflict.version);
    setLocalConflict(null);
    setConflict(null);
    setStatus('synced');
  };

  const keepDevice = async () => {
    if (!localConflict || !conflict) return;
    setStatus('syncing');
    const metadata: SyncMetadata = { ...getSyncMetadata(), hasUnsyncedChanges: true };
    saveSyncMetadata(metadata);
    await pushLocal(localConflict, conflict.version);
  };

  const exportBoth = async () => {
    if (!localConflict || !conflict?.data) return;
    const date = new Date().toISOString().slice(0, 10);
    const localJson = await exportData();
    try {
      saveJsonFile(`local-${date}.json`, JSON.parse(localJson) as Record<string, unknown>);
      saveJsonFile(`server-${date}.json`, conflict.data);
    } catch {
      setStatus('conflict');
    }
  };

  return (
    <SyncContext.Provider value={{ status }}>
      {children}
      {conflict && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-labelledby="sync-conflict-title">
          <div className="w-full max-w-md rounded-2xl border border-amber-500/30 bg-gray-950 p-6 shadow-2xl">
            <h2 id="sync-conflict-title" className="text-lg font-semibold text-gray-100">Sync conflict</h2>
            <p className="mt-2 text-sm text-gray-400">This device and the server have different data. Choose which copy to keep.</p>
            <div className="mt-5 grid gap-2">
              <button onClick={() => void keepServer()} className="min-h-11 rounded-lg bg-cyan-600 px-4 text-sm font-medium text-white hover:bg-cyan-500">Keep server</button>
              <button onClick={() => void keepDevice()} className="min-h-11 rounded-lg bg-violet-600 px-4 text-sm font-medium text-white hover:bg-violet-500">Keep this device</button>
              <button onClick={() => void exportBoth()} className="min-h-11 rounded-lg border border-gray-700 px-4 text-sm text-gray-200 hover:bg-gray-800">Export both</button>
            </div>
          </div>
        </div>
      )}
      <div aria-live="polite" className={`fixed bottom-3 right-3 z-40 rounded-full border px-2.5 py-1 text-[11px] font-medium shadow-lg ${status === 'synced' ? 'border-emerald-500/30 bg-gray-950 text-emerald-300' : status === 'conflict' ? 'border-amber-500/40 bg-gray-950 text-amber-300' : status === 'offline' ? 'border-gray-600 bg-gray-950 text-gray-400' : 'border-cyan-500/30 bg-gray-950 text-cyan-300'}`}>
        {STATUS_LABEL[status]}
      </div>
    </SyncContext.Provider>
  );
}
