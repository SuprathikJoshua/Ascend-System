'use client';

import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, seedIfEmpty, markTodayWebdev, getDailyWebdevTarget, isWebDevPhaseLocked, type WebDevTopic, type WebDevStatus } from '@/lib/db';
import { Globe, Lock, CheckCircle2, BookOpen, Wrench, Circle, ExternalLink, Filter, Target, Zap, ChevronRight } from 'lucide-react';
import ProofModal from '@/components/webdev/ProofModal';

const PLACEHOLDER_PROOF = 'Completed via dashboard one-click';
const PLACEHOLDER_BREAK_FIX = 'Completed';

const STATUS_CONFIG: Record<WebDevStatus, { label: string; color: string; icon: React.ReactNode }> = {
  todo: { label: 'To Do', color: 'text-gray-500', icon: <Circle size={14} className="text-gray-600" /> },
  learning: { label: 'Learning', color: 'text-blue-400', icon: <BookOpen size={14} className="text-blue-400" /> },
  built: { label: 'Built', color: 'text-amber-400', icon: <Wrench size={14} className="text-amber-400" /> },
  done: { label: 'Done', color: 'text-emerald-400', icon: <CheckCircle2 size={14} className="text-emerald-400" /> },
};

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: 'text-emerald-400 bg-emerald-400/10 border-emerald-500/30',
  Medium: 'text-amber-400 bg-amber-400/10 border-amber-500/30',
  Hard: 'text-rose-400 bg-rose-400/10 border-rose-500/30',
};

const IMPORTANCE_COLORS: Record<string, string> = {
  Critical: 'text-rose-400 bg-rose-400/10 border-rose-500/30',
  Core: 'text-violet-400 bg-violet-400/10 border-violet-500/30',
  High: 'text-blue-400 bg-blue-400/10 border-blue-500/30',
  Medium: 'text-gray-400 bg-gray-400/10 border-gray-500/30',
  Low: 'text-gray-600 bg-gray-600/10 border-gray-600/30',
  'Low–Medium': 'text-gray-500 bg-gray-500/10 border-gray-500/30',
};

export default function WebDevPage() {
  const [seeded, setSeeded] = useState(false);
  const [filterPhase, setFilterPhase] = useState<number | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<WebDevStatus | 'all'>('all');
  const [filterImportance, setFilterImportance] = useState<string | 'all'>('all');
  const [filterPractical, setFilterPractical] = useState<'all' | 'yes' | 'no'>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [proofModal, setProofModal] = useState<WebDevTopic | null>(null);
  const [targetInfo, setTargetInfo] = useState<{
    targetPointsPerDay: number;
    remainingPoints: number;
    remainingTopics: number;
    remainingWebdevDays: number;
    hasDeadline: boolean;
  } | null>(null);

  const topics = useLiveQuery(() => db.webdevTopics.orderBy('order').toArray(), []);

  useEffect(() => {
    seedIfEmpty().then(() => setSeeded(true));
  }, []);

  useEffect(() => {
    if (seeded) {
      getDailyWebdevTarget().then(setTargetInfo);
    }
  }, [seeded, topics]);

  const phases = topics ? [...new Set(topics.map(t => t.phase))].sort((a, b) => a - b) : [];

  const isPhaseLocked = (ph: number) => {
    return isWebDevPhaseLocked(ph, topics ?? []);
  };

  // Find next topic in sequence from unlocked phases
  const nextTopicInOrder = topics?.find(t => t.status !== 'done' && !isWebDevPhaseLocked(t.phase, topics)) ?? null;

  const filteredTopics = topics?.filter(t => {
    if (filterPhase !== 'all' && t.phase !== filterPhase) return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (filterImportance !== 'all' && t.importance !== filterImportance) return false;
    if (filterPractical === 'yes' && t.practical !== true) return false;
    if (filterPractical === 'no' && t.practical !== false) return false;
    return true;
  });

  const updateStatus = async (topic: WebDevTopic, newStatus: WebDevStatus) => {
    if (topic.id === undefined) return;
    if (newStatus === 'done' && topic.practical === true) {
      const hasProof = Boolean(topic.proofLink?.trim()) && topic.proofLink !== PLACEHOLDER_PROOF;
      const hasBreakFix = Boolean(topic.breakFixNote?.trim()) && topic.breakFixNote !== PLACEHOLDER_BREAK_FIX;
      if (!hasProof || !hasBreakFix) {
        setProofModal(topic);
        return;
      }
    }
    const updates: Partial<WebDevTopic> = { status: newStatus };
    if (newStatus === 'learning' && !topic.startedAt) {
      updates.startedAt = new Date().toISOString().slice(0, 10);
    }
    if (newStatus === 'done') {
      updates.doneAt = new Date().toISOString().slice(0, 10);
      await markTodayWebdev();
    }
    await db.webdevTopics.update(topic.id, updates);
  };

  const updateNotes = async (id: number, notes: string) => {
    await db.webdevTopics.update(id, { notes });
  };

  if (!seeded || !topics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 animate-pulse">Loading Web Dev tracker…</div>
      </div>
    );
  }

  const wdDone = topics.filter(t => t.status === 'done').length;
  const wdPct = topics.length > 0 ? (wdDone / topics.length) * 100 : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <Globe className="text-cyan-400" size={24} />
            Web Dev Tracker
          </h1>
          <p className="text-gray-500 text-sm mt-1">Sequential phases · Phase 0 runs in parallel with Phase 1</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-cyan-400">{wdPct.toFixed(1)}%</div>
          <div className="text-xs text-gray-500">{wdDone} / {topics.length} done</div>
        </div>
      </div>

      {/* Stats row */}
      {topics.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass rounded-xl p-4 border border-cyan-500/20 glow-cyan">
            <div className="flex items-center gap-2 mb-1">
              <Target size={16} className="text-cyan-400" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Daily Target</span>
            </div>
            <div className="text-xl font-bold text-gray-100">
              {targetInfo && targetInfo.targetPointsPerDay > 0
                ? `${targetInfo.targetPointsPerDay} pts / day`
                : 'Set deadline in settings'}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {targetInfo && targetInfo.remainingWebdevDays > 0
                ? `${targetInfo.remainingPoints} weighted pts ÷ ${targetInfo.remainingWebdevDays} web dev days`
                : 'Weighted: Easy 1, Medium 2, Hard 3'}
            </p>
          </div>

          <div className="glass rounded-xl p-4 border border-violet-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={16} className="text-violet-400" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Backlog</span>
            </div>
            <div className="text-xl font-bold text-gray-100">
              {topics.length - wdDone} <span className="text-sm text-gray-500 font-normal">topics remaining</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {topics.filter(t => t.practical === true && t.status !== 'done').length} practical builds pending
            </p>
          </div>

          <div className="glass rounded-xl p-4 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-1">
              <ChevronRight size={16} className="text-emerald-400" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Next In Order</span>
            </div>
            <div className="text-sm font-semibold text-gray-200 truncate">
              {nextTopicInOrder ? nextTopicInOrder.name : 'All completed! 🎉'}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {nextTopicInOrder ? `Phase ${nextTopicInOrder.phase} · ${nextTopicInOrder.difficulty} · ${nextTopicInOrder.importance}` : 'Roadmap complete'}
            </p>
          </div>
        </div>
      )}

      {topics.length === 0 && (
        <div className="glass rounded-xl p-8 text-center">
          <Globe size={40} className="text-gray-700 mx-auto mb-3" />
          <h2 className="text-gray-400 font-semibold mb-2">No Web Dev Topics Yet</h2>
          <p className="text-gray-600 text-sm">
            Roadmap topics are being seeded from backend-web-dev-mastery-roadmap.md.
          </p>
        </div>
      )}

      {topics.length > 0 && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <Filter size={14} className="text-gray-500" />
            <select
              value={String(filterPhase)}
              onChange={e => setFilterPhase(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="text-xs rounded-lg bg-gray-900 border border-gray-700 text-gray-300 px-2 py-1.5 focus:outline-none"
            >
              <option value="all">All Phases</option>
              {phases.map(ph => <option key={ph} value={ph}>Phase {ph}</option>)}
            </select>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as WebDevStatus | 'all')}
              className="text-xs rounded-lg bg-gray-900 border border-gray-700 text-gray-300 px-2 py-1.5 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="todo">To Do</option>
              <option value="learning">Learning</option>
              <option value="built">Built</option>
              <option value="done">Done</option>
            </select>
            <select
              value={filterImportance}
              onChange={e => setFilterImportance(e.target.value)}
              className="text-xs rounded-lg bg-gray-900 border border-gray-700 text-gray-300 px-2 py-1.5 focus:outline-none"
            >
              <option value="all">All Importance</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <select
              value={filterPractical}
              onChange={e => setFilterPractical(e.target.value as 'all' | 'yes' | 'no')}
              className="text-xs rounded-lg bg-gray-900 border border-gray-700 text-gray-300 px-2 py-1.5 focus:outline-none"
            >
              <option value="all">All Practical</option>
              <option value="yes">Practical Required</option>
              <option value="no">No Practical</option>
            </select>
            <span className="text-xs text-gray-600 ml-auto">{filteredTopics?.length} topics shown</span>
          </div>

          {/* Topics grouped by phase */}
          {phases.filter(ph => filterPhase === 'all' || filterPhase === ph).map(ph => {
            const phTopics = filteredTopics?.filter(t => t.phase === ph) ?? [];
            if (phTopics.length === 0) return null;
            const locked = isPhaseLocked(ph);
            const phAll = topics.filter(t => t.phase === ph);
            const phDone = phAll.filter(t => t.status === 'done').length;
            const phPct = phAll.length > 0 ? (phDone / phAll.length) * 100 : 0;

            return (
              <div key={ph} className={`glass rounded-xl overflow-hidden ${locked ? 'opacity-60' : ''}`}>
                {/* Phase header */}
                <div className="px-4 py-3 flex items-center justify-between border-b border-gray-800/50">
                  <div className="flex items-center gap-3">
                    {locked && <Lock size={14} className="text-gray-600" />}
                    <span className="text-sm font-semibold text-gray-200">Phase {ph}</span>
                    {ph === 0 && <span className="text-xs text-cyan-400 bg-cyan-400/10 border border-cyan-500/30 rounded px-1.5 py-0.5">Parallel</span>}
                    {locked && <span className="text-xs text-gray-600">Complete previous phase to unlock</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-200">{phPct.toFixed(0)}%</span>
                    <span className="text-xs text-gray-500">{phDone}/{phAll.length}</span>
                    <div className="w-24 h-1.5 rounded-full bg-gray-800">
                      <div className="h-full rounded-full bg-cyan-400 transition-all duration-500" style={{ width: `${phPct}%` }} />
                    </div>
                  </div>
                </div>

                {/* Topics */}
                <div className="divide-y divide-gray-800/30">
                  {phTopics.map(topic => {
                    const isExpanded = expandedId === topic.id;
                    const config = STATUS_CONFIG[topic.status];
                    const resources = topic.resourceLinks ? JSON.parse(topic.resourceLinks) as { label: string; url: string }[] : [];

                    return (
                      <div key={topic.id} className="group/row">
                        <div className="px-4 py-3 flex items-center gap-3">
                          {/* Status icon */}
                          {config.icon}

                          {/* Name */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-sm font-medium ${topic.status === 'done' ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                                {topic.name}
                              </span>
                              <span className={`text-xs px-1.5 py-0.5 rounded border ${DIFFICULTY_COLORS[topic.difficulty]}`}>
                                {topic.difficulty}
                              </span>
                              <span className={`text-xs px-1.5 py-0.5 rounded border ${IMPORTANCE_COLORS[topic.importance]}`}>
                                {topic.importance}
                              </span>
                              {topic.practical === true && (
                                <span className="text-xs px-1.5 py-0.5 rounded border text-amber-400 bg-amber-400/10 border-amber-500/30">
                                  Practical Required
                                </span>
                              )}
                              {topic.practical === 'optional' && (
                                <span className="text-xs px-1.5 py-0.5 rounded border text-gray-500 bg-gray-500/10 border-gray-500/30">
                                  Optional
                                </span>
                              )}
                            </div>
                            {topic.startedAt && (
                              <p className="text-xs text-gray-600 mt-0.5">
                                Started {topic.startedAt}
                                {topic.doneAt ? ` · Done ${topic.doneAt}` : ''}
                              </p>
                            )}
                          </div>

                          {/* Status controls */}
                          {!locked && (
                            <div className="flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                              {(['todo', 'learning', 'built', 'done'] as WebDevStatus[]).map(s => (
                                <button
                                  key={s}
                                  onClick={() => updateStatus(topic, s)}
                                  className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                                    topic.status === s
                                      ? STATUS_CONFIG[s].color + ' bg-current/10 border-current/30 opacity-100'
                                      : 'text-gray-600 border-gray-700 hover:text-gray-400'
                                  }`}
                                >
                                  {STATUS_CONFIG[s].label}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Expand notes/resources */}
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : (topic.id ?? null))}
                            className="text-xs text-gray-600 hover:text-gray-400 transition-colors ml-2"
                          >
                            {isExpanded ? '▲' : '▼'}
                          </button>
                        </div>

                        {/* Expanded: notes, resources, proof */}
                        {isExpanded && (
                          <div className="px-4 pb-4 space-y-3 border-t border-gray-800/30 bg-gray-900/20 pt-3">
                            {/* Resources */}
                            {resources.length > 0 && (
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Resources</p>
                                <div className="flex flex-wrap gap-2">
                                  {resources.map((r, i) => (
                                    <a
                                      key={i}
                                      href={r.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-gray-800 border border-gray-700 text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                      <ExternalLink size={10} /> {r.label}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Notes */}
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Notes</p>
                              <textarea
                                defaultValue={topic.notes ?? ''}
                                onBlur={e => topic.id !== undefined && updateNotes(topic.id, e.target.value)}
                                placeholder="Add notes…"
                                rows={2}
                                className="w-full text-xs rounded-lg bg-gray-900 border border-gray-700 text-gray-300 placeholder-gray-600 px-3 py-2 resize-none focus:outline-none focus:border-cyan-500 transition-colors"
                              />
                            </div>

                            {/* Proof (if practical) */}
                            {topic.practical === true && (
                              <div className="space-y-2">
                                <p className="text-xs text-amber-400 font-medium">⚠ Practical Required — proof needed to mark Done</p>
                                <input
                                  type="url"
                                  defaultValue={topic.proofLink ?? ''}
                                  onBlur={e => topic.id !== undefined && db.webdevTopics.update(topic.id, { proofLink: e.target.value })}
                                  placeholder="Repo / commit link (proof)"
                                  className="w-full text-xs rounded-lg bg-gray-900 border border-gray-700 text-gray-300 placeholder-gray-600 px-3 py-2 focus:outline-none focus:border-cyan-500 transition-colors"
                                />
                                <input
                                  type="text"
                                  defaultValue={topic.breakFixNote ?? ''}
                                  onBlur={e => topic.id !== undefined && db.webdevTopics.update(topic.id, { breakFixNote: e.target.value })}
                                  placeholder="What I broke and how I fixed it…"
                                  className="w-full text-xs rounded-lg bg-gray-900 border border-gray-700 text-gray-300 placeholder-gray-600 px-3 py-2 focus:outline-none focus:border-cyan-500 transition-colors"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* Proof required modal */}
      {proofModal && (
        <ProofModal
          topic={proofModal}
          onSave={async (proofLink, breakFixNote) => {
            if (proofModal.id !== undefined) {
              await db.webdevTopics.update(proofModal.id, {
                status: 'done',
                proofLink,
                breakFixNote,
                doneAt: new Date().toISOString().slice(0, 10),
              });
              await markTodayWebdev();
            }
            setProofModal(null);
          }}
          onClose={() => setProofModal(null)}
        />
      )}
    </div>
  );
}
