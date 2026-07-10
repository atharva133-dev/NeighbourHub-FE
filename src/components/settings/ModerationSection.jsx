import { useEffect, useState } from 'react';
import { ShieldCheck, BookOpen, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import ToggleSwitch from './ToggleSwitch';

const MAX_GUIDELINES = 1000;

export default function ModerationSection() {
  const { activeCommunityId } = useAuth();
  const [moderationEnabled, setModerationEnabled] = useState(true);
  const [guidelines, setGuidelines] = useState('');
  const [loadingToggle, setLoadingToggle] = useState(false);
  const [loadingGuidelines, setLoadingGuidelines] = useState(false);
  // null = loading, true/false = resolved
  const [isCommunityAdmin, setIsCommunityAdmin] = useState(null);

  // Fetch current community settings and check if the logged-in user is the community admin
  useEffect(() => {
    if (!activeCommunityId) {
      setIsCommunityAdmin(false);
      return;
    }
    api.get(`/community/${activeCommunityId}`)
      .then(({ data }) => {
        setModerationEnabled(data.moderationEnabled !== false);
        setGuidelines(data.communityGuidelines || '');
        // isAdmin is set by formatCommunity — true only for the community creator
        setIsCommunityAdmin(!!data.isAdmin);
      })
      .catch(() => setIsCommunityAdmin(false));
  }, [activeCommunityId]);

  const handleToggle = async (val) => {
    setModerationEnabled(val);
    setLoadingToggle(true);
    try {
      await api.patch(`/community/${activeCommunityId}/settings`, { moderationEnabled: val });
      toast.success('Moderation settings updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update settings');
      setModerationEnabled(!val); // revert on error
    } finally {
      setLoadingToggle(false);
    }
  };

  const handleSaveGuidelines = async () => {
    setLoadingGuidelines(true);
    try {
      await api.patch(`/community/${activeCommunityId}/settings`, {
        communityGuidelines: guidelines,
      });
      toast.success('Community guidelines saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save guidelines');
    } finally {
      setLoadingGuidelines(false);
    }
  };

  // Still loading community info
  if (isCommunityAdmin === null) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  // Not the community admin
  if (!isCommunityAdmin) {
    return (
      <div className="glass-card rounded-2xl border border-slate-200 bg-white/60 p-6 dark:border-white/10 dark:bg-white/5">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {activeCommunityId
            ? 'Only the community admin can manage moderation settings.'
            : 'No active community selected. Enter a community first to manage its settings.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Content Moderation card */}
      <div className="glass-card rounded-2xl border border-slate-200 bg-white/60 p-6 dark:border-white/10 dark:bg-white/5">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 shadow-md shadow-purple-500/20">
            <ShieldCheck className="h-5 w-5 text-white" />
          </span>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Content Moderation</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">AI-powered toxicity filtering for notices</p>
          </div>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Enable Content Moderation</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              When enabled, posts are automatically checked for inappropriate content using AI before being published.
            </p>
            {/* Status badge */}
            <div className="mt-3">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ${
                moderationEnabled
                  ? 'bg-green-100 text-green-700 ring-green-200 dark:bg-green-500/15 dark:text-green-300 dark:ring-green-400/20'
                  : 'bg-slate-100 text-slate-500 ring-slate-200 dark:bg-white/5 dark:text-slate-400 dark:ring-white/10'
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${moderationEnabled ? 'bg-green-500' : 'bg-slate-400'}`} />
                Moderation: {moderationEnabled ? 'ON' : 'OFF'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 pt-1">
            {loadingToggle && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
            <ToggleSwitch
              checked={moderationEnabled}
              onChange={handleToggle}
              disabled={loadingToggle}
            />
          </div>
        </div>
      </div>

      {/* Community Guidelines card */}
      <div className="glass-card rounded-2xl border border-slate-200 bg-white/60 p-6 dark:border-white/10 dark:bg-white/5">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md shadow-emerald-500/20">
            <BookOpen className="h-5 w-5 text-white" />
          </span>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Community Guidelines</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Visible to all community members</p>
          </div>
        </div>

        <textarea
          value={guidelines}
          onChange={(e) => setGuidelines(e.target.value.slice(0, MAX_GUIDELINES))}
          rows={6}
          maxLength={MAX_GUIDELINES}
          placeholder="Set rules for what's acceptable in this community..."
          className="glass-input w-full resize-none text-sm"
        />
        <p className={`mt-1.5 text-right text-xs font-medium tabular-nums ${
          guidelines.length >= MAX_GUIDELINES
            ? 'text-red-500 dark:text-red-400'
            : guidelines.length >= MAX_GUIDELINES - 100
              ? 'text-amber-500 dark:text-amber-400'
              : 'text-slate-400 dark:text-slate-500'
        }`}>
          {guidelines.length} / {MAX_GUIDELINES}
        </p>

        <button
          type="button"
          onClick={handleSaveGuidelines}
          disabled={loadingGuidelines}
          className="mt-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5 hover:shadow-emerald-500/30 disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {loadingGuidelines ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Guidelines
        </button>
      </div>
    </div>
  );
}
