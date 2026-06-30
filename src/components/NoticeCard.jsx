import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Pin, Trash2, Clock, ExternalLink, X, Languages, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import CommentSection from './CommentSection';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'mr', label: 'Marathi' },
  { code: 'gu', label: 'Gujarati' },
  { code: 'ta', label: 'Tamil' },
  { code: 'te', label: 'Telugu' },
];

const CATEGORY_STYLES = {
  General: 'bg-blue-100 text-blue-700 ring-blue-200 dark:bg-blue-500/15 dark:text-blue-200 dark:ring-blue-400/20',
  Event: 'bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-400/20',
  'Lost & Found': 'bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-400/20',
  Emergency: 'bg-red-100 text-red-700 ring-red-200 dark:bg-red-500/15 dark:text-red-200 dark:ring-red-400/20',
};

const PRIORITY_STYLES = {
  Low: 'bg-green-100 text-green-700 ring-green-200 dark:bg-green-500/15 dark:text-green-200 dark:ring-green-400/25',
  Medium: 'bg-yellow-100 text-yellow-700 ring-yellow-200 dark:bg-yellow-500/15 dark:text-yellow-100 dark:ring-yellow-400/25',
  High: 'bg-orange-100 text-orange-700 ring-orange-200 dark:bg-orange-500/15 dark:text-orange-200 dark:ring-orange-400/25',
  Urgent: 'bg-red-100 text-red-700 ring-red-200 dark:bg-red-500/15 dark:text-red-200 dark:ring-red-400/25',
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

  // Translation state
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [translateLoading, setTranslateLoading] = useState(false);
  const [translatedContent, setTranslatedContent] = useState(null); // { lang, text }
  const [showOriginal, setShowOriginal] = useState(false);
  // Cache: { [langCode]: translatedText }
  const [translationCache, setTranslationCache] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeDisplay(timeAgo(notice.createdAt));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [notice.createdAt]);

  // Close language dropdown on outside click
  useEffect(() => {
    if (!showLangMenu) return;
    const handler = (e) => {
      if (!e.target.closest('[data-translate-menu]')) setShowLangMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showLangMenu]);

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

  const handleTranslate = async (langCode) => {
    setShowLangMenu(false);

    // English = restore original
    if (langCode === 'en') {
      setTranslatedContent(null);
      setShowOriginal(false);
      return;
    }

    // If same lang already translated, just show it
    if (translationCache[langCode]) {
      setTranslatedContent({ lang: langCode, text: translationCache[langCode] });
      setShowOriginal(false);
      return;
    }

    setTranslateLoading(true);
    try {
      const { data } = await api.post('/translate', {
        text: notice.content,
        targetLang: langCode,
      });
      setTranslationCache((prev) => ({ ...prev, [langCode]: data.translatedText }));
      setTranslatedContent({ lang: langCode, text: data.translatedText });
      setShowOriginal(false);
    } catch {
      toast.error('Translation failed');
    } finally {
      setTranslateLoading(false);
    }
  };

  return (
    <article className="glass-card p-5 lg:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:hover:border-purple-500/30 hover:border-purple-300 relative z-0">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {isNew && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-200 dark:bg-green-500/15 dark:text-green-200 dark:ring-green-400/20 animate-pulse">
              <span className="h-2 w-2 rounded-full bg-green-500 dark:bg-green-400" />
              Just posted
            </span>
          )}
          {notice.pinned && (
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700 ring-1 ring-violet-200 dark:bg-violet-500/15 dark:text-violet-200 dark:ring-violet-400/20 shadow-sm">
              <Pin className="h-3 w-3" />
              Pinned
            </span>
          )}
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 shadow-sm ${CATEGORY_STYLES[notice.category] || CATEGORY_STYLES.General}`}
          >
            {notice.category}
          </span>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 shadow-sm ${PRIORITY_STYLES[priority] || PRIORITY_STYLES.Medium}`}
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
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 dark:border-white/10 dark:bg-transparent dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white dark:shadow-none"
              >
                <Pin className="h-3.5 w-3.5" />
                {notice.pinned ? 'Unpin' : 'Pin'}
              </button>
            )}
            <button
              type="button"
              onClick={handleDelete}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 shadow-sm transition-all duration-200 hover:bg-red-100 hover:text-red-700 disabled:opacity-50 dark:border-red-400/20 dark:bg-transparent dark:text-red-300 dark:hover:bg-red-500/10 dark:shadow-none"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        )}
      </div>

      <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
        <button
          type="button"
          onClick={() => navigate(`/notice/${notice._id}`)}
          className="text-left hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
        >
          {notice.title}
        </button>
      </h3>

      {/* Content — shows translated text or original */}
      <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
        {translatedContent && !showOriginal ? translatedContent.text : notice.content}
      </p>
      {translatedContent && (
        <button
          type="button"
          onClick={() => setShowOriginal((v) => !v)}
          className="mt-1.5 text-xs font-semibold text-purple-500 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
        >
          {showOriginal ? 'Show Translation' : 'Show Original'}
        </button>
      )}

      {notice.imageUrl && (
        <div className="mt-5 relative overflow-hidden rounded-xl bg-slate-100 dark:bg-[#13131f] border border-slate-200 dark:border-white/5">
          <img
            src={notice.imageUrl}
            alt="Notice image"
            className="w-full max-h-[450px] cursor-pointer object-contain transition-transform duration-500 hover:scale-[1.02]"
            onClick={() => setLightboxOpen(true)}
          />
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm overflow-hidden">
            {notice.author?.avatarUrl ? (
              <img src={notice.author.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              notice.author?.name?.charAt(0).toUpperCase() || 'A'
            )}
          </div>
          <span className="font-semibold text-slate-700 dark:text-slate-200">{notice.author?.name || 'Anonymous'}</span>
        </div>
        <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-md text-xs font-medium">
          <Clock className="h-3.5 w-3.5" />
          {timeDisplay}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 pt-5 border-t border-slate-100 dark:border-white/5">
        <button
          type="button"
          onClick={handleLike}
          disabled={likeLoading}
          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-300 disabled:opacity-50 shadow-sm ${
            likedByUser
              ? 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-400/30 dark:bg-purple-500/15 dark:text-purple-200'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-white/10 dark:bg-transparent dark:text-slate-300 dark:hover:-translate-y-0.5 dark:hover:bg-white/10 dark:hover:text-white dark:shadow-none'
          }`}
        >
          <Heart className={`h-4 w-4 transition-transform ${likedByUser ? 'fill-current scale-110' : 'group-hover:scale-110'}`} />
          {likedByUser ? 'Liked' : 'Like'} <span className="opacity-60 font-normal">({likes.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-300 shadow-sm ${
            expanded
              ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/30 dark:bg-blue-500/15 dark:text-blue-200'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-white/10 dark:bg-transparent dark:text-slate-300 dark:hover:-translate-y-0.5 dark:hover:bg-white/10 dark:hover:text-white dark:shadow-none'
          }`}
        >
          <MessageCircle className="h-4 w-4" />
          {expanded ? 'Hide Comments' : (notice.commentCount > 0 ? `${notice.commentCount} Comments` : 'Comment')}
        </button>

        {/* Translate button + dropdown */}
        <div className="relative ml-auto" data-translate-menu>
          <button
            type="button"
            onClick={() => setShowLangMenu((v) => !v)}
            disabled={translateLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition-all duration-300 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-60 dark:border-white/10 dark:bg-transparent dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white dark:shadow-none"
          >
            {translateLoading
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Languages className="h-4 w-4" />
            }
            Translate
          </button>

          {showLangMenu && (
            <div className="absolute right-0 bottom-full mb-2 z-20 w-40 rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl dark:border-white/10 dark:bg-[#1a1a2e]">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleTranslate(lang.code)}
                  className={`flex w-full items-center justify-between px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-50 dark:hover:bg-white/5 ${
                    (lang.code === 'en' && !translatedContent)
                      || (translatedContent?.lang === lang.code && !showOriginal)
                      ? 'text-purple-600 dark:text-purple-400 font-bold'
                      : 'text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {lang.label}
                  {translationCache[lang.code] && (
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-4 animate-fade-in">
          <CommentSection noticeId={notice._id} />
        </div>
      )}

      {lightboxOpen && notice.imageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 dark:bg-black/90 p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxOpen(false);
            }}
            className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30 backdrop-blur-md"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={notice.imageUrl}
            alt="Full size notice image"
            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </article>
  );
}
