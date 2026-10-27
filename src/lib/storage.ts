import {
  db,
  decrementDone as decrementDsaTopic,
  exportData as exportLocalData,
  getCombinedStreak as getLocalCombinedStreak,
  getDailyNewQuota as getLocalDailyNewQuota,
  getDailyNewQuotaDetails as getLocalDailyNewQuotaDetails,
  getDailyWebdevTarget as getLocalDailyWebdevTarget,
  getDsaRevisionTasks as getLocalDsaRevisionTasks,
  getDsaWeekProgress as getLocalDsaWeekProgress,
  getDsaWeeklyRevisionReview as getLocalDsaWeeklyRevisionReview,
  getSetting as getLocalSetting,
  importData as importLocalData,
  incrementDone as incrementDsaTopic,
  incrementDsaRevision as incrementLocalDsaRevision,
  isWebDevPhaseLocked,
  markDsaTopicComplete as markLocalDsaTopicComplete,
  markTodayWebdev as markLocalTodayWebdev,
  resetDsaToSeed as resetLocalDsaToSeed,
  resetWebdevToSeed as resetLocalWebdevToSeed,
  seedIfEmpty as seedLocalIfEmpty,
  setDsaTopicDone as setLocalDsaTopicDone,
  setGraphRevisionChecklistItem as setLocalGraphRevisionChecklistItem,
  setSetting as setLocalSetting,
  daysUntil,
  linearPlanFraction,
  toLocalDateString,
  type DsaChecklistItem,
  type DsaRevisionTask,
  type DsaTopic,
  type StreakDay,
  type WebDevTopic,
} from './localDb';

export type {
  AppSettings,
  DsaChecklistItem,
  DsaQuotaDetails,
  DsaRevisionPass,
  DsaRevisionStatus,
  DsaRevisionTask,
  DsaTopic,
  StreakDay,
  WebDevDifficulty,
  WebDevImportance,
  WebDevStatus,
  WebDevTopic,
  WebdevTargetDetails,
} from './localDb';

type StorageChangeListener = () => void;
const changeListeners = new Set<StorageChangeListener>();
const SYNC_META_KEY = 'prep-dashboard-sync-v1';

export interface SyncMetadata {
  lastSyncedVersion: number;
  hasUnsyncedChanges: boolean;
  initialized: boolean;
}

export function getSyncMetadata(): SyncMetadata {
  if (typeof window === 'undefined') return { lastSyncedVersion: 0, hasUnsyncedChanges: false, initialized: false };
  try {
    const stored = window.localStorage.getItem(SYNC_META_KEY);
    return stored ? { ...JSON.parse(stored) as SyncMetadata } : { lastSyncedVersion: 0, hasUnsyncedChanges: false, initialized: false };
  } catch {
    return { lastSyncedVersion: 0, hasUnsyncedChanges: false, initialized: false };
  }
}

export function saveSyncMetadata(metadata: SyncMetadata): void {
  if (typeof window !== 'undefined') window.localStorage.setItem(SYNC_META_KEY, JSON.stringify(metadata));
}

export function subscribeStorageChanges(listener: StorageChangeListener): () => void {
  changeListeners.add(listener);
  return () => changeListeners.delete(listener);
}

function notifyStorageChanged(): void {
  changeListeners.forEach(listener => listener());
}

async function write<T>(operation: () => Promise<T>): Promise<T> {
  const result = await operation();
  const metadata = getSyncMetadata();
  saveSyncMetadata({ ...metadata, hasUnsyncedChanges: true });
  notifyStorageChanged();
  return result;
}

export function seedIfEmpty(): Promise<void> {
  return seedLocalIfEmpty();
}

export async function readAppState(): Promise<Record<string, unknown>> {
  return JSON.parse(await exportLocalData()) as Record<string, unknown>;
}

export async function replaceAppState(data: Record<string, unknown>): Promise<void> {
  await importLocalData(JSON.stringify(data));
}

export async function markStateSynced(version: number): Promise<void> {
  saveSyncMetadata({ lastSyncedVersion: version, hasUnsyncedChanges: false, initialized: true });
}

export function markStatePending(): void {
  const metadata = getSyncMetadata();
  saveSyncMetadata({ ...metadata, hasUnsyncedChanges: true });
}

export async function getDsaTopics(): Promise<DsaTopic[]> {
  return db.dsaTopics.toArray();
}

export async function getWebDevTopics(): Promise<WebDevTopic[]> {
  return db.webdevTopics.orderBy('order').toArray();
}

export async function getTodayStreakDay(date: string): Promise<StreakDay | undefined> {
  return db.streakDays.where('date').equals(date).first();
}

export async function getDsaChecklistItems(): Promise<DsaChecklistItem[]> {
  return db.dsaChecklistItems.toArray();
}

export async function getDsaRevisionRecords(): Promise<DsaRevisionTask[]> {
  return db.dsaRevisions.toArray();
}

export async function getPlaceholderProofTopics(): Promise<WebDevTopic[]> {
  return db.webdevTopics.filter(topic =>
    topic.proofLink === 'Completed via dashboard one-click' || topic.breakFixNote === 'Completed'
  ).toArray();
}

export function updateWebDevTopic(id: number, changes: Partial<WebDevTopic>): Promise<number> {
  return write(() => db.webdevTopics.update(id, changes));
}

export function updateDsaChecklistItem(id: number, changes: Partial<DsaChecklistItem>): Promise<number> {
  return write(() => db.dsaChecklistItems.update(id, changes));
}

export function updateDsaRevisionTask(id: number, changes: Partial<DsaRevisionTask>): Promise<number> {
  return write(() => db.dsaRevisions.update(id, changes));
}

export function setSetting(key: string, value: string): Promise<void> {
  return write(() => setLocalSetting(key, value));
}

export function incrementDone(topicId: number): Promise<void> {
  return write(() => incrementDsaTopic(topicId));
}

export function decrementDone(topicId: number): Promise<void> {
  return write(() => decrementDsaTopic(topicId));
}

export function setDsaTopicDone(topicId: number, done: number): Promise<void> {
  return write(() => setLocalDsaTopicDone(topicId, done));
}

export function markDsaTopicComplete(topicId: number): Promise<void> {
  return write(() => markLocalDsaTopicComplete(topicId));
}

export function incrementDsaRevision(taskId: number): Promise<void> {
  return write(() => incrementLocalDsaRevision(taskId));
}

export function setGraphRevisionChecklistItem(item: DsaChecklistItem, done: boolean): Promise<void> {
  return write(() => setLocalGraphRevisionChecklistItem(item, done));
}

export function markTodayWebdev(): Promise<void> {
  return write(() => markLocalTodayWebdev());
}

export function getSetting(key: string, fallback = ''): Promise<string> {
  return getLocalSetting(key, fallback);
}

export function getCombinedStreak(): Promise<number> {
  return getLocalCombinedStreak();
}

export function getDailyNewQuota(): Promise<number> {
  return getLocalDailyNewQuota();
}

export function getDailyNewQuotaDetails() {
  return getLocalDailyNewQuotaDetails();
}

export function getDailyWebdevTarget() {
  return getLocalDailyWebdevTarget();
}

export function getDsaRevisionTasks(): Promise<DsaRevisionTask[]> {
  return write(() => getLocalDsaRevisionTasks());
}

export function getDsaWeekProgress() {
  return getLocalDsaWeekProgress();
}

export function getDsaWeeklyRevisionReview() {
  return getLocalDsaWeeklyRevisionReview();
}

export function resetDsaToSeed(): Promise<void> {
  return write(() => resetLocalDsaToSeed());
}

export function resetWebdevToSeed(): Promise<void> {
  return write(() => resetLocalWebdevToSeed());
}

export function exportData(): Promise<string> {
  return exportLocalData();
}

export function importData(json: string): Promise<void> {
  return write(() => importLocalData(json));
}

export { daysUntil, isWebDevPhaseLocked, linearPlanFraction, toLocalDateString };
