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
  General: 'bg-blue-500/15 text-blue-200 ring-blue-400/20',
  Event: 'bg-emerald-500/15 text-emerald-200 ring-emerald-400/20',
  'Lost & Found': 'bg-amber-500/15 text-amber-200 ring-amber-400/20',
  Emergency: 'bg-red-500/15 text-red-200 ring-red-400/20',
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
      } catch (err) {
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
        className="mb-4 inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <article className="glass-card overflow-hidden">
        <div className="border-b border-white/10 px-6 py-5 sm:px-8">
          <div className="mb-4 flex flex-wrap items-center gap-2">
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
            <span className="rounded-full bg-orange-500/15 px-2.5 py-1 text-xs font-medium text-orange-200 ring-1 ring-orange-400/25">
              {priority}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-white sm:text-3xl">{notice.title}</h1>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-400">
            <span>
              Posted by{' '}
              <span className="font-medium text-slate-200">
                {notice.author?.name || 'Anonymous'}
              </span>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatDate(notice.createdAt)}
            </span>
          </div>
        </div>

        <div className="px-6 py-6 sm:px-8">
          <p className="whitespace-pre-wrap text-base leading-relaxed text-slate-200">
            {notice.content}
          </p>

          <div className="mt-6 flex items-center gap-4">
            <button
              type="button"
              onClick={handleLike}
              disabled={likeLoading}
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition duration-200 disabled:opacity-50 ${
                likedByUser
                  ? 'border-blue-400/30 bg-blue-500/15 text-blue-100'
                  : 'border-white/10 text-slate-300 hover:-translate-y-0.5 hover:bg-white/10'
              }`}
            >
              <Heart className={`h-5 w-5 ${likedByUser ? 'fill-current' : ''}`} />
              {likedByUser ? 'Liked' : 'Like'} ({likes.length})
            </button>
            <span className="flex items-center gap-2 text-sm text-slate-400">
              <MessageCircle className="h-5 w-5" />
              Comments
            </span>
          </div>

          <div className="mt-8">
            <CommentSection noticeId={notice._id} />
          </div>
        </div>
      </article>
    </Layout>
  );
}
