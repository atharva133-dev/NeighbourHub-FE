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
      <div className="mb-8 glass-card rounded-2xl bg-white p-6 shadow-sm border border-slate-200 dark:border-white/10 dark:bg-white/5">
        <p className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-blue-300">Profile</p>
        <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">My Account</h2>
      </div>

      {/* Profile Card */}
      <div className="mb-10 overflow-hidden rounded-2xl bg-white shadow-md border border-slate-200 dark:border-white/10 dark:bg-[#13131f] transition-all hover:shadow-lg">
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 px-6 py-8 sm:px-8 dark:from-purple-600/20 dark:to-blue-600/20">
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-3xl font-bold text-white shadow-xl shadow-purple-500/30">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                user.name?.charAt(0)?.toUpperCase() || '?'
              )}
            </div>
            <div className="text-center sm:text-left w-full">
              {editing ? (
                <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start">
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="glass-input text-lg font-bold text-slate-900 dark:text-white bg-white/50 dark:bg-black/20 focus:bg-white dark:focus:bg-black/40 border-slate-300 dark:border-white/20 px-4 py-2" placeholder="Your name" autoFocus />
                  <button type="button" onClick={handleSaveProfile} disabled={saving} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-emerald-500/40 disabled:opacity-50">
                    <Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save'}
                  </button>
                  <button type="button" onClick={() => { setEditing(false); setName(user.name); }} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:border-white/20 dark:bg-black/20 dark:text-slate-200 dark:hover:bg-black/40">
                    <X className="h-4 w-4" /> Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 justify-center sm:justify-start">
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">{user.name}</h3>
                  <button type="button" onClick={() => setEditing(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-white/60 px-3 py-1.5 text-xs font-bold text-purple-700 shadow-sm transition-all hover:bg-white dark:border-white/20 dark:bg-black/20 dark:text-slate-300 dark:hover:bg-black/40">
                    <Edit3 className="h-3.5 w-3.5" /> Edit
                  </button>
                </div>
              )}
              <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">{user.email}</p>
              <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5 rounded-full bg-slate-200/50 px-3 py-1 dark:bg-white/10"><User className="h-3.5 w-3.5" />{user.role}</span>
                <span className="rounded-full bg-slate-200/50 px-3 py-1 dark:bg-white/10">Member since {memberSince}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* My Notices */}
      <div>
        <h3 className="mb-6 text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          My Notices
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-xs text-purple-700 dark:bg-purple-500/20 dark:text-purple-300">{myNotices.length}</span>
        </h3>        
        {loadingNotices ? (
          <NoticeListSkeleton />
        ) : myNotices.length === 0 ? (
          <div className='glass-card rounded-2xl border-dashed border-2 border-slate-300 bg-slate-50 py-20 text-center dark:border-white/10 dark:bg-white/5'>
            <p className='text-lg font-medium text-slate-500 dark:text-slate-400'>You haven&apos;t posted any notices yet.</p>
            <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">Go to the community page to share something new.</p>
          </div>
        ) : (
          <div className='grid gap-6'>
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
