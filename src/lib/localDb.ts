import Dexie, { type EntityTable } from 'dexie';
import { currentDsaWeek, dsaWeekKey } from './dsaPlan';
import { AI_WEEK_SEED } from './aiPlan';

// ── DSA ──────────────────────────────────────────────────────────────────────

export interface DsaTopic {
  id?: number;
  name: string;
  total: number;
  done: number;
  completedAt?: string;
}

// ── Web Dev ───────────────────────────────────────────────────────────────────

export type WebDevStatus = 'todo' | 'learning' | 'built' | 'done';
export type WebDevDifficulty = 'Easy' | 'Medium' | 'Hard';
export type WebDevImportance = 'Critical' | 'Core' | 'High' | 'Medium' | 'Low' | 'Low–Medium';

export interface WebDevTopic {
  id?: number;
  phase: number; // 0-8
  name: string;
  difficulty: WebDevDifficulty;
  importance: WebDevImportance;
  practical: boolean | 'optional'; // true = yes, false = no, 'optional' = optional
  resourceLinks?: string; // JSON array of {label, url}
  status: WebDevStatus;
  notes?: string;
  startedAt?: string;
  doneAt?: string;
  // Required when practical=true and status moves to done:
  proofLink?: string;
  breakFixNote?: string;
  order: number; // within phase
}

// ── Settings ──────────────────────────────────────────────────────────────────

export interface AppSettings {
  id?: number;
  key: string;
  value: string;
}

// ── Streak ────────────────────────────────────────────────────────────────────

export interface StreakDay {
  id?: number;
  date: string; // YYYY-MM-DD
  dsaDone: boolean;
  webdevDone: boolean;
}

export interface AiPlanItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface AiResource {
  label: string;
  url?: string;
}

export interface AiWeek {
  id?: number;
  week: number;
  title: string;
  goal: string;
  resources: AiResource[];
  steps: AiPlanItem[];
  projectName: string;
  projectItems: AiPlanItem[];
  proofLink: string;
  resultsNotes: string;
}

export type AiWeekEditableFields = Pick<AiWeek, 'proofLink' | 'resultsNotes'>;

export type DsaRevisionPass = 'R1' | 'R2' | 'Final';
export type DsaRevisionStatus = 'open' | 'done' | 'collapsed';

export interface DsaRevisionTask {
  id?: number;
  topicName: string;
  pass: DsaRevisionPass;
  dueDate: string;
  target: number;
  completed: number;
  status: DsaRevisionStatus;
  whichProblems?: string;
  completedAt?: string;
  collapsedAt?: string;
}

// ── DB ────────────────────────────────────────────────────────────────────────

class PrepDB extends Dexie {
  dsaTopics!: EntityTable<DsaTopic, 'id'>;
  webdevTopics!: EntityTable<WebDevTopic, 'id'>;
  settings!: EntityTable<AppSettings, 'id'>;
  streakDays!: EntityTable<StreakDay, 'id'>;
  dsaRevisions!: EntityTable<DsaRevisionTask, 'id'>;
  aiWeeks!: EntityTable<AiWeek, 'id'>;

  constructor() {
    super('PrepDashboard');
    this.version(1).stores({
      dsaTopics: '++id, name, phase, order',
      dsaProblems: '++id, topicId, status, reviseFlag, revision1Due, revision2Due',
      webdevTopics: '++id, phase, status, practical, order',
      settings: '++id, &key',
      streakDays: '++id, &date',
    });
    this.version(2).stores({
      dsaTopics: '++id, name',
      dsaProblems: null,
      webdevTopics: '++id, phase, status, practical, order',
      settings: '++id, &key',
      streakDays: '++id, &date',
      dsaChecklistItems: '++id, list, order',
    }).upgrade(async transaction => {
      await transaction.table('dsaTopics').toCollection().modify(topic => {
        const row = topic as DsaTopic & { phase?: string; order?: number };
        delete row.phase;
        delete row.order;
      });
    });
    this.version(3).stores({
      dsaTopics: '++id, name',
      webdevTopics: '++id, phase, status, practical, order',
      settings: '++id, &key',
      streakDays: '++id, &date',
      dsaChecklistItems: '++id, list, order',
      dsaRevisions: '++id, topicName, pass, dueDate, status, completedAt, collapsedAt',
    });
    this.version(4).stores({
      dsaTopics: '++id, name',
      webdevTopics: '++id, phase, status, practical, order',
      settings: '++id, &key',
      streakDays: '++id, &date',
      dsaChecklistItems: null,
      dsaRevisions: '++id, topicName, pass, dueDate, status, completedAt, collapsedAt',
    }).upgrade(async transaction => {
      await transaction.table('settings').where('key').anyOf('graph_revision_per_week', 'graph_flagged_total').delete();
    });
    this.version(5).stores({
      dsaTopics: '++id, name',
      webdevTopics: '++id, phase, status, practical, order',
      settings: '++id, &key',
      streakDays: '++id, &date',
      dsaRevisions: '++id, topicName, pass, dueDate, status, completedAt, collapsedAt',
      aiWeeks: '++id, &week',
    });
  }
}

export const db = new PrepDB();

// ── Seed data ─────────────────────────────────────────────────────────────────

const DSA_SEED: Omit<DsaTopic, 'id'>[] = [
  { name: 'Beginner Problems', total: 83, done: 20 },
  { name: 'Sorting', total: 7, done: 0 },
  { name: 'Hashing', total: 6, done: 2 },
  { name: 'Strings Basic', total: 7, done: 1 },
  { name: 'Arrays', total: 32, done: 0 },
  { name: 'Binary Search', total: 32, done: 0 },
  { name: 'Recursion', total: 22, done: 0 },
  { name: 'Bit Manipulation', total: 14, done: 0 },
  { name: 'Linked-List', total: 49, done: 0 },
  { name: 'Stack-Queues', total: 31, done: 5 },
  { name: 'Sliding Window', total: 13, done: 0 },
  { name: 'Graphs', total: 46, done: 39 },
  { name: 'Heaps', total: 20, done: 0 },
  { name: 'Greedy', total: 14, done: 0 },
  { name: 'Binary Trees', total: 32, done: 0 },
  { name: 'BST', total: 15, done: 0 },
  { name: 'DP', total: 53, done: 0 },
  { name: 'Tries', total: 7, done: 0 },
  { name: 'Strings Advanced', total: 9, done: 0 },
  { name: 'Maths', total: 3, done: 0 },
];

const AI_WEEK_DATA_SEED: Omit<AiWeek, 'id'>[] = AI_WEEK_SEED.map(week => ({
  ...week,
  steps: week.steps.map((label, index) => ({ id: `w${week.week}-step-${index + 1}`, label, checked: false })),
  projectItems: week.projectItems.map((label, index) => ({ id: `w${week.week}-project-${index + 1}`, label, checked: false })),
}));

const DEFAULT_SETTINGS: { key: string; value: string }[] = [
  { key: 'dsa_start', value: '2026-10-24' },
  { key: 'dsa_solve_deadline', value: '2027-02-13' },
  { key: 'dsa_final_deadline', value: '2027-02-28' },
  { key: 'dsa_days', value: 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday' },
  { key: 'dsa_daily_minutes', value: '' },
  { key: 'webdev_deadline', value: '2027-01-31' },
  { key: 'webdev_days', value: 'Tuesday,Thursday,Saturday' },
  { key: 'webdev_daily_minutes', value: '' },
  { key: 'ai_status', value: 'parked' },
  { key: 'last_exported_at', value: '' },
];

import { WEBDEV_SEED } from './webdevSeed';

let seedPromise: Promise<void> | null = null;

export function seedIfEmpty(): Promise<void> {
  if (seedPromise) return seedPromise;
  seedPromise = (async () => {
    await db.transaction('rw', [db.dsaTopics, db.webdevTopics, db.settings, db.dsaRevisions, db.aiWeeks], async () => {
      // 1. DSA Topics
      const allTopics = await db.dsaTopics.toArray();
      if (allTopics.length === 0) {
        await db.dsaTopics.bulkAdd(DSA_SEED);
      } else {
        // Automatic deduplication: if topics were duplicated by React dev-mode double-run, delete extras
        const seenNames = new Set<string>();
        const toDelete: number[] = [];
        for (const t of allTopics) {
          if (seenNames.has(t.name)) {
            if (t.id !== undefined) toDelete.push(t.id);
          } else {
            seenNames.add(t.name);
          }
        }
        if (toDelete.length > 0) {
          await db.dsaTopics.bulkDelete(toDelete);
        }
      }

      await seedFinalRevisionTasks();

      if ((await db.aiWeeks.count()) === 0) {
        await db.aiWeeks.bulkAdd(AI_WEEK_DATA_SEED);
      }

      // 2. Web Dev Topics
      const allWdTopics = await db.webdevTopics.toArray();
      if (allWdTopics.length === 0) {
        await db.webdevTopics.bulkAdd(WEBDEV_SEED);
      } else {
        const seen = new Set<string>();
        const toDeleteWd: number[] = [];
        for (const t of allWdTopics) {
          const key = `${t.phase}:${t.name}`;
          if (seen.has(key)) {
            if (t.id !== undefined) toDeleteWd.push(t.id);
          } else {
            seen.add(key);
          }
        }
        if (toDeleteWd.length > 0) {
          await db.webdevTopics.bulkDelete(toDeleteWd);
        }
      }

      // 3. Settings
      for (const s of DEFAULT_SETTINGS) {
        const existing = await db.settings.where('key').equals(s.key).first();
        if (!existing) {
          await db.settings.add(s);
        }
      }

      // Migrate older installs whose required deadline was seeded as blank.
      const deadlineDefaultMarker = await db.settings.where('key').equals('webdev_deadline_defaulted_v1').first();
      if (!deadlineDefaultMarker) {
        const deadline = await db.settings.where('key').equals('webdev_deadline').first();
        if (deadline && !deadline.value) {
          await db.settings.update(deadline.id!, { value: '2027-01-31' });
        }
        await db.settings.add({ key: 'webdev_deadline_defaulted_v1', value: 'true' });
      }

      // Sanitize any corrupt webdev_deadline date with year > 2099
      const wdDeadline = await db.settings.where('key').equals('webdev_deadline').first();
      if (wdDeadline && wdDeadline.value) {
        const y = parseInt(wdDeadline.value.split('-')[0], 10);
        if (isNaN(y) || y > 2099 || y < 2026) {
          await db.settings.update(wdDeadline.id!, { value: '2027-01-31' });
        }
      }
    });
  })();
  return seedPromise;
}

/** Wipe DSA topics, settings, and revision progress then re-seed from scratch. Preserves checklists, webdev topics, and streaks. */
export async function resetDsaToSeed(): Promise<void> {
  seedPromise = null;
  await db.transaction('rw', [db.dsaTopics, db.settings, db.dsaRevisions], async () => {
    await db.dsaTopics.clear();
    await db.settings.clear();
    await db.dsaRevisions.clear();
  });
  await seedIfEmpty();
}

/** Wipe Web Dev topics then re-seed from roadmap. */
export async function resetWebdevToSeed(): Promise<void> {
  seedPromise = null;
  await db.transaction('rw', [db.webdevTopics], async () => {
    await db.webdevTopics.clear();
  });
  await seedIfEmpty();
}

export async function getSetting(key: string, fallback = ''): Promise<string> {
  const row = await db.settings.where('key').equals(key).first();
  return row?.value ?? fallback;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const existing = await db.settings.where('key').equals(key).first();
  if (existing?.id !== undefined) {
    await db.settings.update(existing.id, { value });
  } else {
    await db.settings.add({ key, value });
  }
}

export async function getAiWeeks(): Promise<AiWeek[]> {
  return db.aiWeeks.orderBy('week').toArray();
}

export async function setAiWeekItemChecked(weekNumber: number, itemId: string, checked: boolean): Promise<void> {
  const week = await db.aiWeeks.where('week').equals(weekNumber).first();
  if (!week?.id) return;
  const steps = week.steps.map(item => item.id === itemId ? { ...item, checked } : item);
  const projectItems = week.projectItems.map(item => item.id === itemId ? { ...item, checked } : item);
  await db.aiWeeks.update(week.id, { steps, projectItems });
}

export async function updateAiWeekFields(weekNumber: number, changes: Partial<AiWeekEditableFields>): Promise<void> {
  const week = await db.aiWeeks.where('week').equals(weekNumber).first();
  if (week?.id !== undefined) await db.aiWeeks.update(week.id, changes);
}

export async function incrementDone(topicId: number): Promise<void> {
  const topic = await db.dsaTopics.get(topicId);
  if (!topic || topic.done >= topic.total) return;
  await db.dsaTopics.update(topicId, { done: topic.done + 1 });
  await updateDsaWeekDone(1);
  await markTodayDsa();
}

export async function markDsaTopicComplete(topicId: number): Promise<void> {
  const topic = await db.dsaTopics.get(topicId);
  if (!topic || topic.completedAt) return;
  const completedAt = toLocalDateString();
  await db.transaction('rw', [db.dsaTopics, db.dsaRevisions], async () => {
    await db.dsaTopics.update(topicId, { completedAt });
    const existing = await db.dsaRevisions.where('topicName').equals(topic.name).toArray();
    if (!existing.some(task => task.pass === 'R1')) {
      await db.dsaRevisions.add({
        topicName: topic.name,
        pass: 'R1',
        dueDate: addDaysToIsoDate(completedAt, 7),
        target: 3,
        completed: 0,
        status: 'open',
      });
    }
    if (!existing.some(task => task.pass === 'R2')) {
      await db.dsaRevisions.add({
        topicName: topic.name,
        pass: 'R2',
        dueDate: addDaysToIsoDate(completedAt, 30),
        target: 3,
        completed: 0,
        status: 'open',
      });
    }
  });
}

export async function incrementDsaRevision(taskId: number): Promise<void> {
  const task = await db.dsaRevisions.get(taskId);
  if (!task || task.status === 'done' || task.completed >= task.target) return;
  const completed = Math.min(task.target, task.completed + 1);
  const done = completed >= task.target;
  await db.dsaRevisions.update(taskId, {
    completed,
    status: done ? 'done' : task.collapsedAt ? 'collapsed' : 'open',
    completedAt: done ? toLocalDateString() : undefined,
  });
}

export async function getDsaRevisionTasks(): Promise<DsaRevisionTask[]> {
  const tasks = await db.dsaRevisions.toArray();
  const today = toLocalDateString();
  const collapsed = tasks.filter(task => task.status === 'open' && task.dueDate < today && daysUntil(task.dueDate) < -14 && task.id !== undefined);
  if (collapsed.length > 0) {
    await db.transaction('rw', [db.dsaRevisions], async () => {
      await Promise.all(collapsed.map(task => db.dsaRevisions.update(task.id!, { status: 'collapsed', collapsedAt: today })));
    });
  }
  return collapsed.length > 0
    ? db.dsaRevisions.toArray()
    : tasks;
}

export async function getDsaWeeklyRevisionReview(): Promise<{ done: number; missed: number; collapsed: number }> {
  const tasks = await db.dsaRevisions.toArray();
  const startIso = await getSetting('dsa_start', '2026-10-24');
  const week = currentDsaWeek(startIso);
  const start = new Date(`${startIso}T00:00:00`);
  start.setDate(start.getDate() + (week - 1) * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const startDate = toLocalDateString(start);
  const endDate = toLocalDateString(end);
  const today = toLocalDateString();
  const done = tasks.filter(task => task.completedAt && task.completedAt >= startDate && task.completedAt <= endDate).length;
  const missed = tasks.filter(task => task.dueDate >= startDate && task.dueDate <= today && task.status !== 'done').length;
  const collapsed = tasks.filter(task => Boolean(task.collapsedAt)).length;
  return { done, missed, collapsed };
}

function addDaysToIsoDate(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toLocalDateString(date);
}

async function seedFinalRevisionTasks(): Promise<void> {
  const existing = await db.dsaRevisions.where('pass').equals('Final').toArray();
  const existingTopics = new Set(existing.map(task => task.topicName));
  const start = new Date('2027-02-14T00:00:00');
  const missing = DSA_SEED.flatMap((topic, index) => {
    if (existingTopics.has(topic.name)) return [];
    const due = new Date(start);
    due.setDate(due.getDate() + Math.floor(index * 14 / DSA_SEED.length));
    return [{
      topicName: topic.name,
      pass: 'Final' as const,
      dueDate: toLocalDateString(due),
      target: 5,
      completed: 0,
      status: 'open' as const,
    }];
  });
  if (missing.length > 0) await db.dsaRevisions.bulkAdd(missing);
}

export async function decrementDone(topicId: number): Promise<void> {
  const topic = await db.dsaTopics.get(topicId);
  if (!topic || topic.done <= 0) return;
  await db.dsaTopics.update(topicId, { done: topic.done - 1 });
  await updateDsaWeekDone(-1);
}

export async function setDsaTopicDone(topicId: number, done: number): Promise<void> {
  const topic = await db.dsaTopics.get(topicId);
  if (!topic || !Number.isInteger(done) || done < 0 || done > topic.total || done === topic.done) return;
  await db.dsaTopics.update(topicId, { done });
}

async function updateDsaWeekDone(delta: number): Promise<void> {
  const startIso = await getSetting('dsa_start', '2026-10-24');
  const key = dsaWeekKey(startIso);
  const [storedKey, storedCount] = await Promise.all([
    getSetting('dsa_weekly_done_week'),
    getSetting('dsa_weekly_done_count', '0'),
  ]);
  const count = storedKey === key ? Math.max(0, Number(storedCount) || 0) : 0;
  await setSetting('dsa_weekly_done_week', key);
  await setSetting('dsa_weekly_done_count', String(Math.max(0, count + delta)));
}

export async function getDsaWeekProgress(): Promise<{ week: number; doneThisWeek: number }> {
  const startIso = await getSetting('dsa_start', '2026-10-24');
  const key = dsaWeekKey(startIso);
  const week = currentDsaWeek(startIso);
  const [storedKey, storedCount] = await Promise.all([
    getSetting('dsa_weekly_done_week'),
    getSetting('dsa_weekly_done_count', '0'),
  ]);
  return { week, doneThisWeek: storedKey === key ? Math.max(0, Number(storedCount) || 0) : 0 };
}

export function toLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function markTodayDsa(): Promise<void> {
  const today = toLocalDateString(new Date());
  const row = await db.streakDays.where('date').equals(today).first();
  if (row?.id !== undefined) {
    await db.streakDays.update(row.id, { dsaDone: true });
  } else {
    await db.streakDays.add({ date: today, dsaDone: true, webdevDone: false });
  }
}

export async function markTodayWebdev(): Promise<void> {
  const today = toLocalDateString(new Date());
  const row = await db.streakDays.where('date').equals(today).first();
  if (row?.id !== undefined) {
    await db.streakDays.update(row.id, { webdevDone: true });
  } else {
    await db.streakDays.add({ date: today, dsaDone: false, webdevDone: true });
  }
}

/**
 * Combined streak: a day counts if:
 * (a) at least one DSA item done, AND
 * (b) at least one web dev item done when the day is a webdev_day.
 * Sunday does not break the streak and does not extend it. Missing a day resets it.
 */
export async function getCombinedStreak(): Promise<number> {
  const streakRecords = await db.streakDays.toArray();
  const recordMap = new Map<string, { dsaDone: boolean; webdevDone: boolean }>();
  streakRecords.forEach(r => recordMap.set(r.date, { dsaDone: r.dsaDone, webdevDone: r.webdevDone }));

  const webdevDaysStr = await getSetting('webdev_days', 'Tuesday,Thursday,Saturday');
  const webdevDays = new Set(webdevDaysStr.split(',').map(s => s.trim().toLowerCase()).filter(Boolean));

  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  const isDayQualified = (dateStr: string): boolean => {
    const parts = dateStr.split('-').map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    const dayName = dayNames[d.getDay()];
    if (dayName === 'sunday') return false; // Sunday never extends streak

    const rec = recordMap.get(dateStr);
    if (!rec || !rec.dsaDone) return false;

    // If it is a webdev_day, webdevDone is also required
    if (webdevDays.has(dayName) && !rec.webdevDone) return false;

    return true;
  };

  const today = new Date();
  const todayStr = toLocalDateString(today);
  const parts = todayStr.split('-').map(Number);
  const cursor = new Date(parts[0], parts[1] - 1, parts[2]);

  let streak = 0;
  const todayQualified = isDayQualified(todayStr);

  if (todayQualified) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  } else {
    // If today is not qualified yet (e.g. today is still in progress or Sunday),
    // look back starting yesterday so current streak is preserved
    cursor.setDate(cursor.getDate() - 1);
  }

  while (true) {
    const dateStr = toLocalDateString(cursor);
    const dayName = dayNames[cursor.getDay()];

    if (dayName === 'sunday') {
      // Sunday does not break the streak and does not extend it
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }

    if (isDayQualified(dateStr)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      // Missed an active required day resets streak
      break;
    }
  }

  return streak;
}

export interface DsaQuotaDetails {
  quota: number;
  remainingProblems: number;
  remainingSolveDays: number;
  isSunday: boolean;
  isDsaDay: boolean;
  dsaDays: string[];
}

export async function getDailyNewQuotaDetails(): Promise<DsaQuotaDetails> {
  const topics = await db.dsaTopics.toArray();
  const remainingProblems = topics.reduce((s, t) => s + Math.max(0, t.total - t.done), 0);

  const solveDeadlineStr = await getSetting('dsa_solve_deadline', '2027-02-13');
  const dsaDaysStr = await getSetting('dsa_days', 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday');
  const dsaDaysArr = dsaDaysStr.split(',').map(s => s.trim()).filter(Boolean);
  const dsaDaysSet = new Set(dsaDaysArr.map(s => s.toLowerCase()));

  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayDayName = dayNames[today.getDay()];
  const isSunday = todayDayName === 'sunday';
  const isDsaDay = !isSunday && dsaDaysSet.has(todayDayName);

  const deadline = new Date(solveDeadlineStr + 'T00:00:00');
  deadline.setHours(0, 0, 0, 0);

  let remainingSolveDays = 0;
  const cursor = new Date(today);
  while (cursor <= deadline) {
    const dName = dayNames[cursor.getDay()];
    if (dName !== 'sunday' && dsaDaysSet.has(dName)) {
      remainingSolveDays++;
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  let quota = 0;
  if (isSunday || !isDsaDay) {
    quota = 0; // Sunday is catch-up only, or off-day
  } else {
    quota = remainingSolveDays > 0 ? Math.ceil(remainingProblems / remainingSolveDays) : remainingProblems;
  }

  return {
    quota,
    remainingProblems,
    remainingSolveDays,
    isSunday,
    isDsaDay,
    dsaDays: dsaDaysArr,
  };
}

export async function getDailyNewQuota(): Promise<number> {
  const details = await getDailyNewQuotaDetails();
  return details.quota;
}

export interface WebdevTargetDetails {
  targetPointsPerDay: number;
  remainingPoints: number;
  remainingTopics: number;
  remainingWebdevDays: number;
  hasDeadline: boolean;
  isWebdevDay: boolean;
  isSunday: boolean;
  webdevDays: string[];
}

export async function getDailyWebdevTarget(): Promise<WebdevTargetDetails> {
  const allWdTopics = await db.webdevTopics.toArray();
  const incomplete = allWdTopics.filter(t => t.status !== 'done');
  const weights: Record<WebDevDifficulty, number> = { Easy: 1, Medium: 2, Hard: 3 };
  const remainingPoints = incomplete.reduce((sum, t) => sum + (weights[t.difficulty] ?? 1), 0);

  const deadlineStr = await getSetting('webdev_deadline', '');
  const webdevDaysStr = await getSetting('webdev_days', 'Tuesday,Thursday,Saturday');
  const webdevDaysArr = webdevDaysStr.split(',').map(s => s.trim()).filter(Boolean);
  const webdevDaysSet = new Set(webdevDaysArr.map(s => s.toLowerCase()));

  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayDayName = dayNames[today.getDay()];
  const isSunday = todayDayName === 'sunday';
  const isWebdevDay = !isSunday && webdevDaysSet.has(todayDayName);

  if (!deadlineStr) {
    return {
      targetPointsPerDay: 0,
      remainingPoints,
      remainingTopics: incomplete.length,
      remainingWebdevDays: 0,
      hasDeadline: false,
      isWebdevDay,
      isSunday,
      webdevDays: webdevDaysArr,
    };
  }

  const parts = deadlineStr.split('-').map(Number);
  const deadline = parts.length === 3 ? new Date(parts[0], parts[1] - 1, parts[2]) : new Date(deadlineStr);
  deadline.setHours(0, 0, 0, 0);

  if (isNaN(deadline.getTime()) || deadline < today) {
    return {
      targetPointsPerDay: 0,
      remainingPoints,
      remainingTopics: incomplete.length,
      remainingWebdevDays: 0,
      hasDeadline: false,
      isWebdevDay,
      isSunday,
      webdevDays: webdevDaysArr,
    };
  }

  let remainingWebdevDays = 0;
  const cursor = new Date(today);
  while (cursor <= deadline) {
    const dName = dayNames[cursor.getDay()];
    if (dName !== 'sunday' && webdevDaysSet.has(dName)) {
      remainingWebdevDays++;
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  const targetPointsPerDay = remainingWebdevDays > 0
    ? Math.ceil(remainingPoints / remainingWebdevDays)
    : remainingPoints;

  return {
    targetPointsPerDay,
    remainingPoints,
    remainingTopics: incomplete.length,
    remainingWebdevDays,
    hasDeadline: true,
    isWebdevDay,
    isSunday,
    webdevDays: webdevDaysArr,
  };
}

/**
 * Phase lock rule:
 * Phase N unlocks when all Critical and High topics in Phase N-1 are done.
 * Medium, Low, Low-Medium, Optional topics do not block.
 * Phase 0 and 1 remain parallel (both always unlocked).
 */
export function isWebDevPhaseLocked(phase: number, allTopics: WebDevTopic[]): boolean {
  if (phase <= 1) return false;
  for (let p = 2; p <= phase; p++) {
    const prevBlocking = allTopics.filter(
      t => t.phase === p - 1 && (t.importance === 'Critical' || t.importance === 'High')
    );
    const complete = prevBlocking.length === 0 || prevBlocking.every(t => t.status === 'done');
    if (!complete) return true;
  }
  return false;
}

export async function exportData(): Promise<string> {
  const [dsaTopics, webdevTopics, settings, streakDays, dsaRevisions, aiWeeks] = await Promise.all([
    db.dsaTopics.toArray(),
    db.webdevTopics.toArray(),
    db.settings.toArray(),
    db.streakDays.toArray(),
    db.dsaRevisions.toArray(),
    db.aiWeeks.orderBy('week').toArray(),
  ]);
  const activeSettings = settings.filter(setting => setting.key !== 'graph_revision_per_week' && setting.key !== 'graph_flagged_total');
  return JSON.stringify({ dsaTopics, webdevTopics, settings: activeSettings, streakDays, dsaRevisions, aiWeeks }, null, 2);
}

export async function importData(json: string): Promise<void> {
  const data = JSON.parse(json);
  const dsaTopics = Array.isArray(data.dsaTopics)
    ? data.dsaTopics.map((topic: DsaTopic) => ({
        ...(topic.id === undefined ? {} : { id: topic.id }),
        name: topic.name,
        total: topic.total,
        done: topic.done,
        ...(topic.completedAt ? { completedAt: topic.completedAt } : {}),
      }))
    : [];
  const importedSettings = Array.isArray(data.settings)
    ? data.settings.filter((setting: AppSettings) => setting.key !== 'graph_revision_per_week' && setting.key !== 'graph_flagged_total')
    : [];
  const existingAiStatus = importedSettings.find((setting: AppSettings) => setting.key === 'ai_status');
  if (existingAiStatus) {
    if (existingAiStatus.value !== 'active' && existingAiStatus.value !== 'parked') existingAiStatus.value = 'parked';
  } else {
    importedSettings.push({ key: 'ai_status', value: 'parked' });
  }
  const importedAiWeeks: Omit<AiWeek, 'id'>[] = Array.isArray(data.aiWeeks) && data.aiWeeks.length > 0
    ? data.aiWeeks
    : AI_WEEK_DATA_SEED.map(week => ({
        ...week,
        resources: week.resources.map(resource => ({ ...resource })),
        steps: week.steps.map(item => ({ ...item })),
        projectItems: week.projectItems.map(item => ({ ...item })),
      }));
  await db.transaction('rw', [db.dsaTopics, db.webdevTopics, db.settings, db.streakDays, db.dsaRevisions, db.aiWeeks], async () => {
    await db.dsaTopics.clear();
    await db.webdevTopics.clear();
    await db.settings.clear();
    await db.streakDays.clear();
    await db.dsaRevisions.clear();
    await db.aiWeeks.clear();
    if (dsaTopics.length) await db.dsaTopics.bulkAdd(dsaTopics);
    if (data.webdevTopics?.length) await db.webdevTopics.bulkAdd(data.webdevTopics);
    if (importedSettings.length) await db.settings.bulkAdd(importedSettings);
    if (data.streakDays?.length) await db.streakDays.bulkAdd(data.streakDays);
    if (data.dsaRevisions?.length) await db.dsaRevisions.bulkAdd(data.dsaRevisions);
    if (importedAiWeeks.length) await db.aiWeeks.bulkAdd(importedAiWeeks);
  });
  await seedFinalRevisionTasks();
}

export function daysUntil(isoDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const parts = isoDate.split('-').map(Number);
  const deadline = parts.length === 3 ? new Date(parts[0], parts[1] - 1, parts[2]) : new Date(isoDate);
  if (isNaN(deadline.getTime())) return 0;
  deadline.setHours(0, 0, 0, 0);
  return Math.ceil((deadline.getTime() - today.getTime()) / 86400000);
}

export function linearPlanFraction(startIso: string, deadlineIso: string): number {
  const start = new Date(startIso).getTime();
  const end = new Date(deadlineIso).getTime();
  const now = Date.now();
  return Math.min(1, Math.max(0, (now - start) / (end - start)));
}
