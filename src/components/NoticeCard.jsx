import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Pin, Trash2, Clock, ExternalLink, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import CommentSection from './CommentSection';

const CATEGORY_STYLES = {
  General: 'bg-blue-500/15 text-blue-200 ring-blue-400/20',
  Event: 'bg-emerald-500/15 text-emerald-200 ring-emerald-400/20',
  'Lost & Found': 'bg-amber-500/15 text-amber-200 ring-amber-400/20',
  Emergency: 'bg-red-500/15 text-red-200 ring-red-400/20',
};

const PRIORITY_STYLES = {
  Low: 'bg-green-500/15 text-green-200 ring-green-400/25',
  Medium: 'bg-yellow-500/15 text-yellow-100 ring-yellow-400/25',
  High: 'bg-orange-500/15 text-orange-200 ring-orange-400/25',
  Urgent: 'bg-red-500/15 text-red-200 ring-red-400/25',
};

function formatDate(date) {
  return new Date(date).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(date);
}

export default function NoticeCard({ notice, onUpdate, onDelete }) {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [timeDisplay, setTimeDisplay] = useState(timeAgo(notice.createdAt));
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeDisplay(timeAgo(notice.createdAt));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [notice.createdAt]);

  const likes = notice.likes || [];
  const priority = notice.priority || (notice.category === 'Emergency' ? 'Urgent' : 'Medium');
  const likedByUser = user
    ? likes.some((like) => (typeof like === 'string' ? like : like._id) === user.id)
    : false;

  const isNew = (new Date() - new Date(notice.createdAt)) < 300000; // 5 minutes
  const userId = user?._id || user?.id;
  const authorId = typeof notice.author === 'object' ? notice.author._id : notice.author;
  const isAuthor = userId && authorId && String(userId) === String(authorId);
  const canDelete = isAdmin || isAuthor;

  const handlePin = async () => {
    setActionLoading(true);
    try {
      const { data } = await api.patch(`/notices/${notice._id}/pin`);
      onUpdate?.(data);
      toast.success(data.pinned ? 'Notice pinned' : 'Notice unpinned');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update pin');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) return;
    setLikeLoading(true);
    try {
      const { data } = await api.patch(`/notices/${notice._id}/like`);
      onUpdate?.(data);
      toast.success(likedByUser ? 'Like removed' : 'Notice liked');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update like');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await api.delete(`/notices/${notice._id}`);
      onDelete?.(notice._id);
      toast.success('Notice deleted successfully');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete notice';
      if (err.response?.status === 403) {
        toast.error('You can only delete your own notices');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <article className="glass-card p-5 transition duration-300 hover:-translate-y-1 hover:border-blue-400/30 hover:bg-white/15 relative z-0">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {isNew && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2.5 py-1 text-xs font-semibold text-green-200 ring-1 ring-green-400/20 animate-pulse">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              Just posted
            </span>
          )}
          {notice.pinned && (
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/15 px-2.5 py-1 text-xs font-semibold text-violet-200 ring-1 ring-violet-400/20">
              <Pin className="h-3 w-3" />
              Pinned
            </span>
          )}
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${CATEGORY_STYLES[notice.category] || CATEGORY_STYLES.General}`}
          >
            {notice.category}
          </span>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${PRIORITY_STYLES[priority] || PRIORITY_STYLES.Medium}`}
          >
            {priority}
          </span>
        </div>
        {canDelete && (
          <div className="flex gap-2">
            {isAdmin && (
              <button
                type="button"
                onClick={handlePin}
                disabled={actionLoading}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1 text-xs font-medium text-slate-200 transition duration-200 hover:bg-white/10 disabled:opacity-50"
              >
                <Pin className="h-3 w-3" />
                {notice.pinned ? 'Unpin' : 'Pin'}
              </button>
            )}
            <button
              type="button"
              onClick={handleDelete}
              disabled={actionLoading}
              className="inline-flex items-center gap-1 rounded-lg border border-red-400/20 px-2.5 py-1 text-xs font-medium text-red-200 transition duration-200 hover:bg-red-500/10 disabled:opacity-50"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </button>
          </div>
        )}
      </div>

      <h3 className="text-lg font-semibold text-white">
        <button
          type="button"
          onClick={() => navigate(`/notice/${notice._id}`)}
          className="text-left hover:text-blue-300 transition-colors duration-200"
        >
          {notice.title}
        </button>
      </h3>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
        {notice.content}
      </p>

      {notice.imageUrl && (
        <div className="mt-4 relative overflow-hidden rounded-xl bg-[#1a1a2e]">
          <img
            src={notice.imageUrl}
            alt="Notice image"
            className="w-full max-h-[500px] cursor-pointer object-contain transition-transform hover:scale-[1.02]"
            onClick={() => setLightboxOpen(true)}
          />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <span>
          Posted by <span className="font-medium text-slate-200">{notice.author?.name || 'Anonymous'}</span>
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {timeDisplay}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleLike}
          disabled={likeLoading}
          className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition duration-200 disabled:opacity-50 ${
            likedByUser
              ? 'border-blue-400/30 bg-blue-500/15 text-blue-100'
              : 'border-white/10 text-slate-300 hover:-translate-y-0.5 hover:bg-white/10'
          }`}
        >
          <Heart className={`h-4 w-4 ${likedByUser ? 'fill-current' : ''}`} />
          {likedByUser ? 'Liked' : 'Like'} - {likes.length}
        </button>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-violet-200 transition duration-200 hover:bg-white/10 hover:text-white"
        >
          <MessageCircle className="h-4 w-4" />
          {expanded ? 'Hide' : (notice.commentCount > 0 ? notice.commentCount : 'Comment')}
        </button>
      </div>

      {expanded && <CommentSection noticeId={notice._id} />}

      {lightboxOpen && notice.imageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxOpen(false);
            }}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={notice.imageUrl}
            alt="Full size notice image"
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </article>
  );
}
