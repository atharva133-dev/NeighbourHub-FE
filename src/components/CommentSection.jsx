import { useEffect, useState } from 'react';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { CommentSkeleton } from './Skeletons';

function formatDate(date) {
  return new Date(date).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function CommentSection({ noticeId }) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchComments = async () => {
      setFetching(true);
      try {
        const { data } = await api.get(`/notices/${noticeId}/comments`);
        if (mounted) setComments(data);
      } catch {
        toast.error('Failed to load comments');
      } finally {
        if (mounted) setFetching(false);
      }
    };

    fetchComments();
    return () => {
      mounted = false;
    };
  }, [noticeId]);

  useEffect(() => {
    if (!socket) return;

    const handleNewComment = ({ noticeId: id, comment }) => {
      if (id === noticeId) {
        setComments((prev) => {
          if (prev.some((c) => c._id === comment._id)) return prev;
          return [...prev, comment];
        });
      }
    };

    socket.on('comment:created', handleNewComment);
    return () => socket.off('comment:created', handleNewComment);
  }, [socket, noticeId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post(`/notices/${noticeId}/comments`, { content });
      setComments((prev) => {
        if (prev.some((c) => c._id === data._id)) return prev;
        return [...prev, data];
      });
      setContent('');
      toast.success('Comment added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 border-t border-white/10 pt-4">
      <h4 className="mb-3 text-sm font-semibold text-slate-200">
        Comments ({comments.length})
      </h4>
      <div className="mb-4 max-h-48 space-y-3 overflow-y-auto">
        {fetching ? (
          <CommentSkeleton />
        ) : comments.length === 0 ? (
          <p className="text-sm text-slate-400">No comments yet. Start the conversation!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-[10px] font-bold text-white shadow-sm">
                    {comment.author?.avatarUrl ? (
                      <img src={comment.author.avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      comment.author?.name?.charAt(0).toUpperCase() || 'A'
                    )}
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{comment.author?.name}</span>
                </div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{formatDate(comment.createdAt)}</span>
              </div>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 ml-8">{comment.content}</p>
            </div>
          ))
        )}
      </div>
      {user && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a comment..."
            className="glass-input min-w-0 flex-1"
          />
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition duration-200 hover:-translate-y-0.5 hover:bg-blue-400 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            Send
          </button>
        </form>
      )}
    </div>
  );
}
