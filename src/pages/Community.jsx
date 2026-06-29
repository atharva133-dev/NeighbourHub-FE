import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, LogIn, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import CommunityCard from '../components/community/CommunityCard';
import CreateCommunityModal from '../components/community/CreateCommunityModal';
import JoinCommunityModal from '../components/community/JoinCommunityModal';
import { PageLoader } from '../components/Skeletons';

export default function Community() {
  const { user, setUser, enterCommunity: setActiveCommunity } = useAuth();
  const navigate = useNavigate();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  const fetchCommunities = useCallback(async () => {
    try {
      const { data } = await api.get('/community/my');
      setCommunities(data);
    } catch {
      toast.error('Failed to load communities');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  const enterCommunity = async (community) => {
    try {
      const { data } = await api.patch('/users/settings', { communityId: community.id });
      setUser(data);
      setActiveCommunity(community.id);
      toast.success(`Entered ${community.name}`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to enter community');
    }
  };

  const handleCreated = (community, goDirect = false) => {
    fetchCommunities();
    if (goDirect) {
      enterCommunity(community);
    }
  };

  const handleJoined = (community) => {
    fetchCommunities();
    enterCommunity(community);
  };

  if (loading) return <PageLoader />;

  return (
    <div className="animated-auth-bg min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Your Communities</h1>
            <p className="mt-1 text-slate-400">
              Welcome back, {user?.name?.split(' ')[0]} — pick a community to enter
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowJoin(true)}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <LogIn className="h-4 w-4" />
              Join Community
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4" />
              Create Community
            </button>
          </div>
        </div>

        {communities.length === 0 ? (
          <div className="glass-card flex flex-col items-center justify-center rounded-2xl px-6 py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/20">
              <Users className="h-8 w-8 text-purple-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">No communities yet</h2>
            <p className="mt-2 max-w-sm text-sm text-slate-400">
              Create your own community or join one with a 6-digit code
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowJoin(true)}
                className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Join Community
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white"
              >
                Create Community
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {communities.map((community) => (
              <CommunityCard
                key={community.id}
                community={community}
                onEnter={enterCommunity}
              />
            ))}
          </div>
        )}
      </div>

      <CreateCommunityModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={handleCreated}
      />
      <JoinCommunityModal
        open={showJoin}
        onClose={() => setShowJoin(false)}
        onJoined={handleJoined}
      />
    </div>
  );
}
