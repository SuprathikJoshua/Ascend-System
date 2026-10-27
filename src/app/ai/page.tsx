'use client';

import { useEffect, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { LockKeyhole, Sparkles } from 'lucide-react';
import {
  getAiWeeks,
  seedIfEmpty,
  setAiWeekItemChecked,
  updateAiWeekFields,
  type AiPlanItem,
  type AiWeek,
} from '@/lib/storage';
import { getAiWeekItemProgress, getFirstIncompleteUnlockedAiWeek, isAiWeekComplete, isAiWeekUnlocked } from '@/lib/aiProgress';
import { AI_RULES } from '@/lib/aiPlan';

export default function AiInternshipPage() {
  const [ready, setReady] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const initialized = useRef(false);
  const weeks = useLiveQuery(() => getAiWeeks(), []);

  useEffect(() => {
    void seedIfEmpty().then(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready || !weeks || initialized.current) return;
    const queryWeek = Number(new URLSearchParams(window.location.search).get('week'));
    const requested = Number.isInteger(queryWeek) ? weeks.find(week => week.week === queryWeek) : undefined;
    const initial = requested ?? getFirstIncompleteUnlockedAiWeek(weeks) ?? weeks.at(-1);
    if (!initial) return;
    initialized.current = true;
    setSelectedWeek(initial.week);
    updateWeekQuery(initial.week);
  }, [ready, weeks]);

  const selectWeek = (weekNumber: number) => {
    setSelectedWeek(weekNumber);
    updateWeekQuery(weekNumber);
  };

  if (!ready || !weeks || selectedWeek === null) {
    return <div className="flex items-center justify-center h-64 text-gray-500 animate-pulse">Loading AI Internship…</div>;
  }

  const selected = weeks.find(week => week.week === selectedWeek) ?? weeks[0];
  if (!selected) return null;

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <header className="glass rounded-xl p-5">
        <div className="flex items-center gap-3">
          <Sparkles className="text-cyan-300" size={22} />
          <div>
            <h1 className="text-2xl font-bold text-gray-100">AI Internship</h1>
            <p className="text-sm text-gray-500 mt-1">A 12-week plan with project proof and results.</p>
          </div>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
        <section className="glass rounded-xl p-4 space-y-3">
          <h2 className="text-sm font-semibold text-gray-200">Weekly plan</h2>
          <label className="sr-only" htmlFor="ai-week-select">Select a week</label>
          <select
            id="ai-week-select"
            value={selected.week}
            onChange={event => selectWeek(Number(event.target.value))}
            className="md:hidden min-h-11 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 text-sm text-gray-200 focus:outline-none focus:border-cyan-500"
          >
            {weeks.map(week => {
              const unlocked = isAiWeekUnlocked(weeks, week.week);
              return <option key={week.week} value={week.week}>{week.title}{unlocked ? '' : ' · Locked'}</option>;
            })}
          </select>
          <div className="hidden md:grid gap-2">
            {weeks.map(week => <WeekListItem
              key={week.week}
              week={week}
              selected={week.week === selected.week}
              unlocked={isAiWeekUnlocked(weeks, week.week)}
              onSelect={() => selectWeek(week.week)}
            />)}
          </div>
        </section>

        <WeekDetails
          week={selected}
          locked={!isAiWeekUnlocked(weeks, selected.week)}
        />
      </div>

      <section className="glass rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-200">Rules</h2>
        <ul className="space-y-2 text-sm text-gray-400">
          {AI_RULES.map(rule => <li key={rule}>{rule}</li>)}
        </ul>
      </section>
    </main>
  );
}

function updateWeekQuery(weekNumber: number) {
  const url = new URL(window.location.href);
  url.searchParams.set('week', String(weekNumber));
  window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
}

function WeekListItem({ week, selected, unlocked, onSelect }: {
  week: AiWeek;
  selected: boolean;
  unlocked: boolean;
  onSelect: () => void;
}) {
  const progress = getAiWeekItemProgress(week);
  const percentage = progress.total ? (progress.checked / progress.total) * 100 : 0;
  const complete = isAiWeekComplete(week);
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`w-full min-h-11 rounded-lg border px-3 py-2 text-left transition-colors ${selected ? 'border-cyan-500/50 bg-cyan-500/10' : 'border-gray-800 bg-gray-900/40 hover:bg-gray-800/70'} ${unlocked ? '' : 'opacity-55'}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-gray-200">{week.title}</span>
        {!unlocked && <LockKeyhole size={13} className="shrink-0 text-gray-500" aria-label="Locked" />}
        {complete && <span className="text-[10px] text-emerald-300">Complete</span>}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-800">
          <div className="h-full rounded-full bg-cyan-400 transition-all" style={{ width: `${percentage}%` }} />
        </div>
        <span className="text-[10px] tabular-nums text-gray-500">{progress.checked}/{progress.total}</span>
      </div>
    </button>
  );
}

function WeekDetails({ week, locked }: { week: AiWeek; locked: boolean }) {
  const [proofLink, setProofLink] = useState(week.proofLink);
  const [resultsNotes, setResultsNotes] = useState(week.resultsNotes);
  useEffect(() => setProofLink(week.proofLink), [week.proofLink]);
  useEffect(() => setResultsNotes(week.resultsNotes), [week.resultsNotes]);
  const progress = getAiWeekItemProgress(week);
  const complete = isAiWeekComplete(week);
  return (
    <article className={`glass min-w-0 rounded-xl p-5 space-y-6 ${locked ? 'opacity-75' : ''}`}>
      {locked && <div className="rounded-lg border border-gray-700 bg-gray-900/70 px-3 py-2 text-sm text-gray-400">Locked until Week {week.week - 1} is complete</div>}
      <header>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-100">{week.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-300">{week.goal}</p>
          </div>
          <span className={`rounded-full border px-2.5 py-1 text-xs ${complete ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-gray-700 text-gray-400'}`}>
            {complete ? 'Complete' : `${progress.checked}/${progress.total} items`}
          </span>
        </div>
      </header>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-200">Free resources</h3>
        <ul className="list-disc space-y-1 pl-5 text-sm text-cyan-300 marker:text-gray-600">
          {week.resources.map((resource, index) => (
            <li key={`${resource.label}-${index}`}>
              {resource.url
                ? <a href={resource.url} target="_blank" rel="noreferrer" className="underline decoration-cyan-500/40 underline-offset-2 hover:decoration-cyan-300">{resource.label}</a>
                : <span className="text-gray-400">{resource.label}</span>}
            </li>
          ))}
        </ul>
      </section>

      <ItemChecklist title="Steps" items={week.steps} week={week} locked={locked} numbered />

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-200">Project: <span className="text-cyan-300">{week.projectName}</span></h3>
        <ItemChecklist title="Project checklist" items={week.projectItems} week={week} locked={locked} />
      </section>

      <section className="grid gap-4 border-t border-gray-800 pt-5">
        <label className="space-y-1.5">
          <span className="text-sm font-semibold text-gray-200">Proof link</span>
          <input
            type="text"
            aria-label={`${week.title} proof link`}
            value={proofLink}
            readOnly={locked}
            onChange={event => setProofLink(event.target.value)}
            onBlur={() => proofLink !== week.proofLink && void updateAiWeekFields(week.week, { proofLink })}
            placeholder="Add a link to your proof"
            className="min-h-11 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 focus:border-cyan-500 focus:outline-none read-only:opacity-60"
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-semibold text-gray-200">Results notes</span>
          <textarea
            aria-label={`${week.title} results notes`}
            value={resultsNotes}
            readOnly={locked}
            onChange={event => setResultsNotes(event.target.value)}
            onBlur={() => resultsNotes !== week.resultsNotes && void updateAiWeekFields(week.week, { resultsNotes })}
            rows={4}
            placeholder="Record results, numbers, and what you learned"
            className="w-full resize-y rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 focus:border-cyan-500 focus:outline-none read-only:opacity-60"
          />
        </label>
      </section>
    </article>
  );
}

function ItemChecklist({ title, items, week, locked, numbered = false }: {
  title: string;
  items: AiPlanItem[];
  week: AiWeek;
  locked: boolean;
  numbered?: boolean;
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-200">{title}</h3>
      <ul className="space-y-1">
        {items.map((item, index) => (
          <li key={item.id} className={`flex min-h-11 items-start gap-3 rounded-lg px-2 py-2 ${item.checked ? 'text-gray-500' : 'text-gray-300'} ${locked ? 'cursor-not-allowed' : 'hover:bg-gray-900/60'}`}>
            <input
              type="checkbox"
              checked={item.checked}
              disabled={locked}
              aria-label={`${title} ${numbered ? `step ${index + 1}` : `item ${index + 1}`}: ${item.label}`}
              onChange={event => void setAiWeekItemChecked(week.week, item.id, event.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 accent-cyan-400 disabled:opacity-50"
            />
            <span className="w-full text-sm leading-relaxed">
              {numbered && <span className="mr-2 text-xs text-gray-600">{index + 1}.</span>}
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
