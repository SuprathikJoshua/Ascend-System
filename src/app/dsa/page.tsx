'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { BookOpen, Check, Clock3, Minus, Plus, RotateCcw, Target } from 'lucide-react';
import {
  daysUntil, decrementDone, getDsaTopics, getDsaChecklistItems, getDsaRevisionRecords,
  updateDsaChecklistItem, updateDsaRevisionTask, getDailyNewQuotaDetails, getDsaRevisionTasks, getDsaWeekProgress,
  incrementDone, incrementDsaRevision, markDsaTopicComplete, seedIfEmpty,
  setDsaTopicDone, setGraphRevisionChecklistItem, toLocalDateString, type DsaChecklistItem, type DsaRevisionTask, type DsaTopic,
} from '@/lib/storage';
import { DSA_PHASE_PLAN, DSA_TOPIC_ORDER } from '@/lib/dsaPlan';

const TOPIC_ORDER = new Map(DSA_TOPIC_ORDER.map((name, index) => [name, index]));
const REDO_TOPICS = new Set(['Arrays', 'Binary Search', 'Bit Manipulation', 'DP']);

export default function DsaPage() {
  const [seeded, setSeeded] = useState(false);
  const [quota, setQuota] = useState(0);
  const [daysToDeadline, setDaysToDeadline] = useState(0);
  const [weekProgress, setWeekProgress] = useState({ week: 1, doneThisWeek: 0 });
  const [editingTopicId, setEditingTopicId] = useState<number | null>(null);
  const [doneDraft, setDoneDraft] = useState('');
  const [doneError, setDoneError] = useState('');
  const topics = useLiveQuery(
    () => getDsaTopics().then(rows => rows.sort((a, b) => (TOPIC_ORDER.get(a.name) ?? 999) - (TOPIC_ORDER.get(b.name) ?? 999))),
    [],
  );
  const checklistItems = useLiveQuery(() => getDsaChecklistItems(), []);
  const revisionTasks = useLiveQuery(() => getDsaRevisionRecords(), []);

  useEffect(() => {
    seedIfEmpty().then(() => setSeeded(true));
  }, []);

  useEffect(() => {
    if (seeded) void getDsaRevisionTasks();
  }, [seeded]);

  useEffect(() => {
    if (!seeded) return;
    let cancelled = false;
    const refresh = async () => {
      const [quotaDetails, progress] = await Promise.all([
        getDailyNewQuotaDetails(),
        getDsaWeekProgress(),
      ]);
      if (!cancelled) {
        setQuota(quotaDetails.quota);
        setDaysToDeadline(daysUntil('2027-02-13'));
        setWeekProgress(progress);
      }
    };
    void refresh();
    return () => { cancelled = true; };
  }, [seeded, topics]);

  const topicsByName = useMemo(() => new Map((topics ?? []).map(topic => [topic.name, topic])), [topics]);
  const total = topics?.reduce((sum, topic) => sum + topic.total, 0) ?? 0;
  const done = topics?.reduce((sum, topic) => sum + topic.done, 0) ?? 0;
  const left = Math.max(0, total - done);
  const percent = total > 0 ? (done / total) * 100 : 0;
  const currentPhase = DSA_PHASE_PLAN.find(phase => weekProgress.week >= phase.startWeek && weekProgress.week <= phase.endWeek);
  const currentPhaseLeft = currentPhase?.topics.reduce((sum, name) => {
    const topic = topicsByName.get(name);
    return sum + (topic ? Math.max(0, topic.total - topic.done) : 0);
  }, 0) ?? 0;
  const weeksLeft = currentPhase ? Math.max(1, currentPhase.endWeek - weekProgress.week + 1) : 1;
  const thisWeekTarget = currentPhase ? currentPhaseLeft / weeksLeft : 0;

  const updateChecklist = async (item: DsaChecklistItem, changes: Partial<DsaChecklistItem>) => {
    if (item.id === undefined) return;
    if (item.list === 'graph-revision' && typeof changes.done === 'boolean') {
      await setGraphRevisionChecklistItem(item, changes.done);
      if (Object.hasOwn(changes, 'label')) await updateDsaChecklistItem(item.id, { label: changes.label });
      return;
    }
    await updateDsaChecklistItem(item.id, changes);
  };

  const saveDoneCount = async (topic: DsaTopic) => {
    const done = Number(doneDraft);
    if (!Number.isInteger(done) || done < 0 || done > topic.total) {
      setDoneError(`Enter a whole number from 0 to ${topic.total}.`);
      return;
    }
    if (topic.id !== undefined) await setDsaTopicDone(topic.id, done);
    setEditingTopicId(null);
    setDoneError('');
  };

  if (!seeded || !topics || !checklistItems || !revisionTasks) {
    return <div className="flex items-center justify-center h-64 text-gray-500 animate-pulse">Loading DSA tracker…</div>;
  }

  const today = toLocalDateString();
  const dueToday = revisionTasks.filter(task => task.status === 'open' && task.dueDate === today);
  const overdue = revisionTasks.filter(task => task.status === 'open' && task.dueDate < today);
  const upcoming = revisionTasks.filter(task => task.status === 'open' && task.pass !== 'Final' && task.dueDate > today);
  const finalPhase = revisionTasks.filter(task => task.pass === 'Final' || task.status === 'collapsed');

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <header className="glass rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">DSA Tracker</h1>
            <p className="text-sm text-gray-500 mt-1">Topic-level progress · plan starts from your configured date</p>
          </div>
          <div className="flex flex-wrap gap-5 text-right">
            <Stat label="Done" value={String(done)} />
            <Stat label="Total" value={String(total)} />
            <Stat label="Left" value={String(left)} />
            <Stat label="Days to solve deadline" value={String(daysToDeadline)} />
            <Stat label="Today's new quota" value={String(quota)} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1.5"><span>Overall progress</span><span>{percent.toFixed(1)}%</span></div>
          <div className="h-2 rounded-full bg-gray-800 overflow-hidden"><div className="h-full bg-violet-400 rounded-full transition-all" style={{ width: `${percent}%` }} /></div>
        </div>
      </header>

      <section className="glass rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2"><BookOpen size={18} className="text-violet-400" /><h2 className="text-lg font-semibold text-gray-100">Gameplan</h2></div>
        <div className="space-y-2">
          {DSA_PHASE_PLAN.map(phase => {
            const phaseTopics = phase.topics.map(name => topicsByName.get(name)).filter((topic): topic is DsaTopic => Boolean(topic));
            const remaining = phase.topics.length > 0
              ? phaseTopics.reduce((sum, topic) => sum + Math.max(0, topic.total - topic.done), 0)
              : revisionTasks.filter(task => task.pass === 'Final').reduce((sum, task) => sum + Math.max(0, task.target - task.completed), 0);
            const calendarCurrent = weekProgress.week >= phase.startWeek && weekProgress.week <= phase.endWeek;
            const status = remaining === 0 ? 'done' : calendarCurrent ? 'current' : weekProgress.week > phase.endWeek ? 'behind' : 'upcoming';
            const badgeClass = {
              done: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30',
              current: 'text-violet-300 bg-violet-500/10 border-violet-500/30',
              upcoming: 'text-gray-400 bg-gray-800 border-gray-700',
              behind: 'text-rose-300 bg-rose-500/10 border-rose-500/30',
            }[status];
            return (
              <div key={phase.label} className={`grid grid-cols-[56px_minmax(0,1fr)_auto] sm:grid-cols-[72px_minmax(0,1fr)_auto_auto] items-center gap-2 sm:gap-3 rounded-lg border px-3 py-2 ${calendarCurrent ? 'border-violet-500/50 bg-violet-500/5 ring-1 ring-violet-500/20' : 'border-gray-800 bg-gray-900/30'}`}>
                <span className="text-xs font-semibold text-gray-300">{phase.label}</span>
                <span className="min-w-0 text-sm text-gray-300 break-words">{phase.topics.length ? phase.topics.join(' · ') : 'Revision only'}</span>
                <span className="text-xs text-gray-500 tabular-nums">{remaining} left</span>
                <span className={`text-[11px] uppercase rounded border px-2 py-0.5 ${badgeClass}`}>{status}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="glass rounded-xl p-5 border border-cyan-500/20">
          <div className="flex items-center gap-2 mb-2"><Target size={17} className="text-cyan-400" /><h2 className="text-sm font-semibold text-gray-200">This week</h2></div>
          <p className="text-sm text-gray-400">{currentPhase?.label ?? 'Outside the 18-week plan'} target: <strong className="text-gray-100">{thisWeekTarget.toFixed(1)}</strong> problems ({currentPhaseLeft} remaining ÷ {weeksLeft} weeks left in phase)</p>
          <p className="text-xs text-gray-500 mt-2">Done this week: <strong className="text-cyan-300">{weekProgress.doneThisWeek}</strong></p>
        </div>
        <div className="glass rounded-xl p-5 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-2"><Clock3 size={17} className="text-amber-400" /><h2 className="text-sm font-semibold text-gray-200">Rules</h2></div>
          <ul className="space-y-1.5 text-sm text-gray-400">
            <li>Stuck 30 min = use a hint.</li>
            <li>Stuck 60 min = read the solution and re-solve next day.</li>
            <li>Sunday = revision.</li>
          </ul>
        </div>
      </section>

      <section className="glass rounded-xl overflow-hidden">
        <div className="p-5 border-b border-gray-800"><h2 className="text-lg font-semibold text-gray-100">Topics</h2></div>
        {DSA_PHASE_PLAN.filter(phase => phase.topics.length > 0).map(phase => (
          <div key={phase.label}>
            <div className="px-4 py-2 bg-gray-900/60 border-y border-gray-800 text-xs font-semibold text-gray-400">{phase.label}</div>
            <div className="divide-y divide-gray-800/60">
              {phase.topics.map(name => {
                const topic = topicsByName.get(name);
                if (!topic) return null;
                const remaining = Math.max(0, topic.total - topic.done);
                const pct = topic.total > 0 ? Math.min(100, (topic.done / topic.total) * 100) : 0;
                return (
                  <div key={name} className="grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(140px,1.2fr)_minmax(120px,1fr)_56px_auto_auto] items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-gray-200">{name}</span>
                        {REDO_TOPICS.has(name) && <Tag color="rose">redo</Tag>}
                        {name === 'Graphs' && <Tag color="amber">revise</Tag>}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                        {editingTopicId === topic.id ? (
                          <>
                            <input
                              aria-label={`${name} done count`}
                              type="number"
                              min={0}
                              max={topic.total}
                              step={1}
                              autoFocus
                              value={doneDraft}
                              onChange={event => { setDoneDraft(event.target.value); setDoneError(''); }}
                              onBlur={() => void saveDoneCount(topic)}
                              onKeyDown={event => {
                                if (event.key === 'Enter') { event.preventDefault(); void saveDoneCount(topic); }
                                if (event.key === 'Escape') { setEditingTopicId(null); setDoneError(''); }
                              }}
                              className="w-16 rounded border border-violet-500 bg-gray-950 px-2 py-1 text-xs text-gray-100 focus:outline-none"
                            />
                            <span>/{topic.total} done · {remaining} left</span>
                            {doneError && <span role="alert" className="text-rose-300">{doneError}</span>}
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              aria-label={`Edit ${name} done count, currently ${topic.done}`}
                              onClick={() => { setEditingTopicId(topic.id ?? null); setDoneDraft(String(topic.done)); setDoneError(''); }}
                              className="rounded px-1 -ml-1 text-violet-300 hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-400"
                            >{topic.done}</button>
                            <span>/{topic.total} done · {remaining} left</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="col-span-2 sm:col-span-1 h-1.5 rounded-full bg-gray-800 overflow-hidden"><div className="h-full rounded-full bg-violet-400" style={{ width: `${pct}%` }} /></div>
                    <span className="hidden sm:block text-xs text-gray-400 text-right tabular-nums">{pct.toFixed(0)}%</span>
                    <div className="flex gap-2">
                      <button aria-label={`Decrease ${name} done count`} onClick={() => topic.id !== undefined && decrementDone(topic.id)} disabled={topic.done <= 0} className="min-h-11 min-w-11 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-30 flex items-center justify-center"><Minus size={14} /></button>
                      <button aria-label={`Increase ${name} done count`} onClick={() => topic.id !== undefined && incrementDone(topic.id)} disabled={topic.done >= topic.total} className="min-h-11 min-w-11 rounded-lg bg-violet-600/20 text-violet-300 hover:bg-violet-600/40 disabled:opacity-30 flex items-center justify-center"><Plus size={14} /></button>
                    </div>
                    {topic.completedAt ? (
                      <span className="text-[11px] text-emerald-400 text-right">Completed {topic.completedAt}</span>
                    ) : (
                      <button onClick={() => topic.id !== undefined && markDsaTopicComplete(topic.id)} className="min-h-11 px-2 rounded border border-emerald-500/30 text-[11px] text-emerald-300 hover:bg-emerald-500/10 whitespace-nowrap">Mark topic complete</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Checklist
          title="Graph leftovers (7 items)"
          items={checklistItems.filter(item => item.list === 'graph-leftovers').sort((a, b) => a.order - b.order)}
          onUpdate={updateChecklist}
        />
        <Checklist
          title="Graph revision (20 items)"
          items={checklistItems.filter(item => item.list === 'graph-revision').sort((a, b) => a.order - b.order)}
          onUpdate={updateChecklist}
        />
      </div>

      <section className="glass rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2"><RotateCcw size={18} className="text-cyan-400" /><h2 className="text-lg font-semibold text-gray-100">Revision tasks</h2></div>
        <RevisionGroup title="Due today" tasks={dueToday} />
        <RevisionGroup title="Overdue" tasks={overdue} />
        <RevisionGroup title="Upcoming" tasks={upcoming} />
        <RevisionGroup title="Final phase" tasks={finalPhase} />
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div><div className="text-2xl leading-none font-bold text-violet-300 tabular-nums">{value}</div><div className="text-[11px] text-gray-500 mt-1">{label}</div></div>;
}

function Tag({ color, children }: { color: 'rose' | 'amber'; children: React.ReactNode }) {
  const classes = color === 'rose' ? 'text-rose-300 bg-rose-500/10 border-rose-500/30' : 'text-amber-300 bg-amber-500/10 border-amber-500/30';
  return <span className={`text-[10px] uppercase rounded border px-1.5 py-0.5 ${classes}`}>{children}</span>;
}

function Checklist({ title, items, onUpdate }: { title: string; items: DsaChecklistItem[]; onUpdate: (item: DsaChecklistItem, changes: Partial<DsaChecklistItem>) => Promise<void> }) {
  return (
    <section className="glass rounded-xl p-5">
      <h2 className="text-sm font-semibold text-gray-200 mb-3">{title}</h2>
      <ul className="space-y-2">
        {items.map(item => (
          <li key={item.id} className="flex items-center gap-2">
            <button aria-label={`${item.done ? 'Uncheck' : 'Check'} ${item.label}`} onClick={() => onUpdate(item, { done: !item.done })} className={`min-h-11 min-w-11 shrink-0 rounded border flex items-center justify-center ${item.done ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' : 'border-gray-700 text-transparent'}`}><Check size={13} /></button>
            <span className="text-[11px] text-gray-600 w-5 text-right tabular-nums">{item.order + 1}</span>
            <input
              aria-label={`${title} item ${item.order + 1} label`}
              key={`${item.id}-${item.label}`}
              defaultValue={item.label}
              onBlur={event => event.target.value.trim() && event.target.value.trim() !== item.label && onUpdate(item, { label: event.target.value.trim() })}
              className={`w-full bg-transparent border-b border-transparent hover:border-gray-700 focus:border-violet-500 focus:outline-none text-sm py-1 ${item.done ? 'text-gray-600 line-through' : 'text-gray-300'}`}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

function RevisionGroup({ title, tasks }: { title: string; tasks: DsaRevisionTask[] }) {
  const shown = [...tasks].sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.topicName.localeCompare(b.topicName));
  return (
    <div className="border-t border-gray-800 pt-3">
      <h3 className="text-sm font-semibold text-gray-300 mb-2">{title} <span className="text-gray-600">({shown.length})</span></h3>
      {shown.length === 0 ? <p className="text-xs text-gray-600">No tasks.</p> : (
        <div className="space-y-2">
          {shown.map(task => <RevisionRow key={task.id} task={task} />)}
        </div>
      )}
    </div>
  );
}

function RevisionRow({ task }: { task: DsaRevisionTask }) {
  const [whichProblems, setWhichProblems] = useState(task.whichProblems ?? '');
  useEffect(() => setWhichProblems(task.whichProblems ?? ''), [task.whichProblems]);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[minmax(100px,1fr)_40px_100px_auto_minmax(120px,1.2fr)] items-center gap-2 rounded-lg bg-gray-900/40 border border-gray-800 px-3 py-3 sm:py-2">
      <span className="min-w-0 text-sm text-gray-200 truncate">{task.topicName}</span>
      <span className="text-xs text-cyan-300">{task.pass}</span>
      <span className="text-xs text-gray-500">{task.dueDate}</span>
      <div className="flex items-center gap-2">
        <span className={`text-xs tabular-nums ${task.status === 'collapsed' ? 'text-rose-300' : 'text-gray-400'}`}>{task.status === 'collapsed' ? 'collapsed · ' : ''}{task.completed}/{task.target}</span>
        {task.status !== 'done' && task.id !== undefined && (
          <button aria-label={`Add one ${task.pass} re-solve for ${task.topicName}`} onClick={() => incrementDsaRevision(task.id!)} className="min-h-11 min-w-11 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 flex items-center justify-center"><Plus size={13} /></button>
        )}
      </div>
      <input
        value={whichProblems}
        onChange={event => setWhichProblems(event.target.value)}
        onBlur={() => task.id !== undefined && whichProblems !== (task.whichProblems ?? '') && updateDsaRevisionTask(task.id, { whichProblems })}
        placeholder="Which problems (optional)"
        className="min-h-11 w-full min-w-0 text-xs bg-gray-950 border border-gray-800 rounded px-2 py-1.5 text-gray-300 placeholder:text-gray-700 focus:outline-none focus:border-cyan-500"
      />
    </div>
  );
}
