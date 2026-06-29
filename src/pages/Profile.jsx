import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit3, Save, User, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Layout from '../components/Layout';
import NoticeCard from '../components/NoticeCard';
import { NoticeListSkeleton } from '../components/Skeletons';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myNotices, setMyNotices] = useState([]);
  const [loadingNotices, setLoadingNotices] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    setName(user.name || '');
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchMyNotices = async () => {
      setLoadingNotices(true);
      try {
        const { data } = await api.get(`/notices/user/${user.id}`);
        setMyNotices(data);
      } catch {
        toast.error('Failed to load your notices');
      } finally {
        setLoadingNotices(false);
      }
    };
    fetchMyNotices();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    setSaving(true);
    try {
      await api.patch('/auth/profile', { name: name.trim() });
      toast.success('Profile updated');
      setEditing(false);
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: 'numeric', month: 'long',
      })
    : 'Unknown';

  return (
    <Layout>
      <div className="mb-6 glass-card p-5">
        <p className="text-xs font-semibold uppercase text-blue-300">Profile</p>
        <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">My Account</h2>
      </div>

      {/* Profile Card */}
      <div>
        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 px-6 py-8 sm:px-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-2xl font-bold text-white shadow-lg shadow-purple-500/30">
              {user.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="text-center sm:text-left">
              {editing ? (
                <div className="flex items-center gap-2">
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="glass-input text-lg font-bold text-white" placeholder="Your name" autoFocus />
                  <button type="button" onClick={handleSaveProfile} disabled={saving} className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-400 disabled:opacity-50">
                    <Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save'}
                  </button>
                  <button type="button" onClick={() => { setEditing(false); setName(user.name); }} className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-bold text-white">{user.name}</h3>
                  <button type="button" onClick={() => setEditing(true)} className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10">
                    <Edit3 className="h-3 w-3" /> Edit
                  </button>
                </div>
              )}
              <p className="mt-1 text-sm text-slate-400">{user.email}</p>
              <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1"><User className="h-3 w-3" />{user.role}</span>
                <span>Member since {memberSince}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* My Notices */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-white">My Notices ({myNotices.length})</h3>        {loadingNotices ? (
          <NoticeListSkeleton />
        ) : myNotices.length === 0 ? (
          <div className='glass-card border-dashed py-16 text-center'>
            <p className='text-slate-300'>You haven&apos;t posted any notices yet.</p>
          </div>
        ) : (
          <div className='space-y-4'>
            {myNotices.map((notice) => (
              <NoticeCard key={notice._id} notice={notice}
                onUpdate={(updated) => setMyNotices((prev) => prev.map((n) => (n._id === updated._id ? updated : n)))}
                onDelete={(id) => setMyNotices((prev) => prev.filter((n) => n._id !== id))}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
