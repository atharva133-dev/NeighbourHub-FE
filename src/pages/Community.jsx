import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, LogIn, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import CommunityCard from '../components/community/CommunityCard';
import CreateCommunityModal from '../components/community/CreateCommunityModal';
import JoinCommunityModal from '../components/community/JoinCommunityModal';
import { PageLoader } from '../components/Skeletons';
import { motion } from 'framer-motion';

export default function Community() {
  const { user, setUser, enterCommunity: setActiveCommunity, logout } = useAuth();
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

  useEffect(() => { fetchCommunities(); }, [fetchCommunities]);

  const leaveCommunity = async (community) => {
    if (!window.confirm(`Leave "${community.name}"? You can rejoin anytime with the code.`)) return;
    try {
      await api.post(`/community/${community.id}/leave`);
      toast.success(`Left ${community.name}`);
      fetchCommunities();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to leave community');
    }
  };

  const enterCommunity = async (community) => {
    try {
      const { data } = await api.patch('/users/settings', { communityId: community.id });
      setUser(data);
      setActiveCommunity(community.id);
      toast.success(`Entered ${community.name}`);
      navigate('/board');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to enter community');
    }
  };

  const handleCreated = (community, goDirect = false) => {
    fetchCommunities();
    if (goDirect) enterCommunity(community);
  };

  const handleJoined = (community) => {
    fetchCommunities();
    enterCommunity(community);
  };

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen font-sans text-[#20261f] antialiased" style={{ 
      background: '#f6f5ef',
      backgroundImage: 'linear-gradient(rgba(22,28,20,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(22,28,20,0.035) 1px, transparent 1px)',
      backgroundSize: '44px 44px'
    }}>
      <div className="mx-auto max-w-[1280px] px-[40px] pb-[100px] pt-[56px] max-sm:px-5 max-sm:pb-[70px] max-sm:pt-10">
        <header className="mb-[52px] flex flex-wrap items-start justify-between gap-6 max-sm:flex-col">
          <div>
            <div className="mb-[18px] inline-flex items-center gap-2 rounded-full border border-[#6e8f73]/25 bg-[#6e8f73]/10 px-[14px] py-[7px] font-mono text-[11.5px] uppercase tracking-widest text-[#6e8f73]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#6e8f73] opacity-75"></span>
                <span className="relative inline-flex h-[6px] w-[6px] rounded-full bg-[#6e8f73]" style={{ boxShadow: '0 0 8px #6e8f73' }}></span>
              </span>
              Your spaces
            </div>
            <h1 className="text-[clamp(38px,4.4vw,54px)] font-bold tracking-tight text-transparent bg-clip-text" style={{ fontFamily: '"Space Grotesk", sans-serif', backgroundImage: 'linear-gradient(135deg, #20261f, #4d5648)' }}>
              Communities
            </h1>
            <p className="mt-2.5 text-[15.5px] text-[#656f5f]">
              Hey {user?.name?.split(' ')[0] || 'there'}, choose where you want to go today.
            </p>
          </div>
          
          <div className="flex items-center gap-3 max-sm:w-full">
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="flex items-center gap-2 rounded-[11px] border border-[#161c14]/9 bg-[#161c14]/[0.045] px-[18px] py-[11px] text-[14px] font-semibold text-[#20261f] backdrop-blur-[10px] transition-all hover:-translate-y-0.5 hover:bg-black/10"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
            <button
              onClick={() => setShowJoin(true)}
              className="flex items-center gap-2 rounded-[11px] border border-[#161c14]/9 bg-[#161c14]/[0.045] px-[18px] py-[11px] text-[14px] font-semibold text-[#20261f] backdrop-blur-[10px] transition-all hover:-translate-y-0.5 hover:bg-black/10"
            >
              <LogIn className="h-4 w-4" />
              Join
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 rounded-[11px] px-[18px] py-[11px] text-[14px] font-semibold text-[#fdf6f1] transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #c97b5a, #ad6247)', boxShadow: '0 8px 20px rgba(201,123,90,0.3)' }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 12px 28px rgba(201,123,90,0.42)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 8px 20px rgba(201,123,90,0.3)'}
            >
              <Plus className="h-4 w-4" />
              Create
            </button>
          </div>
        </header>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-[26px]">
          {communities.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-[120px] text-center">
              <div className="mb-6 text-6xl">🏘️</div>
              <h3 className="text-2xl font-semibold text-[#20261f] mb-3" style={{ fontFamily: '"Fraunces", serif' }}>No communities yet</h3>
              <p className="text-[#656f5f] text-[15.5px] mb-6 max-w-md">Join an existing community or create your first group to get started.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowJoin(true)}
                  className="rounded-[11px] border border-[#161c14]/9 bg-[#161c14]/[0.045] px-[18px] py-[11px] text-[14px] font-semibold text-[#20261f] backdrop-blur-[10px] transition-all hover:-translate-y-0.5 hover:bg-black/10"
                >
                  Join a community
                </button>
                <button
                  onClick={() => setShowCreate(true)}
                  className="rounded-[11px] px-[18px] py-[11px] text-[14px] font-semibold text-[#fdf6f1] transition-all hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg, #c97b5a, #ad6247)', boxShadow: '0 8px 20px rgba(201,123,90,0.3)' }}
                >
                  Create your first group
                </button>
              </div>
            </div>
          ) : (
            communities.map((community, index) => (
               <CommunityCard
                  key={community.id}
                  community={community}
                  onEnter={enterCommunity}
                  onLeave={leaveCommunity}
               />
            ))
          )}
        </div>

      </div>

      <CreateCommunityModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={handleCreated} />
      <JoinCommunityModal open={showJoin} onClose={() => setShowJoin(false)} onJoined={handleJoined} />
    </div>
  );
}
