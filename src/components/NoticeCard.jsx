import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Pin, Trash2, Clock, X, Languages, Loader2 } from 'lucide-react';
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
  General: 'bg-[#f1f5f9] text-[#475569] border border-[#e2e8f0]',
  Event: 'bg-[#ecfdf5] text-[#047857] border border-[#d1fae5]',
  'Lost & Found': 'bg-[#fffbeb] text-[#b45309] border border-[#fef3c7]',
  Emergency: 'bg-[#fef2f2] text-[#b91c1c] border border-[#fee2e2]',
};

const PRIORITY_STYLES = {
  Low: 'bg-[#f1f5f9] text-[#475569] border border-[#e2e8f0]',
  Medium: 'bg-[#fffbeb] text-[#b45309] border border-[#fef3c7]',
  High: 'bg-[#ffedd5] text-[#c2410c] border border-[#ffedd5]',
  Urgent: 'bg-[#fef2f2] text-[#b91c1c] border border-[#fee2e2] font-bold',
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
    <article className="relative overflow-hidden rounded-[20px] border border-[#e2e8f0] bg-white p-5 lg:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-[#cbd5e1] z-0">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {isNew && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ecfdf5] px-2.5 py-1 text-xs font-semibold text-[#047857] border border-[#d1fae5] animate-pulse">
              <span className="h-2 w-2 rounded-full bg-[#10b981]" />
              Just posted
            </span>
          )}
          {notice.pinned && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#4f46e5]/10 px-2.5 py-1 text-xs font-semibold text-[#4f46e5] border border-[#4f46e5]/20 shadow-xs">
              <Pin className="h-3 w-3" />
              Pinned
            </span>
          )}
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold border ${CATEGORY_STYLES[notice.category] || CATEGORY_STYLES.General}`}
          >
            {notice.category}
          </span>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold border ${PRIORITY_STYLES[priority] || PRIORITY_STYLES.Medium}`}
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
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white px-2.5 py-1 text-xs font-semibold text-[#475569] shadow-xs transition-all duration-150 hover:bg-[#f8fafc] hover:text-[#0f172a] disabled:opacity-50"
              >
                <Pin className="h-3.5 w-3.5" />
                {notice.pinned ? 'Unpin' : 'Pin'}
              </button>
            )}
            <button
              type="button"
              onClick={handleDelete}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#fca5a5] bg-[#fef2f2] px-2.5 py-1 text-xs font-semibold text-[#b91c1c] shadow-xs transition-all duration-150 hover:bg-[#fee2e2] disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        )}
      </div>

      <h3 className="text-xl font-bold text-[#0f172a] tracking-tight">
        <button
          type="button"
          onClick={() => navigate(`/notice/${notice._id}`)}
          className="text-left hover:text-[#4f46e5] transition-colors duration-200"
          style={{ fontFamily: '"Space Grotesk", sans-serif' }}
        >
          {notice.title}
        </button>
      </h3>

      {/* Content — shows translated text or original */}
      <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-[#475569]">
        {translatedContent && !showOriginal ? translatedContent.text : notice.content}
      </p>
      {translatedContent && (
        <button
          type="button"
          onClick={() => setShowOriginal((v) => !v)}
          className="mt-1.5 text-xs font-semibold text-[#4f46e5] hover:text-[#3730a3] transition-colors"
        >
          {showOriginal ? 'Show Translation' : 'Show Original'}
        </button>
      )}

      {notice.imageUrl && (
        <div className="mt-5 relative overflow-hidden rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
          <img
            src={notice.imageUrl}
            alt="Notice media"
            className="w-full max-h-[450px] cursor-pointer object-contain transition-transform duration-500 hover:scale-[1.01]"
            onClick={() => setLightboxOpen(true)}
          />
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-[#64748b]">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-[#0f172a] flex items-center justify-center text-[10px] font-bold text-white shadow-xs overflow-hidden">
            {notice.author?.avatarUrl ? (
              <img src={notice.author.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              notice.author?.name?.charAt(0).toUpperCase() || 'A'
            )}
          </div>
          <span className="font-semibold text-[#334155]">{notice.author?.name || 'Anonymous'}</span>
        </div>
        <span className="flex items-center gap-1.5 bg-[#f1f5f9] px-2.5 py-1 rounded-md text-xs font-medium text-[#475569]">
          <Clock className="h-3.5 w-3.5" />
          {timeDisplay}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 pt-5 border-t border-[#f1f5f9]">
        <button
          type="button"
          onClick={handleLike}
          disabled={likeLoading}
          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-150 disabled:opacity-50 shadow-xs ${
            likedByUser
              ? 'border-[#fca5a5] bg-[#fef2f2] text-[#b91c1c]'
              : 'border-[#e2e8f0] bg-white text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a]'
          }`}
        >
          <Heart className={`h-4 w-4 transition-transform ${likedByUser ? 'fill-current scale-110' : 'group-hover:scale-110'}`} />
          {likedByUser ? 'Liked' : 'Like'} <span className="opacity-60 font-normal">({likes.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-150 shadow-xs ${
            expanded
              ? 'border-[#cbd5e1] bg-[#f1f5f9] text-[#0f172a]'
              : 'border-[#e2e8f0] bg-white text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a]'
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
            className="inline-flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-4 py-2 text-sm font-semibold text-[#475569] shadow-xs transition-all duration-150 hover:bg-[#f8fafc] hover:text-[#0f172a] disabled:opacity-60"
          >
            {translateLoading
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Languages className="h-4 w-4" />
            }
            Translate
          </button>

          {showLangMenu && (
            <div className="absolute right-0 bottom-full mb-2 z-20 w-40 rounded-xl border border-[#e2e8f0] bg-white py-1.5 shadow-xl">
              <button
                key="en"
                type="button"
                onClick={() => handleTranslate('en')}
                className={`flex w-full items-center justify-between px-4 py-2 text-sm font-medium transition-colors hover:bg-[#f8fafc] ${
                  !translatedContent ? 'text-[#4f46e5] font-bold' : 'text-[#475569]'
                }`}
              >
                English
                {!translatedContent && <span className="h-1.5 w-1.5 rounded-full bg-[#4f46e5]" />}
              </button>
              <div className="h-px bg-[#f1f5f9] mx-3" />
              {LANGUAGES.filter(l => l.code !== 'en').map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleTranslate(lang.code)}
                  className={`flex w-full items-center justify-between px-4 py-2 text-sm font-medium transition-colors hover:bg-[#f8fafc] ${
                    translatedContent?.lang === lang.code && !showOriginal
                      ? 'text-[#4f46e5] font-bold'
                      : 'text-[#475569]'
                  }`}
                >
                  {lang.label}
                  {translationCache[lang.code] && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#4f46e5]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-4 animate-fade-in border-t border-[#f1f5f9] pt-4">
          <CommentSection noticeId={notice._id} />
        </div>
      )}

      {lightboxOpen && notice.imageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-xs animate-fade-in"
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
            alt="Full size notice"
            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </article>
  );
}
