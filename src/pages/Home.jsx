import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Pin, ArrowUp, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Layout from '../components/Layout';
import NoticeCard from '../components/NoticeCard';
import NoticeForm from '../components/NoticeForm';
import { NoticeListSkeleton } from '../components/Skeletons';

function sortNotices(list) {
  return [...list].sort((a, b) => {
    if (a.pinned !== b.pinned) return b.pinned - a.pinned;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
}

export default function Home() {
  const { activeCommunityId } = useAuth();
  const { socket, joinCommunity, leaveCommunity, getOnlineCount } = useSocket();
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Join / leave the community socket room
  useEffect(() => {
    if (!socket || !activeCommunityId) return;
    joinCommunity(activeCommunityId);
    return () => leaveCommunity(activeCommunityId);
  }, [socket, activeCommunityId, joinCommunity, leaveCommunity]);

  const fetchNotices = useCallback(async () => {
    if (!activeCommunityId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get(`/notices?communityId=${activeCommunityId}`);
      setNotices(sortNotices(data));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load notices');
    } finally {
      setLoading(false);
    }
  }, [activeCommunityId]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (!socket) return;

    const handleCreated = (notice) => {
      setNotices((prev) => {
        if (prev.some((n) => n._id === notice._id)) return prev;
        return sortNotices([notice, ...prev]);
      });
    };

    const handleUpdated = (notice) => {
      setNotices((prev) => sortNotices(prev.map((n) => (n._id === notice._id ? notice : n))));
    };

    const handleDeleted = ({ id }) => {
      setNotices((prev) => prev.filter((n) => n._id !== id));
    };

    socket.on('notice:created', handleCreated);
    socket.on('notice:updated', handleUpdated);
    socket.on('notice:deleted', handleDeleted);

    return () => {
      socket.off('notice:created', handleCreated);
      socket.off('notice:updated', handleUpdated);
      socket.off('notice:deleted', handleDeleted);
    };
  }, [socket]);

  // No community selected – prompt
  if (!activeCommunityId) {
    return (
      <Layout onSearchChange={setSearchQuery}>
        <div className="glass-card flex flex-col items-center justify-center rounded-2xl px-6 py-24 text-center border border-slate-200 bg-white/50 dark:border-white/10 dark:bg-white/5">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-purple-100 dark:bg-purple-500/20 shadow-inner">
            <Users className="h-10 w-10 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">No community selected</h2>
          <p className="mt-3 max-w-sm text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Join or create a community to see and post notices with your neighbours.
          </p>
          <button
            type="button"
            onClick={() => navigate('/community')}
            className="mt-8 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/25 transition-all hover:-translate-y-0.5 hover:shadow-purple-500/40"
          >
            Go to Communities
          </button>
        </div>
      </Layout>
    );
  }

  const filtered = notices.filter((notice) => {
    const matchesSearch =
      searchQuery === '' ||
      notice.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.content?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const hasEmergencyNotices = notices.some((n) => n.category === 'Emergency');
  const pinnedNotices = notices.filter((n) => n.pinned);

  return (
    <Layout onSearchChange={setSearchQuery}>
      {hasEmergencyNotices && (
        <div className="mb-8 rounded-2xl border-2 border-red-300 bg-red-50 p-5 shadow-sm animate-pulse dark:border-red-500/50 dark:bg-red-500/10">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500 shadow-inner">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-base font-bold text-red-800 dark:text-red-200">Emergency Alert Active</p>
              <p className="text-sm text-red-600 dark:text-red-300 mt-0.5">There are emergency notices in your area. Check the Emergency tab for details.</p>
            </div>
          </div>
        </div>
      )}

      {pinnedNotices.length > 0 && (
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <Pin className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pinned Notices</h3>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {pinnedNotices.map((notice) => (
              <div key={notice._id} className="flex-shrink-0 w-80 glass-card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-violet-300 dark:hover:border-violet-400/30">
                <div className="mb-3 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-500/15 dark:text-violet-200">
                    <Pin className="h-3 w-3" />
                    Pinned
                  </span>
                  <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/15 dark:text-blue-200">
                    {notice.category}
                  </span>
                </div>
                <h4 className="mb-2 text-base font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">{notice.title}</h4>
                <p className="mb-4 text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">{notice.content}</p>
                <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                  <span className="text-slate-700 dark:text-slate-300">{notice.author?.name}</span>
                  <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div>
          {loading ? (
            <NoticeListSkeleton />
          ) : filtered.length === 0 ? (
            <div className="glass-card border-dashed border-2 border-slate-200 bg-slate-50 py-20 text-center dark:border-white/10 dark:bg-white/5">
              <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">No notices yet.</p>
              <p className="text-slate-400 dark:text-slate-500 mt-1">Be the first to post something here.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filtered.map((notice, index) => (
                <div
                  key={notice._id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <NoticeCard
                    notice={notice}
                    onUpdate={(updated) =>
                      setNotices((prev) => sortNotices(prev.map((n) => (n._id === updated._id ? updated : n))))
                    }
                    onDelete={(id) => setNotices((prev) => prev.filter((n) => n._id !== id))}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <NoticeForm
            onCreated={(newNotice) =>
              setNotices((prev) => {
                if (prev.some((n) => n._id === newNotice._id)) return prev;
                return sortNotices([newNotice, ...prev]);
              })
            }
          />
        </aside>
      </div>

      {showBackToTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:bg-gradient-to-br dark:from-purple-600 dark:to-blue-600 dark:shadow-purple-500/30 dark:hover:shadow-purple-500/50 z-50"
          aria-label="Back to top"
        >
          <ArrowUp className="h-6 w-6" />
        </button>
      )}
    </Layout>
  );
}
