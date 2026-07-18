import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Pin, ArrowUp, Users, X, FileText, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Layout from '../components/Layout';
import NoticeCard from '../components/NoticeCard';
import NoticeForm from '../components/NoticeForm';
import { NoticeListSkeleton } from '../components/Skeletons';
import GuidelinesModal from '../components/GuidelinesModal';

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
  const [emergencyDismissed, setEmergencyDismissed] = useState(false);
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);

  const onlineUsers = getOnlineCount(activeCommunityId);

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
      setNotices(sortNotices(data));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load notices');
    } finally {
      setLoading(false);
    }
  }, [activeCommunityId]);

  useEffect(() => { fetchNotices(); }, [fetchNotices]);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Reset dismiss when new emergency notices appear
  useEffect(() => {
    const hasEmergency = notices.some((n) => n.category === 'Emergency');
    if (!hasEmergency) setEmergencyDismissed(false);
  }, [notices]);

  if (!activeCommunityId) {
    return (
      <Layout onSearchChange={setSearchQuery}>
        <div className="glass-card flex flex-col items-center justify-center rounded-2xl px-6 py-24 text-center border border-slate-200 bg-white/50 dark:border-white/10 dark:bg-white/5">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#E4EBE1] dark:bg-[#6E8F73]/20 shadow-inner">
            <Users className="h-10 w-10 text-[#6E8F73] dark:text-[#6E8F73]" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">No community selected</h2>
          <p className="mt-3 max-w-sm text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Join or create a community to see and post notices with your neighbours.
          </p>
          <button type="button" onClick={() => navigate('/community')}
            className="mt-8 rounded-xl bg-gradient-to-r from-[#6E8F73] to-[#C97B5A] px-8 py-3 text-sm font-bold text-white shadow-lg shadow-[#6E8F73]/25 transition-all hover:-translate-y-0.5 hover:shadow-[#6E8F73]/40">
            Go to Communities
          </button>
        </div>
      </Layout>
    );
  }

  const filtered = notices.filter((notice) =>
    searchQuery === '' ||
    notice.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notice.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasEmergencyNotices = notices.some((n) => n.category === 'Emergency');
  const pinnedNotices = notices.filter((n) => n.pinned);

  return (
    <Layout onSearchChange={setSearchQuery}>

      {/* ── Emergency banner (dismissible) ── */}
      {hasEmergencyNotices && !emergencyDismissed && (
        <div className="mb-6 rounded-2xl border-2 border-red-300 bg-gradient-to-r from-red-50 to-orange-50 p-4 shadow-sm dark:border-red-500/40 dark:from-red-500/10 dark:to-orange-500/10 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-500 shadow-md shadow-red-500/30">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-red-800 dark:text-red-200">Emergency Alert Active</p>
              <p className="text-xs text-red-600 dark:text-red-300 mt-0.5">There are emergency notices in your area. Check the Emergency tab for details.</p>
            </div>
            <button type="button" onClick={() => setEmergencyDismissed(true)}
              className="shrink-0 rounded-lg p-1.5 text-red-400 transition hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-500/20 dark:hover:text-red-300"
              aria-label="Dismiss">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Stats bar ── */}
      {!loading && (
        <div className="mb-6 flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200/60 bg-white/60 px-5 py-3 backdrop-blur-sm dark:border-white/5 dark:bg-white/3">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
            <FileText className="h-4 w-4 text-[#6E8F73]" />
            <span><span className="font-bold text-slate-900 dark:text-white">{notices.length}</span> Notice{notices.length !== 1 ? 's' : ''}</span>
          </div>
          {pinnedNotices.length > 0 && (
            <>
              <span className="h-4 w-px bg-slate-200 dark:bg-white/10" />
              <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                <Pin className="h-4 w-4 text-violet-500" />
                <span><span className="font-bold text-slate-900 dark:text-white">{pinnedNotices.length}</span> Pinned</span>
              </div>
            </>
          )}
          <span className="h-4 w-px bg-slate-200 dark:bg-white/10" />
          {/* Online count */}
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            <span><span className="font-bold text-slate-900 dark:text-white">{onlineUsers}</span> Online</span>
          </div>
          <span className="h-4 w-px bg-slate-200 dark:bg-white/10" />
          {/* Guidelines button */}
          <button
            type="button"
            onClick={() => setGuidelinesOpen(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-[#6E8F73] dark:text-slate-300 dark:hover:text-[#6E8F73]"
          >
            <BookOpen className="h-4 w-4 text-emerald-500" />
            <span>Guidelines</span>
          </button>
        </div>
      )}

      {/* ── Pinned notices carousel ── */}
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
                    <Pin className="h-3 w-3" />Pinned
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

      {/* ── Main grid ── */}
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div>
          {loading ? (
            <NoticeListSkeleton />
          ) : filtered.length === 0 ? (
            <div className="glass-card flex flex-col items-center justify-center border-dashed border-2 border-slate-200 bg-slate-50/50 py-20 text-center dark:border-white/10 dark:bg-white/3">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/5">
                <FileText className="h-8 w-8 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-lg font-semibold text-slate-600 dark:text-slate-300">
                {searchQuery ? 'No notices match your search.' : 'No notices yet.'}
              </p>
              <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
                {searchQuery ? 'Try different keywords.' : 'Be the first to post something here.'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filtered.map((notice, index) => (
                <div key={notice._id} className="animate-fade-in" style={{ animationDelay: `${index * 40}ms` }}>
                  <NoticeCard
                    notice={notice}
                    onUpdate={(updated) => setNotices((prev) => sortNotices(prev.map((n) => (n._id === updated._id ? updated : n))))}
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

      {/* Back to top */}
      {showBackToTop && (
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:bg-gradient-to-br dark:from-[#6E8F73] dark:to-[#C97B5A] dark:shadow-[#6E8F73]/30 dark:hover:shadow-[#6E8F73]/50 z-50"
          aria-label="Back to top">
          <ArrowUp className="h-6 w-6" />
        </button>
      )}

      {/* Guidelines modal */}
      {guidelinesOpen && (
        <GuidelinesModal
          communityId={activeCommunityId}
          onClose={() => setGuidelinesOpen(false)}
        />
      )}
    </Layout>
  );
}
