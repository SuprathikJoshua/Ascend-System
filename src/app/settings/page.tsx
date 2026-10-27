'use client';

import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { seedIfEmpty, getSetting, setSetting, exportData, importData, resetDsaToSeed, resetWebdevToSeed, getPlaceholderProofTopics, updateWebDevTopic } from '@/lib/storage';
import { Save, Download, Upload, Settings as SettingsIcon, AlertCircle, AlertTriangle, Calendar, CheckCircle2 } from 'lucide-react';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function SettingsPage() {
  const [seeded, setSeeded] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const placeholderProofTopics = useLiveQuery(
    () => getPlaceholderProofTopics(),
    [],
  );

  const SETTING_KEYS = [
    'dsa_start',
    'dsa_solve_deadline',
    'dsa_final_deadline',
    'dsa_days',
    'dsa_daily_minutes',
    'webdev_deadline',
    'webdev_days',
    'webdev_daily_minutes',
    'ai_status',
    'last_exported_at',
  ];

  const loadSettings = async () => {
    const pairs = await Promise.all(
      SETTING_KEYS.map(k => getSetting(k).then(v => [k, v] as [string, string]))
    );
    setValues(Object.fromEntries(pairs));
  };

  useEffect(() => {
    seedIfEmpty().then(async () => {
      setSeeded(true);
      await loadSettings();
    });
  }, []);

  const handleChange = (key: string, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    await Promise.all(
      Object.entries(values).map(([k, v]) => setSetting(k, v))
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = async () => {
    const nowIso = new Date().toISOString();
    await setSetting('last_exported_at', nowIso);
    setValues(prev => ({ ...prev, last_exported_at: nowIso }));

    const json = await exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prep-dashboard-backup-${nowIso.slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    setImportError(null);
    setImportSuccess(false);
    try {
      await importData(importText);
      setImportSuccess(true);
      setImportText('');
      await loadSettings();
    } catch (e) {
      setImportError(`Import failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    window.location.assign('/login');
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setImportText(ev.target?.result as string);
    reader.readAsText(file);
  };

  const resetPlaceholderTopic = async (id: number) => {
    await updateWebDevTopic(id, {
      status: 'learning',
      proofLink: undefined,
      breakFixNote: undefined,
      doneAt: undefined,
    });
  };

  const resetAllPlaceholderTopics = async () => {
    await Promise.all((placeholderProofTopics ?? []).flatMap(topic =>
      topic.id === undefined ? [] : [resetPlaceholderTopic(topic.id)]
    ));
  };

  if (!seeded) {
    return <div className="flex items-center justify-center h-64 text-gray-500 animate-pulse">Loading settings…</div>;
  }

  const dsaDaysValue = values.dsa_days || 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday';
  const webdevDaysValue = values.webdev_days || 'Tuesday,Thursday,Saturday';
  const webdevDeadline = values.webdev_deadline || '';
  const lastExported = values.last_exported_at;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <SettingsIcon className="text-violet-400" size={24} />
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Settings</h1>
          <p className="text-gray-500 text-xs mt-0.5">Configure schedules, deadlines, targets, and data backups.</p>
        </div>
      </div>

      {/* 1. Schedule & Days Config */}
      <div className="glass rounded-xl p-5 space-y-5">
        <div>
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <Calendar size={16} className="text-violet-400" /> Day-Based Schedule
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Choose which days each tracker is active. Sunday is catch-up only for both (no new topics).
          </p>
        </div>

        {/* DSA Days */}
        <DaySelector
          label="DSA Active Days (Mon–Sat)"
          hint="Daily solve quota is distributed over these days"
          value={dsaDaysValue}
          onChange={val => handleChange('dsa_days', val)}
          activeColor="violet"
        />

        {/* Web Dev Days */}
        <DaySelector
          label="Web Dev Active Days"
          hint="Web dev card is active on these days; off-day on others"
          value={webdevDaysValue}
          onChange={val => handleChange('webdev_days', val)}
          activeColor="cyan"
        />

        {/* Sunday info box */}
        <div className="bg-gray-900/60 rounded-lg p-3 border border-gray-800 text-xs text-gray-400 flex items-center gap-2">
          <Calendar size={15} className="text-amber-400 shrink-0" />
          <span>
            <strong className="text-gray-300">Sunday Catch-up Rule:</strong> Both trackers pause new quotas on Sundays for revisions and backlog catch-up. Sunday does not break your streak and does not extend it.
          </span>
        </div>

        {/* Daily Minutes Display Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-800">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              DSA Daily Target Minutes <span className="text-gray-600">(optional, display only)</span>
            </label>
            <input
              type="number"
              value={values.dsa_daily_minutes ?? ''}
              onChange={e => handleChange('dsa_daily_minutes', e.target.value)}
              placeholder="e.g. 120"
              className="min-h-11 w-full text-sm rounded-lg bg-gray-900 border border-gray-700 text-gray-200 px-3 py-2 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Web Dev Daily Target Minutes <span className="text-gray-600">(optional, display only)</span>
            </label>
            <input
              type="number"
              value={values.webdev_daily_minutes ?? ''}
              onChange={e => handleChange('webdev_daily_minutes', e.target.value)}
              placeholder="e.g. 90"
              className="min-h-11 w-full text-sm rounded-lg bg-gray-900 border border-gray-700 text-gray-200 px-3 py-2 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* 2. DSA Deadlines */}
      <div className="glass rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">DSA Deadlines</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Start Date</label>
            <input
              type="date"
              min="2026-01-01"
              max="2035-12-31"
              value={values.dsa_start ?? ''}
              onChange={e => handleChange('dsa_start', e.target.value)}
              className="min-h-11 w-full text-sm rounded-lg bg-gray-900 border border-gray-700 text-gray-200 px-3 py-2 focus:outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Solve Deadline</label>
            <input
              type="date"
              min="2026-01-01"
              max="2035-12-31"
              value={values.dsa_solve_deadline ?? ''}
              onChange={e => handleChange('dsa_solve_deadline', e.target.value)}
              className="min-h-11 w-full text-sm rounded-lg bg-gray-900 border border-gray-700 text-gray-200 px-3 py-2 focus:outline-none focus:border-violet-500"
            />
            <span className="text-[10px] text-gray-500">All new problems solved by this date</span>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Final Deadline</label>
            <input
              type="date"
              min="2026-01-01"
              max="2035-12-31"
              value={values.dsa_final_deadline ?? ''}
              onChange={e => handleChange('dsa_final_deadline', e.target.value)}
              className="min-h-11 w-full text-sm rounded-lg bg-gray-900 border border-gray-700 text-gray-200 px-3 py-2 focus:outline-none focus:border-violet-500"
            />
            <span className="text-[10px] text-gray-500">Full revision completed</span>
          </div>
        </div>
      </div>

      {/* 3. Web Dev Deadline (Required) */}
      <div className={`glass rounded-xl p-5 space-y-4 border ${!webdevDeadline ? 'border-amber-500/40 glow-amber' : 'border-gray-800'}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
            Web Dev Deadline <span className="text-rose-400 text-xs font-bold">* Required</span>
          </h2>
          {!webdevDeadline && (
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center gap-1">
              <AlertCircle size={12} /> Set to calculate daily target
            </span>
          )}
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">
            Web Dev Target Deadline Date <span className="text-rose-400">*</span>
          </label>
          <input
            type="date"
            required
            min="2026-01-01"
            max="2035-12-31"
            value={webdevDeadline}
            onChange={e => handleChange('webdev_deadline', e.target.value)}
            className="min-h-11 w-full text-sm rounded-lg bg-gray-900 border border-gray-700 text-gray-200 px-3 py-2 focus:outline-none focus:border-cyan-500 transition-colors"
          />
          <p className="text-xs text-gray-500 mt-1">
            Target points per day = remaining difficulty-weighted points ÷ remaining active webdev days.
          </p>
        </div>
      </div>

      <div className="glass rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">AI Internship</h2>
        <label htmlFor="ai-status" className="block text-xs text-gray-400">Status</label>
        <select
          id="ai-status"
          value={values.ai_status || 'parked'}
          onChange={event => handleChange('ai_status', event.target.value)}
          className="min-h-11 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-cyan-500 focus:outline-none"
        >
          <option value="parked">Parked</option>
          <option value="active">Active</option>
        </select>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg ${
          saved
            ? 'bg-emerald-600/20 border border-emerald-500/30 text-emerald-400'
            : 'bg-violet-600 hover:bg-violet-500 text-white'
        }`}
      >
        <Save size={16} />
        {saved ? 'Saved ✓' : 'Save Settings'}
      </button>

      {/* 5. Data Management & Export Backup */}
      <div className="glass rounded-xl p-5 space-y-4 border border-amber-500/20">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-amber-300 uppercase tracking-wider">Placeholder proof check</h2>
            <p className="text-xs text-gray-500 mt-1">Checks for proof values created by the dashboard one-click bug. No data changes until you reset a listed topic.</p>
          </div>
          {(placeholderProofTopics?.length ?? 0) > 0 && (
            <button
              onClick={resetAllPlaceholderTopics}
              className="min-h-11 shrink-0 px-3 rounded-lg text-xs font-medium border border-rose-500/30 text-rose-300 hover:bg-rose-500/10 transition-colors"
            >
              Reset all listed
            </button>
          )}
        </div>
        {placeholderProofTopics === undefined ? (
          <p className="text-xs text-gray-500">Scanning web development topics…</p>
        ) : placeholderProofTopics.length === 0 ? (
          <p className="text-xs text-emerald-400">No placeholder proof values found.</p>
        ) : (
          <ul className="divide-y divide-gray-800/60">
            {placeholderProofTopics.map(topic => (
              <li key={topic.id} className="flex items-center justify-between gap-3 py-2">
                <span className="text-sm text-gray-200">{topic.name}</span>
                <button
                  onClick={() => topic.id !== undefined && resetPlaceholderTopic(topic.id)}
                  className="min-h-11 shrink-0 px-3 rounded-lg text-xs border border-rose-500/30 text-rose-300 hover:bg-rose-500/10 transition-colors"
                >
                  Reset to Learning
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 5. Data Management & Export Backup */}
      <div className="glass rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Data Management</h2>
          <span className="text-xs text-gray-500">
            {lastExported
              ? `Last exported: ${new Date(lastExported).toLocaleDateString()} ${new Date(lastExported).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              : 'Never exported'}
          </span>
        </div>

        <button
          onClick={handleExport}
          className="min-h-11 w-full flex items-center justify-center gap-2 rounded-lg border border-gray-700 bg-gray-900/60 hover:bg-gray-800 text-gray-200 transition-colors text-sm font-medium"
        >
          <Download size={15} className="text-violet-400" /> Export JSON Backup
        </button>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Import Backup from JSON</label>
          <div className="flex gap-2 mb-2">
            <label className="min-h-11 flex-1 flex items-center justify-center gap-2 rounded-lg border border-dashed border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200 cursor-pointer transition-colors text-sm">
              <Upload size={14} /> Choose JSON file
              <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
            </label>
          </div>
          <textarea
            value={importText}
            onChange={e => setImportText(e.target.value)}
            placeholder="Or paste JSON backup here…"
            rows={4}
            className="w-full text-xs rounded-lg bg-gray-900 border border-gray-700 text-gray-300 placeholder-gray-600 px-3 py-2 resize-none focus:outline-none focus:border-violet-500 transition-colors"
          />
          {importError && (
            <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
              <AlertCircle size={12} /> {importError}
            </p>
          )}
          {importSuccess && (
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 size={12} /> Import successful! All data restored.
            </p>
          )}
          <button
            onClick={handleImport}
            disabled={!importText.trim()}
            className="mt-2 min-h-11 w-full rounded-lg text-sm bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Import (overwrites all data)
          </button>
        </div>
      </div>

      {/* 6. Danger Zone */}
      <div className="glass rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Account</h2>
        <button onClick={handleLogout} className="mt-3 min-h-11 w-full rounded-lg border border-gray-700 px-4 text-sm text-gray-200 transition-colors hover:bg-gray-800">
          Log out
        </button>
      </div>

      <div className="glass rounded-xl p-5 border border-rose-500/20">
        <h2 className="text-sm font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-2 mb-3">
          <AlertTriangle size={14} /> Danger Zone
        </h2>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-500 mb-1.5">
              Reset DSA topics back to seed data (clears topic progress and settings). Graph checklists, web dev topics, and streak data are preserved.
            </p>
            <button
              onClick={async () => {
                if (window.confirm('This will reset all DSA topics to initial seed data and wipe your settings. Continue?')) {
                  await resetDsaToSeed();
                  await loadSettings();
                  alert('DSA reset complete.');
                }
              }}
              className="min-h-11 w-full rounded-lg text-sm border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              Reset DSA Topics to Seed Data
            </button>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-1.5">
              Reset Web Dev topics back to initial backend roadmap (Phases 0–8). DSA data and streaks are preserved.
            </p>
            <button
              onClick={async () => {
                if (window.confirm('This will reset all Web Dev topics to initial roadmap seed data. Continue?')) {
                  await resetWebdevToSeed();
                  alert('Web Dev reset complete.');
                }
              }}
              className="min-h-11 w-full rounded-lg text-sm border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition-colors"
            >
              Reset Web Dev Topics to Roadmap Seed Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DaySelector({
  value,
  onChange,
  label,
  hint,
  activeColor,
}: {
  value: string;
  onChange: (val: string) => void;
  label: string;
  hint?: string;
  activeColor: 'violet' | 'cyan';
}) {
  const selected = new Set(value.split(',').map(s => s.trim()).filter(Boolean));

  const toggleDay = (day: string) => {
    const next = new Set(selected);
    if (next.has(day)) {
      if (next.size > 1) next.delete(day);
    } else {
      next.add(day);
    }
    const sorted = WEEKDAYS.filter(d => next.has(d));
    onChange(sorted.join(','));
  };

  const activeClass = activeColor === 'violet'
    ? 'bg-violet-600/30 border-violet-500 text-violet-200'
    : 'bg-cyan-600/30 border-cyan-500 text-cyan-200';

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1.5">
        <label className="text-xs font-medium text-gray-300">{label}</label>
        {hint && <span className="text-[11px] text-gray-500">{hint}</span>}
      </div>
      <div className="flex flex-wrap gap-2">
        {WEEKDAYS.map(day => {
          const isSelected = selected.has(day);
          return (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              className={`min-h-11 min-w-11 px-3 rounded-lg text-xs font-semibold border transition-all ${
                isSelected
                  ? activeClass
                  : 'bg-gray-900 border-gray-800 text-gray-500 hover:text-gray-300 hover:border-gray-700'
              }`}
            >
              {day.slice(0, 3)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
