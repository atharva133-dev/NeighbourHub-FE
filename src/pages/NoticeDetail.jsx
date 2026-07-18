import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Heart, MessageCircle, Pin } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Layout from '../components/Layout';
import CommentSection from '../components/CommentSection';
import { PageLoader } from '../components/Skeletons';
import { useAuth } from '../context/AuthContext';

const CATEGORY_STYLES = {
  General:        'bg-[#f1f5f9] text-[#475569] border border-[#e2e8f0]',
  Event:          'bg-[#ecfdf5] text-[#047857] border border-[#d1fae5]',
  'Lost & Found': 'bg-[#fffbeb] text-[#b45309] border border-[#fef3c7]',
  Emergency:      'bg-[#fef2f2] text-[#b91c1c] border border-[#fee2e2]',
};

const PRIORITY_STYLES = {
  Low:    'bg-[#f1f5f9] text-[#475569] border border-[#e2e8f0]',
  Medium: 'bg-[#fffbeb] text-[#b45309] border border-[#fef3c7]',
  High:   'bg-[#ffedd5] text-[#c2410c] border border-[#ffedd5]',
  Urgent: 'bg-[#fef2f2] text-[#b91c1c] border border-[#fee2e2] font-bold',
};

function formatDate(date) {
  return new Date(date).toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

export default function NoticeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);

  useEffect(() => {
    const fetchNotice = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/notices/${id}`);
        setNotice(data);
      } catch {
        toast.error('Notice not found');
        navigate('/', { replace: true });
      } finally {
        setLoading(false);
      }
    };
    fetchNotice();
  }, [id, navigate]);

  const handleLike = async () => {
    if (!user || !notice) return;
    setLikeLoading(true);
    try {
      const { data } = await api.patch(`/notices/${notice._id}/like`);
      setNotice(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update like');
    } finally {
      setLikeLoading(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!notice) return null;

  const likes = notice.likes || [];
  const likedByUser = user
    ? likes.some((like) => (typeof like === 'string' ? like : like._id) === user.id)
    : false;
  const priority = notice.priority || (notice.category === 'Emergency' ? 'Urgent' : 'Medium');

  return (
    <Layout>
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-5 inline-flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-4 py-2 text-sm font-semibold text-[#475569] shadow-xs transition hover:bg-[#f8fafc] hover:text-[#0f172a]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <article className="overflow-hidden rounded-[20px] border border-[#e2e8f0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        {/* Header */}
        <div className="border-b border-[#f1f5f9] px-6 py-6 sm:px-8">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {notice.pinned && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#4f46e5]/10 px-2.5 py-1 text-xs font-semibold text-[#4f46e5] border border-[#4f46e5]/20">
                <Pin className="h-3 w-3" /> Pinned
              </span>
            )}
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold border ${CATEGORY_STYLES[notice.category] || CATEGORY_STYLES.General}`}>
              {notice.category}
            </span>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold border ${PRIORITY_STYLES[priority] || PRIORITY_STYLES.Medium}`}>
              {priority}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-[#0f172a] sm:text-3xl" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
            {notice.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-[#64748b]">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg bg-[#0f172a] text-xs font-bold text-white">
                {notice.author?.avatarUrl
                  ? <img src={notice.author.avatarUrl} alt="" className="h-full w-full object-cover" />
                  : notice.author?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <span>Posted by <span className="font-semibold text-[#334155]">{notice.author?.name || 'Anonymous'}</span></span>
            </div>
            <span className="flex items-center gap-1.5 bg-[#f1f5f9] px-2.5 py-1 rounded-md text-xs font-medium">
              <Clock className="h-3.5 w-3.5" />
              {formatDate(notice.createdAt)}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 sm:px-8">
          <p className="whitespace-pre-wrap text-base leading-relaxed text-[#334155]">
            {notice.content}
          </p>

          {notice.imageUrl && (
            <div className="mt-6 overflow-hidden rounded-xl border border-[#e2e8f0] bg-[#f8fafc]">
              <img src={notice.imageUrl} alt="Notice media" className="w-full max-h-[500px] object-contain" />
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
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
              <Heart className={`h-5 w-5 ${likedByUser ? 'fill-current' : ''}`} />
              {likedByUser ? 'Liked' : 'Like'} ({likes.length})
            </button>
            <span className="flex items-center gap-2 text-sm font-semibold text-[#475569]">
              <MessageCircle className="h-5 w-5" />
              Comments
            </span>
          </div>

          <div className="mt-8 border-t border-[#f1f5f9] pt-6">
            <CommentSection noticeId={notice._id} />
          </div>
        </div>
      </article>
    </Layout>
  );
}
