import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Pin, ArrowUp } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
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
  const { socket } = useSocket();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notices');
      setNotices(sortNotices(data));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load notices');
    } finally {
      setLoading(false);
    }
  }, []);

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

  const filtered = notices.filter((notice) => {
    const matchesSearch = searchQuery === '' || 
      notice.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.content?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const hasEmergencyNotices = notices.some(n => n.category === 'Emergency');
  const pinnedNotices = notices.filter(n => n.pinned);
  const regularNotices = notices.filter(n => !n.pinned);

  return (
    <Layout onSearchChange={setSearchQuery}>
      {hasEmergencyNotices && (
        <div className="mb-6 rounded-2xl border-2 border-red-500/50 bg-red-500/10 p-4 animate-pulse backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-red-200">Emergency Alert Active</p>
              <p className="text-xs text-red-300">There are emergency notices in your area. Check the Emergency tab for details.</p>
            </div>
          </div>
        </div>
      )}

      {pinnedNotices.length > 0 && (
        <div className="mb-6">
          <div className="mb-4 flex items-center gap-2">
            <Pin className="h-5 w-5 text-violet-400" />
            <h3 className="text-lg font-semibold text-white">Pinned Notices</h3>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {pinnedNotices.map((notice) => (
              <div key={notice._id} className="flex-shrink-0 w-80 glass-card p-4 transition-all duration-300 hover:-translate-y-1 hover:border-violet-400/30">
                <div className="mb-2 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/15 px-2 py-0.5 text-xs font-semibold text-violet-200">
                    <Pin className="h-3 w-3" />
                    Pinned
                  </span>
                  <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-xs font-medium text-blue-200">
                    {notice.category}
                  </span>
                </div>
                <h4 className="mb-2 text-base font-semibold text-white line-clamp-2">{notice.title}</h4>
                <p className="mb-3 text-sm text-slate-300 line-clamp-2">{notice.content}</p>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{notice.author?.name}</span>
                  <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          {loading ? (
            <NoticeListSkeleton />
          ) : filtered.length === 0 ? (
            <div className="glass-card border-dashed py-16 text-center">
              <p className="text-slate-300">No notices yet. Be the first to post.</p>
            </div>
          ) : (
            <div className="space-y-4">
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
          <NoticeForm />
        </aside>
      </div>

      {showBackToTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-purple-500/50"
          aria-label="Back to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </Layout>
  );
}
