'use client';

import { useState } from 'react';
import type { WebDevTopic } from '@/lib/storage';

const PLACEHOLDER_PROOF = 'Completed via dashboard one-click';
const PLACEHOLDER_BREAK_FIX = 'Completed';

interface Props {
  topic: WebDevTopic;
  onSave: (proofLink: string, breakFixNote: string) => void | Promise<void>;
  onClose: () => void;
}

export default function ProofModal({ topic, onSave, onClose }: Props) {
  const [proof, setProof] = useState(topic.proofLink === PLACEHOLDER_PROOF ? '' : topic.proofLink ?? '');
  const [breakFix, setBreakFix] = useState(topic.breakFixNote === PLACEHOLDER_BREAK_FIX ? '' : topic.breakFixNote ?? '');
  const canSave = proof.trim().length > 0 && breakFix.trim().length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="glass rounded-2xl w-full max-w-md p-6 shadow-2xl border border-amber-500/30">
        <h2 className="text-lg font-bold text-amber-400 mb-1">Proof Required</h2>
        {topic.practical_action && (
          <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-3 mb-4">
            <p className="text-xs font-semibold text-cyan-300 mb-1">
              {topic.practical === 'optional' ? 'Optional · Practical task' : 'Practical task'}
            </p>
            <p className="text-sm text-gray-200">{topic.practical_action}</p>
          </div>
        )}
        <p className="text-sm text-gray-400 mb-4">{topic.name} is marked as Practical Required. Provide proof before marking Done.</p>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Repo / Commit Link</label>
            <input
              type="url"
              value={proof}
              onChange={e => setProof(e.target.value)}
              placeholder="https://github.com/..."
              className="w-full text-sm rounded-lg bg-gray-900 border border-gray-700 text-gray-200 px-3 py-2 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">What I broke and how I fixed it</label>
            <textarea
              value={breakFix}
              onChange={e => setBreakFix(e.target.value)}
              placeholder="Describe the bug/problem you hit and how you resolved it…"
              rows={3}
              className="w-full text-sm rounded-lg bg-gray-900 border border-gray-700 text-gray-200 px-3 py-2 resize-none focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="min-h-11 px-4 rounded-lg text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors">Cancel</button>
          <button
            onClick={() => canSave && onSave(proof.trim(), breakFix.trim())}
            disabled={!canSave}
            className="min-h-11 px-4 rounded-lg text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Mark Done
          </button>
        </div>
      </div>
    </div>
  );
}
