import type { AiWeek } from './localDb';

export function getAiWeekItemProgress(week: AiWeek): { checked: number; total: number } {
  const items = [...week.steps, ...week.projectItems];
  return { checked: items.filter(item => item.checked).length, total: items.length };
}

export function isAiWeekComplete(week: AiWeek | undefined): boolean {
  return Boolean(
    week &&
    week.steps.length === 7 &&
    week.steps.every(item => item.checked) &&
    week.projectItems.every(item => item.checked) &&
    week.proofLink.trim().length > 0
  );
}

export function isAiWeekUnlocked(weeks: AiWeek[], weekNumber: number): boolean {
  if (weekNumber === 1) return true;
  const previousWeek = weeks.find(week => week.week === weekNumber - 1);
  return isAiWeekComplete(previousWeek);
}

export function getFirstIncompleteUnlockedAiWeek(weeks: AiWeek[]): AiWeek | undefined {
  return [...weeks].sort((a, b) => a.week - b.week).find(week =>
    isAiWeekUnlocked(weeks, week.week) && !isAiWeekComplete(week)
  );
}

export function getAiDashboardNextStep(status: string, weeks: AiWeek[]): { week: AiWeek; step: AiWeek['steps'][number] } | undefined {
  if (status !== 'active') return undefined;
  const week = getFirstIncompleteUnlockedAiWeek(weeks);
  const step = week?.steps.find(item => !item.checked);
  return week && step ? { week, step } : undefined;
}
