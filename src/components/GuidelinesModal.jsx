import { useEffect, useState } from 'react';
import { X, BookOpen } from 'lucide-react';
import api from '../api/axios';

export default function GuidelinesModal({ communityId, onClose }) {
  const [guidelines, setGuidelines] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!communityId) { setLoading(false); return; }
    api.get(`/community/${communityId}`)
      .then(({ data }) => setGuidelines(data.communityGuidelines || ''))
      .catch(() => setGuidelines(''))
      .finally(() => setLoading(false));
  }, [communityId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm modal-overlay"
      onClick={onClose}>
      <div className="modal-content w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#1a1a2e]"
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Community Guidelines</h2>
          </div>
          <button type="button" onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {loading ? (
            <div className="space-y-3">
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-4/5" />
              <div className="skeleton h-4 w-3/5" />
            </div>
          ) : guidelines ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {guidelines}
            </p>
          ) : (
            <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">
              No guidelines set by admin yet.
            </p>
          )}
        </div>

        <div className="border-t border-slate-100 px-6 py-4 dark:border-white/10">
          <button type="button" onClick={onClose}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
