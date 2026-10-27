'use client';

import { useEffect, useState, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  seedIfEmpty, getDsaTopics, getWebDevTopics, getTodayStreakDay, getDsaRevisionRecords,
  updateWebDevTopic, getDailyNewQuotaDetails, getDailyWebdevTarget,
  getCombinedStreak, daysUntil, linearPlanFraction, getSetting, setSetting, incrementDone,
  getDsaRevisionTasks, getDsaWeeklyRevisionReview,
  markTodayWebdev, toLocalDateString, isWebDevPhaseLocked, exportData,
  type DsaTopic, type WebDevTopic, type DsaQuotaDetails, type WebdevTargetDetails,
} from '@/lib/storage';
import {
  Flame, Target, Clock, TrendingUp, TrendingDown, Minus as MinusIcon,
  Code2, Globe, Calendar, Zap, CheckCircle2, ChevronRight, AlertTriangle, AlertCircle,
  Download, ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import ProofModal from '@/components/webdev/ProofModal';
import { DSA_TOPIC_ORDER, dsaTopicPhase } from '@/lib/dsaPlan';

const DSA_TOPIC_INDEX = new Map(DSA_TOPIC_ORDER.map((name, index) => [name, index]));

export default function DashboardPage() {
  const [seeded, setSeeded] = useState(false);
  const [quotaDetails, setQuotaDetails] = useState<DsaQuotaDetails | null>(null);
  const [webdevTarget, setWebdevTarget] = useState<WebdevTargetDetails | null>(null);
  const [streak, setStreak] = useState(0);
  const [revisionReview, setRevisionReview] = useState({ done: 0, missed: 0, collapsed: 0 });
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [previewReview, setPreviewReview] = useState(false);
  const [proofModal, setProofModal] = useState<WebDevTopic | null>(null);

  const topics = useLiveQuery(
    () => getDsaTopics().then(rows => rows.sort((a, b) => (DSA_TOPIC_INDEX.get(a.name) ?? 999) - (DSA_TOPIC_INDEX.get(b.name) ?? 999))),
    [],
  );
  const webdevTopics = useLiveQuery(() => getWebDevTopics(), []);
  const todayStr = toLocalDateString(new Date());
  const todayStreak = useLiveQuery(() => getTodayStreakDay(todayStr), [todayStr]);
  const dsaRevisions = useLiveQuery(() => getDsaRevisionRecords(), []);

  useEffect(() => {
    seedIfEmpty().then(() => setSeeded(true));
  }, []);

  useEffect(() => {
    if (seeded) void getDsaRevisionTasks();
  }, [seeded]);

  const refresh = useCallback(async () => {
    const [qDetails, wdTarget, s, revisions] = await Promise.all([
      getDailyNewQuotaDetails(),
      getDailyWebdevTarget(),
      getCombinedStreak(),
      getDsaWeeklyRevisionReview(),
    ]);
    setQuotaDetails(qDetails);
    setWebdevTarget(wdTarget);
    setStreak(s);
    setRevisionReview(revisions);

    const keys = [
      'dsa_start', 'dsa_solve_deadline', 'dsa_final_deadline', 'webdev_deadline',
      'dsa_days', 'dsa_daily_minutes', 'webdev_days', 'webdev_daily_minutes',
      'last_exported_at',
    ];
    const pairs = await Promise.all(keys.map(k => getSetting(k).then(v => [k, v] as [string, string])));
    setSettings(Object.fromEntries(pairs));
  }, []);

  useEffect(() => {
    if (seeded) refresh();
  }, [seeded, topics, webdevTopics, dsaRevisions, refresh]);

  // Find current DSA phase (first incomplete phase topic)
  const currentPhaseTopic = topics?.find(t => t.done < t.total) ?? null;

  // Next web dev topic (first non-done topic in an unlocked phase according to Phase lock rule)
  const nextWebdevTopic = webdevTopics?.find(
    t => t.status !== 'done' && !isWebDevPhaseLocked(t.phase, webdevTopics)
  ) ?? null;

  // DSA stats
  const dsaTotal = topics?.reduce((s, t) => s + t.total, 0) ?? 0;
  const dsaDone = topics?.reduce((s, t) => s + t.done, 0) ?? 0;
  const dsaPct = dsaTotal > 0 ? dsaDone / dsaTotal : 0;

  // Web dev stats
  const wdTotal = webdevTopics?.length ?? 0;
  const wdDone = webdevTopics?.filter(t => t.status === 'done').length ?? 0;
  const wdPct = wdTotal > 0 ? wdDone / wdTotal : 0;

  // Ahead/behind DSA linear pacing
  const dsaLinear = settings.dsa_start && settings.dsa_solve_deadline
    ? linearPlanFraction(settings.dsa_start, settings.dsa_solve_deadline)
    : 0;
  const dsaAheadBehind = dsaPct - dsaLinear; // positive = ahead

  // Date and Sunday status
  const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
  const isSunday = dayOfWeek === 'Sunday';
  const showReview = isSunday || previewReview;
  const dsaRevisionList = (dsaRevisions ?? []).filter(task =>
    task.status !== 'done' && (isSunday ? task.dueDate <= todayStr : task.status === 'open' && task.dueDate === todayStr)
  );

  // Web dev active day check
  const isWebdevDay = webdevTarget?.isWebdevDay ?? false;

  // Export warning calculation (> 7 days or never)
  const lastExportedIso = settings.last_exported_at;
  const daysSinceExport = lastExportedIso
    ? Math.floor((Date.now() - new Date(lastExportedIso).getTime()) / (24 * 3600 * 1000))
    : null;
  const showExportWarning = !lastExportedIso || (daysSinceExport !== null && daysSinceExport >= 7);

  // Quick one-click done for next web dev topic
  const handleOneClickWebdevDone = async () => {
    if (!nextWebdevTopic?.id) return;
    if (nextWebdevTopic.practical === true) {
      setProofModal(nextWebdevTopic);
      return;
    }
    const updates: Partial<WebDevTopic> = {
      status: 'done',
      doneAt: toLocalDateString(new Date()),
    };
    await updateWebDevTopic(nextWebdevTopic.id, updates);
    await markTodayWebdev();
    await refresh();
  };

  const handleQuickExport = async () => {
    const nowIso = new Date().toISOString();
    await setSetting('last_exported_at', nowIso);
    setSettings(prev => ({ ...prev, last_exported_at: nowIso }));

    const json = await exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prep-dashboard-backup-${nowIso.slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    await refresh();
  };

  if (!seeded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 animate-pulse">Loading dashboard…</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Top Warning Banners */}
      <div className="space-y-3">
        {/* 1. Missing Web Dev Deadline Warning */}
        {!settings.webdev_deadline && (
          <div className="flex items-center justify-between p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-amber-400 shrink-0" size={20} />
              <div>
                <div className="font-semibold text-sm">Web Dev Deadline Required</div>
                <div className="text-xs text-amber-400/80">
                  Set your web dev target deadline in Settings to calculate your daily topic pacing and schedule.
                </div>
              </div>
            </div>
            <Link
              href="/settings"
              className="min-h-11 text-xs px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 transition-colors shrink-0 font-medium flex items-center gap-1"
            >
              Set Deadline <ArrowRight size={13} />
            </Link>
          </div>
        )}

        {/* 2. No export in 7 days warning banner */}
        {showExportWarning && (
          <div className="flex items-center justify-between p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-rose-400 shrink-0" size={20} />
              <div>
                <div className="font-semibold text-sm">Data Backup Warning</div>
                <div className="text-xs text-rose-400/80">
                  {!lastExportedIso
                    ? "You haven't exported a backup yet. Export your data to prevent accidental data loss."
                    : `Last backup was ${daysSinceExport} days ago (exceeds 7-day limit). Export a fresh backup now.`}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleQuickExport}
                className="min-h-11 text-xs px-3 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30 transition-colors shrink-0 font-medium flex items-center gap-1.5"
              >
                <Download size={13} /> Export Backup
              </button>
              <Link
                href="/settings"
                className="min-h-11 text-xs px-2.5 rounded-lg border border-gray-700 text-gray-400 hover:text-gray-200 transition-colors shrink-0"
              >
                Settings
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Dashboard</h1>
          <div className="text-gray-500 text-sm flex flex-wrap items-center gap-3 mt-1">
            <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span className="text-gray-700">·</span>
            {/* Last Exported date display */}
            <span className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-900/60 px-2.5 py-1 rounded-md border border-gray-800">
              <Download size={12} className="text-gray-500" />
              <span>Last exported:</span>
              <strong className={lastExportedIso ? 'text-gray-200 font-normal' : 'text-amber-400 font-normal'}>
                {lastExportedIso
                  ? new Date(lastExportedIso).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                  : 'Never'}
              </strong>
            </span>
            <button
              onClick={() => setPreviewReview(p => !p)}
              className="min-h-11 px-2 text-[11px] rounded border border-gray-700 text-gray-400 hover:text-gray-200 transition-colors"
            >
              {showReview ? 'Hide Weekly Review' : 'Weekly Review Panel'}
            </button>
          </div>
        </div>

        {/* Combined Streak */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${streak > 0 ? 'bg-orange-500/10 border-orange-500/30' : 'bg-gray-800 border-gray-700'}`}>
          <Flame size={18} className={streak > 0 ? 'text-orange-400' : 'text-gray-600'} />
          <span className={`font-bold text-lg ${streak > 0 ? 'text-orange-400' : 'text-gray-600'}`}>{streak}</span>
          <span className="text-xs text-gray-500">day combined streak</span>
        </div>
      </div>

      {/* Weekly review panel (Sunday or preview) */}
      {showReview && (
        <div className="glass rounded-xl p-5 border-l-4 border-violet-500 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-violet-400" />
              <h3 className="text-violet-300 font-semibold text-sm uppercase tracking-wide">
                {isSunday ? 'Sunday Weekly Review & Catch-up 🗓️' : 'Weekly Review (Preview)'}
              </h3>
            </div>
            <span className="text-xs text-gray-500">Sunday catch-up: 0 new topics</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="bg-gray-900/40 rounded-lg p-3 border border-gray-800">
              <span className="text-[11px] text-gray-500 uppercase tracking-wider block mb-1">Revisions done / missed</span>
              <div className="text-lg font-bold text-cyan-300">{revisionReview.done} / {revisionReview.missed}</div>
              <p className="text-xs text-gray-500 mt-0.5">Collapsed: {revisionReview.collapsed}</p>
            </div>
            <div className="bg-gray-900/40 rounded-lg p-3 border border-gray-800">
              <span className="text-[11px] text-gray-500 uppercase tracking-wider block mb-1">DSA Daily Quota</span>
              <div className="text-lg font-bold text-cyan-400">
                {quotaDetails?.quota ?? 0} <span className="text-xs font-normal text-gray-500">probs/active day</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {isSunday ? 'Sunday is catch-up only (0 new topics)' : 'Paced across remaining Mon–Sat solve days'}
              </p>
            </div>

            <div className="bg-gray-900/40 rounded-lg p-3 border border-gray-800">
              <span className="text-[11px] text-gray-500 uppercase tracking-wider block mb-1">Total Backlog Size</span>
              <div className="text-lg font-bold text-gray-200">
                {dsaTotal - dsaDone} <span className="text-xs text-gray-500 font-normal">DSA</span> · {wdTotal - wdDone} <span className="text-xs text-gray-500 font-normal">Web Dev</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {(dsaTotal - dsaDone) + (wdTotal - wdDone)} items remaining overall
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Today's blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* DSA Today */}
        <div className="glass rounded-xl p-5 border-violet-500/20 glow-violet flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-200 flex items-center gap-2">
                <Code2 className="text-violet-400" size={18} /> DSA Today
              </h2>
              <div className="flex items-center gap-2">
                {isSunday && (
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    Catch-up Day
                  </span>
                )}
                {todayStreak?.dsaDone && (
                  <span className="flex items-center gap-1 text-xs text-emerald-400">
                    <CheckCircle2 size={12} /> Done today
                  </span>
                )}
                <Link
                  href="/dsa"
                  className="min-h-11 px-2 flex items-center text-xs rounded-lg border border-violet-500/30 text-violet-400 hover:bg-violet-500/10 transition-colors"
                >
                  Open →
                </Link>
              </div>

            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <Target size={14} className="text-violet-400 shrink-0" />
                <span className="text-xs text-gray-500 w-28 shrink-0">Daily quota</span>
                <span className="text-sm text-gray-200 font-medium">
                  {isSunday ? (
                    <span className="text-amber-400">0 problems (Sunday catch-up)</span>
                  ) : !quotaDetails?.isDsaDay ? (
                    <span className="text-gray-400">0 problems (Off day)</span>
                  ) : (
                    <span>
                      {quotaDetails?.quota ?? 0} problems{' '}
                      <span className="text-xs text-gray-500 font-normal">
                        ({quotaDetails?.remainingProblems} left / {quotaDetails?.remainingSolveDays} days)
                      </span>
                    </span>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Zap size={14} className="text-cyan-400 shrink-0" />
                <span className="text-xs text-gray-500 w-28 shrink-0">Current phase</span>
                <span className="text-sm text-gray-200 font-medium">
                  {currentPhaseTopic
                    ? `${dsaTopicPhase(currentPhaseTopic.name)} · ${currentPhaseTopic.name}`
                    : 'All done! 🎉'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-violet-400 shrink-0" />
                <span className="text-xs text-gray-500 w-28 shrink-0">Schedule</span>
                <span className="text-xs text-gray-300 font-mono">
                  {settings.dsa_days || 'Mon–Sat'}
                </span>
              </div>

              {settings.dsa_daily_minutes && (
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-violet-400 shrink-0" />
                  <span className="text-xs text-gray-500 w-28 shrink-0">Target time</span>
                  <span className="text-xs text-gray-300">{settings.dsa_daily_minutes} mins</span>
                </div>
              )}
            </div>
            <div className="pt-2 mt-3 border-t border-gray-800/60">
              <div className="text-[11px] uppercase tracking-wider text-gray-500 mb-1">
                {isSunday ? 'All due and overdue revisions' : 'Revisions due today'} ({dsaRevisionList.length})
              </div>
              {dsaRevisionList.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {dsaRevisionList.map(task => (
                    <span key={task.id} className="text-[11px] px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300">
                      {task.topicName} {task.pass} · {task.completed}/{task.target}
                    </span>
                  ))}
                </div>
              ) : <p className="text-xs text-gray-600">None due.</p>}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-800/60">
            <span className="text-[11px] text-gray-500 block mb-1">Next up:</span>
            <span className="text-xs text-gray-300 font-medium">
              {currentPhaseTopic ? `${currentPhaseTopic.name} (${currentPhaseTopic.done}/${currentPhaseTopic.total} solved)` : 'Complete!'}
            </span>
          </div>
        </div>

        {/* Web Dev Today */}
        <div className={`glass rounded-xl p-5 border-cyan-500/20 ${isWebdevDay ? 'glow-cyan' : 'border-gray-800'} flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-200 flex items-center gap-2">
                <Globe className="text-cyan-400" size={18} /> Web Dev Today
              </h2>
              <div className="flex items-center gap-2">
                {isWebdevDay ? (
                  <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                    Active Day
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-800 border border-gray-700 text-gray-400">
                    Off day
                  </span>
                )}
                {todayStreak?.webdevDone && (
                  <span className="flex items-center gap-1 text-xs text-emerald-400">
                    <CheckCircle2 size={12} /> Done today
                  </span>
                )}
                <Link
                  href="/webdev"
                  className="min-h-11 px-2 flex items-center text-xs rounded-lg border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                >
                  Open →
                </Link>
              </div>
            </div>

            <div className="space-y-2.5">
              {/* Next topic row */}
              <div className="flex items-center gap-2">
                <ChevronRight size={14} className={isWebdevDay ? 'text-cyan-400' : 'text-gray-600'} />
                <span className="text-xs text-gray-500 w-28 shrink-0">Next topic</span>
                <span className={`min-w-0 break-words text-sm font-medium ${isWebdevDay ? 'text-gray-200' : 'text-gray-600 line-through'}`}>
                  {nextWebdevTopic ? nextWebdevTopic.name : wdTotal === 0 ? 'No topics yet' : 'All done! 🎉'}
                </span>
              </div>

              {/* Phase row */}
              <div className="flex items-center gap-2">
                <Calendar size={14} className={isWebdevDay ? 'text-gray-400' : 'text-gray-600'} />
                <span className="text-xs text-gray-500 w-28 shrink-0">Phase</span>
                <span className={`text-sm ${isWebdevDay ? 'text-gray-300' : 'text-gray-600'}`}>
                  {nextWebdevTopic ? `Phase ${nextWebdevTopic.phase} (${nextWebdevTopic.importance})` : '—'}
                </span>
              </div>

              {/* Daily target: remaining weighted topics / remaining webdev_days */}
              <div className="flex items-center gap-2">
                <Target size={14} className={isWebdevDay ? 'text-cyan-400' : 'text-gray-600'} />
                <span className="text-xs text-gray-500 w-28 shrink-0">Daily target</span>
                <span className="text-sm font-medium text-gray-200">
                  {webdevTarget?.hasDeadline ? (
                    <span>
                      {webdevTarget.targetPointsPerDay} pts/day{' '}
                      <span className="text-xs text-gray-500 font-normal">
                        ({webdevTarget.remainingPoints} pts / {webdevTarget.remainingWebdevDays} web dev days)
                      </span>
                    </span>
                  ) : (
                    <span className="text-amber-400 text-xs">Set deadline in Settings</span>
                  )}
                </span>
              </div>

              {/* Schedule */}
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-cyan-400 shrink-0" />
                <span className="text-xs text-gray-500 w-28 shrink-0">Schedule</span>
                <span className="text-xs text-gray-300 font-mono">
                  {settings.webdev_days || 'Tue, Thu, Sat'}
                </span>
              </div>

              {settings.webdev_daily_minutes && (
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-cyan-400 shrink-0" />
                  <span className="text-xs text-gray-500 w-28 shrink-0">Target time</span>
                  <span className="text-xs text-gray-300">{settings.webdev_daily_minutes} mins</span>
                </div>
              )}
            </div>
          </div>

          {/* Action on Active vs Off day */}
          <div className="mt-4 pt-3 border-t border-gray-800/60">
            {isWebdevDay ? (
              nextWebdevTopic ? (
                <button
                  onClick={handleOneClickWebdevDone}
                  className="min-h-11 w-full text-xs rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 transition-all font-medium flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 size={14} className="text-cyan-400" />
                  One-click done: Mark &quot;{nextWebdevTopic.name}&quot; complete
                </button>
              ) : (
                <div className="text-xs text-emerald-400 text-center py-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  All web dev topics completed! 🎉
                </div>
              )
            ) : (
              <div className="text-xs text-gray-500 text-center py-2 bg-gray-900/50 rounded-lg border border-gray-800 flex items-center justify-center gap-1.5">
                <Clock size={13} className="text-gray-600" />
                {isSunday ? 'Sunday catch-up — no new web dev topics today' : 'Off day — web dev track paused today'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Countdown cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {settings.dsa_solve_deadline && (
          <CountdownCard
            label="DSA Solve"
            date={settings.dsa_solve_deadline}
            color="violet"
          />
        )}
        {settings.dsa_final_deadline && (
          <CountdownCard
            label="DSA Final"
            date={settings.dsa_final_deadline}
            color="rose"
          />
        )}
        {settings.webdev_deadline ? (
          <CountdownCard
            label="Web Dev"
            date={settings.webdev_deadline}
            color="cyan"
          />
        ) : (
          <div className="glass rounded-xl p-4 flex flex-col items-center justify-center text-center border border-amber-500/30">
            <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">Web Dev</span>
            <span className="text-sm font-semibold text-amber-400">Not set</span>
            <Link href="/settings" className="min-h-11 flex items-center text-xs text-cyan-400 hover:underline mt-1">Set deadline →</Link>
          </div>
        )}
        <div className="glass rounded-xl p-4 flex flex-col justify-center items-center">
          <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">DSA Plan</span>
          <AheadBehindBadge delta={dsaAheadBehind} />
        </div>
      </div>

      {/* Progress rings */}
      <div className="glass rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">Overall Progress</h2>
        <div className="grid grid-cols-2 gap-8">
          <ProgressSection
            label="DSA"
            pct={dsaPct}
            done={dsaDone}
            total={dsaTotal}
            color="violet"
            topics={topics ?? []}
          />
          <ProgressSection
            label="Web Dev"
            pct={wdPct}
            done={wdDone}
            total={wdTotal}
            color="cyan"
            topics={[]}
            webdevTopics={webdevTopics ?? []}
          />
        </div>
      </div>

      {/* Quick-add: mark a DSA problem done */}
      <div className="glass rounded-xl p-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Add — Mark DSA Done</h2>
        <p className="text-xs text-gray-600 mb-3">Increment any topic&apos;s done count without leaving this page.</p>
        <div className="flex flex-wrap gap-2">
          {topics?.filter(t => t.done < t.total).slice(0, 8).map(t => (
            <button
              key={t.id}
              onClick={async () => {
                if (t.id !== undefined) {
                  await incrementDone(t.id);
                  await refresh();
                }
              }}
              className="min-h-11 px-3 rounded-lg bg-violet-600/10 border border-violet-500/20 text-violet-300 hover:bg-violet-600/20 transition-colors"
            >
              +1 {t.name} ({t.done}/{t.total})
            </button>
          ))}
        </div>
      </div>

      {proofModal && (
        <ProofModal
          topic={proofModal}
          onClose={() => setProofModal(null)}
          onSave={async (proofLink, breakFixNote) => {
            if (proofModal.id === undefined) return;
            await updateWebDevTopic(proofModal.id, {
              status: 'done',
              proofLink,
              breakFixNote,
              doneAt: toLocalDateString(new Date()),
            });
            await markTodayWebdev();
            setProofModal(null);
            await refresh();
          }}
        />
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function CountdownCard({ label, date, color }: { label: string; date: string; color: 'violet' | 'rose' | 'cyan' }) {
  const days = daysUntil(date);
  const colorMap = {
    violet: 'text-violet-400',
    rose: 'text-rose-400',
    cyan: 'text-cyan-400',
  };

  return (
    <div className="glass rounded-xl p-4 flex flex-col items-center justify-center text-center">
      <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</span>
      <span className={`text-2xl font-bold ${colorMap[color]}`}>{days}</span>
      <span className="text-xs text-gray-600">days left</span>
      <span className="text-xs text-gray-700 mt-1">{date}</span>
    </div>
  );
}

function AheadBehindBadge({ delta }: { delta: number }) {
  const pct = Math.abs(delta * 100).toFixed(1);
  if (delta > 0.01) {
    return (
      <div className="flex flex-col items-center">
        <TrendingUp size={20} className="text-emerald-400" />
        <span className="text-emerald-400 font-semibold">{pct}% ahead</span>
      </div>
    );
  }
  if (delta < -0.01) {
    return (
      <div className="flex flex-col items-center">
        <TrendingDown size={20} className="text-rose-400" />
        <span className="text-rose-400 font-semibold">{pct}% behind</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center">
      <MinusIcon size={20} className="text-gray-400" />
      <span className="text-gray-400 font-semibold">On track</span>
    </div>
  );
}

function ProgressRing({ pct, color, size = 80 }: { pct: number; color: string; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1f2937" strokeWidth={6} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
    </svg>
  );
}

function ProgressSection({
  label, pct, done, total, color, topics, webdevTopics,
}: {
  label: string;
  pct: number;
  done: number;
  total: number;
  color: 'violet' | 'cyan';
  topics: DsaTopic[];
  webdevTopics?: WebDevTopic[];
}) {
  const strokeColor = color === 'violet' ? '#8b5cf6' : '#06b6d4';
  const textColor = color === 'violet' ? 'text-violet-400' : 'text-cyan-400';

  const bars = topics.length > 0
    ? topics.map(t => ({ label: t.name, pct: t.total > 0 ? t.done / t.total : 0 }))
    : webdevTopics
      ? (() => {
          const phases = [...new Set(webdevTopics.map(t => t.phase))].sort();
          return phases.map(ph => {
            const phTopics = webdevTopics.filter(t => t.phase === ph);
            const phDone = phTopics.filter(t => t.status === 'done').length;
            return { label: `Phase ${ph}`, pct: phTopics.length > 0 ? phDone / phTopics.length : 0 };
          });
        })()
      : [];

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <div className="relative">
          <ProgressRing pct={pct} color={strokeColor} size={80} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-sm font-bold ${textColor}`}>{(pct * 100).toFixed(0)}%</span>
          </div>
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-200">{label}</h3>
          <p className="text-sm text-gray-500">{done} / {total} {label === 'DSA' ? 'problems' : 'topics'}</p>
        </div>
      </div>
      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2">
        {bars.map(b => (
          <div key={b.label} className="flex items-center gap-2">
            <span className="text-xs text-gray-600 w-28 truncate shrink-0">{b.label}</span>
            <div className="flex-1 h-1 rounded-full bg-gray-800">
              <div
                className={`h-full rounded-full ${color === 'violet' ? 'bg-violet-400' : 'bg-cyan-400'} transition-all duration-500`}
                style={{ width: `${b.pct * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-600 w-8 text-right">{(b.pct * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
