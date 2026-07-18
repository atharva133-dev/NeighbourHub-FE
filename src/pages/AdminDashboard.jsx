import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Activity, AlertTriangle, FileText, Flag, Users, Trash2, Loader2, RefreshCw, Settings2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import api from '../api/axios';
import Layout from '../components/Layout';
import { DashboardSkeleton } from '../components/Skeletons';
import { useAuth } from '../context/AuthContext';
import AdminAmenityManager from '../components/amenities/AdminAmenityManager';
import AmenitiesSection from '../components/settings/AmenitiesSection';
import HelpersManager from '../components/helpers/HelpersManager';

const COLORS = ['#3b82f6', '#8b5cf6', '#22c55e', '#f97316', '#ef4444'];

function groupByCategory(notices) {
  const grouped = notices.reduce((acc, notice) => {
    const category = notice.category || 'General';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(grouped).map(([name, value]) => ({ name, value }));
}

function groupByPriority(notices) {
  const grouped = notices.reduce((acc, notice) => {
    const priority = notice.priority || (notice.category === 'Emergency' ? 'Urgent' : 'Medium');
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, {});

  return ['Low', 'Medium', 'High', 'Urgent'].map((name) => ({
    name,
    count: grouped[name] || 0,
  }));
}

export default function AdminDashboard() {
  const { isAdmin, activeCommunityId, user } = useAuth();

  // Detect if current community is a society
  const communityType = typeof user?.communityId === 'object'
    ? user?.communityId?.type
    : user?.communityType;
  const isSociety = communityType === 'society';
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState([]);

  // Cleanup state
  const [cleanupStatus, setCleanupStatus] = useState({ ranAt: null, deletedCount: 0 });
  const [cleanupLoading, setCleanupLoading] = useState(false);

  const fetchCleanupStatus = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/cleanup-status');
      setCleanupStatus(data);
    } catch {
      // non-critical, silently ignore
    }
  }, []);

  const handleCleanupNow = async () => {
    setCleanupLoading(true);
    try {
      const { data } = await api.post('/admin/cleanup-now');
      setCleanupStatus({ ranAt: data.ranAt, deletedCount: data.deletedCount });
      toast.success(`Deleted ${data.deletedCount} old notice${data.deletedCount !== 1 ? 's' : ''}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cleanup failed');
    } finally {
      setCleanupLoading(false);
    }
  };

  const fetchDashboard = useCallback(async () => {
    if (!activeCommunityId) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data } = await api.get(`/notices?communityId=${activeCommunityId}`);
      setNotices(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [activeCommunityId]);

  useEffect(() => {
    fetchDashboard();
    fetchCleanupStatus();
  }, [fetchDashboard, fetchCleanupStatus]);

  const categoryData = useMemo(() => groupByCategory(notices), [notices]);
  const priorityData = useMemo(() => groupByPriority(notices), [notices]);
  const emergencyCount = notices.filter((notice) => notice.category === 'Emergency').length;
  const totalLikes = notices.reduce((sum, notice) => sum + (notice.likes?.length || 0), 0);

  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <Layout>
      <div className="mb-6 glass-card p-5">
        <p className="text-xs font-semibold uppercase text-[#6E8F73] dark:text-[#6E8F73]">Admin dashboard</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Community Insights</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
          Monitor notice volume, emergency activity, and community engagement.
        </p>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="glass-card p-5 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
              <FileText className="mb-4 h-5 w-5 text-blue-500 dark:text-blue-300" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Total notices</p>
              <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{notices.length}</p>
            </div>
            <div className="glass-card p-5 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
              <Users className="mb-4 h-5 w-5 text-violet-500 dark:text-violet-300" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Engagement</p>
              <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{totalLikes}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">total likes</p>
            </div>
            <div className="glass-card p-5 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
              <Flag className="mb-4 h-5 w-5 text-emerald-500 dark:text-emerald-300" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Categories</p>
              <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{categoryData.length}</p>
            </div>
            <div className="glass-card p-5 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
              <AlertTriangle className="mb-4 h-5 w-5 text-red-500 dark:text-red-300" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Emergency</p>
              <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{emergencyCount}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">active alerts</p>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <section className="glass-card p-5">
              <h3 className="mb-5 text-lg font-semibold text-slate-900 dark:text-white">Priority Distribution</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priorityData}>
                    <CartesianGrid stroke="rgba(100,100,100,0.15)" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis allowDecimals={false} stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        background: '#1e293b',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 8,
                        color: '#fff',
                      }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {priorityData.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="glass-card p-5">
              <h3 className="mb-5 text-lg font-semibold text-slate-900 dark:text-white">Category Mix</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={62}
                      outerRadius={96}
                      paddingAngle={3}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#1e293b',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 8,
                        color: '#fff',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          <section className="glass-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500 dark:text-blue-300" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Activity Log</h3>
            </div>
            <div className="space-y-3">
              {notices.slice(0, 5).map((notice) => (
                <div key={notice._id} className="rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{notice.title}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {notice.category} notice with {(notice.likes || []).length} likes
                  </p>
                </div>
              ))}
              {notices.length === 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-400">No activity yet.</p>
              )}
            </div>
          </section>

          {/* ── Amenity Management (society only) ── */}
          {isSociety && activeCommunityId && (
            <AmenitiesSection />
          )}

          {/* ── Helpers Management ── */}
          <HelpersManager />

          {/* ── Data Cleanup card ── */}
          <section className="glass-card p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-500 shadow-md shadow-red-500/20">
                  <Trash2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Data Cleanup</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Automatic storage management</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCleanupNow}
                disabled={cleanupLoading}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition-all hover:-translate-y-0.5 hover:shadow-red-500/30 disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {cleanupLoading
                  ? <><Loader2 className="h-4 w-4 animate-spin" />Running...</>
                  : <><RefreshCw className="h-4 w-4" />Run Cleanup Now</>
                }
              </button>
            </div>

            <p className="mb-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Notices older than <span className="font-bold text-slate-900 dark:text-white">15 days</span> are automatically deleted every day at 2 AM to keep storage light. Pinned notices are never auto-deleted.
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-3">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Last run</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {cleanupStatus.ranAt
                    ? new Date(cleanupStatus.ranAt).toLocaleString(undefined, {
                        month: 'short', day: 'numeric',
                        hour: 'numeric', minute: '2-digit',
                      })
                    : 'Never'}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-3">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Last deleted</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {cleanupStatus.deletedCount} notice{cleanupStatus.deletedCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </section>
        </div>
      )}
    </Layout>
  );
}
