import { useCallback, useEffect, useState } from 'react';
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

export default function LostFound() {
  const { activeCommunityId } = useAuth();
  const { socket, joinCommunity, leaveCommunity } = useSocket();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Join / leave the community socket room
  useEffect(() => {
    if (!socket || !activeCommunityId) return;
    joinCommunity(activeCommunityId);
    return () => leaveCommunity(activeCommunityId);
  }, [socket, activeCommunityId, joinCommunity, leaveCommunity]);

  const fetchNotices = useCallback(async () => {
    if (!activeCommunityId) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data } = await api.get(`/notices?communityId=${activeCommunityId}`);
      const lostFoundNotices = data.filter((n) => n.category === 'Lost & Found');
      setNotices(sortNotices(lostFoundNotices));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load lost & found items');
    } finally {
      setLoading(false);
    }
  }, [activeCommunityId]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  useEffect(() => {
    if (!socket) return;

    const handleCreated = (notice) => {
      if (notice.category !== 'Lost & Found') return;
      setNotices((prev) => {
        if (prev.some((n) => n._id === notice._id)) return prev;
        return sortNotices([notice, ...prev]);
      });
    };

    const handleUpdated = (notice) => {
      if (notice.category !== 'Lost & Found') return;
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
    const matchesSearch =
      searchQuery === '' ||
      notice.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.content?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <Layout onSearchChange={setSearchQuery}>
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div>
          {loading ? (
            <NoticeListSkeleton />
          ) : filtered.length === 0 ? (
            <div className="glass-card border-dashed border-2 border-slate-200 bg-slate-50 py-20 text-center dark:border-white/10 dark:bg-white/5">
              <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">No lost & found items yet.</p>
              <p className="text-slate-400 dark:text-slate-500 mt-1">Hope everyone finds what they are looking for!</p>
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
          <NoticeForm defaultCategory="Lost & Found" />
        </aside>
      </div>
    </Layout>
  );
}
