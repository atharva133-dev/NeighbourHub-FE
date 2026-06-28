import { useCallback, useEffect, useState } from 'react';
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

export default function Emergency() {
  const { socket } = useSocket();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notices');
      const emergencyNotices = data.filter(n => n.category === 'Emergency');
      setNotices(sortNotices(emergencyNotices));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load emergency alerts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  useEffect(() => {
    if (!socket) return;

    const handleCreated = (notice) => {
      if (notice.category !== 'Emergency') return;
      setNotices((prev) => {
        if (prev.some((n) => n._id === notice._id)) return prev;
        return sortNotices([notice, ...prev]);
      });
    };

    const handleUpdated = (notice) => {
      if (notice.category !== 'Emergency') return;
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
      notice.content?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <Layout onSearchChange={setSearchQuery}>
      <div className="mb-6 glass-card border-red-500/30 p-5 animate-pulse relative z-0">
        <p className="text-xs font-semibold uppercase text-red-300">Emergency Alerts</p>
        <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Emergency Notices</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
          Critical alerts and emergency information for your neighbourhood. Stay informed during urgent situations.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          {loading ? (
            <NoticeListSkeleton />
          ) : filtered.length === 0 ? (
            <div className="glass-card border-dashed py-16 text-center">
              <p className="text-slate-300">No emergency alerts at this time.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((notice) => (
                <NoticeCard
                  key={notice._id}
                  notice={notice}
                  onUpdate={(updated) =>
                    setNotices((prev) => sortNotices(prev.map((n) => (n._id === updated._id ? updated : n))))
                  }
                  onDelete={(id) => setNotices((prev) => prev.filter((n) => n._id !== id))}
                />
              ))}
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <NoticeForm defaultCategory="Emergency" />
        </aside>
      </div>
    </Layout>
  );
}
