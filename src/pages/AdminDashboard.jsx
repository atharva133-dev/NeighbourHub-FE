import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Activity, AlertTriangle, FileText, Flag, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import api from '../api/axios';
import Layout from '../components/Layout';
import { DashboardSkeleton } from '../components/Skeletons';
import { useAuth } from '../context/AuthContext';

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
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState([]);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notices');
      setNotices(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const categoryData = useMemo(() => groupByCategory(notices), [notices]);
  const priorityData = useMemo(() => groupByPriority(notices), [notices]);
  const emergencyCount = notices.filter((notice) => notice.category === 'Emergency').length;
  const totalLikes = notices.reduce((sum, notice) => sum + (notice.likes?.length || 0), 0);

  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <Layout>
      <div className="mb-6 glass-card p-5">
        <p className="text-xs font-semibold uppercase text-blue-300">Admin dashboard</p>
        <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Community Insights</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          Monitor notice volume, emergency activity, and community engagement.
        </p>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="glass-card p-5 transition duration-300 hover:-translate-y-1 hover:bg-white/15">
              <FileText className="mb-4 h-5 w-5 text-blue-300" />
              <p className="text-sm text-slate-400">Total notices</p>
              <p className="mt-2 text-3xl font-bold text-white">{notices.length}</p>
            </div>
            <div className="glass-card p-5 transition duration-300 hover:-translate-y-1 hover:bg-white/15">
              <Users className="mb-4 h-5 w-5 text-violet-300" />
              <p className="text-sm text-slate-400">Known users</p>
              <p className="mt-2 text-3xl font-bold text-white">1+</p>
            </div>
            <div className="glass-card p-5 transition duration-300 hover:-translate-y-1 hover:bg-white/15">
              <Flag className="mb-4 h-5 w-5 text-orange-300" />
              <p className="text-sm text-slate-400">Total reports</p>
              <p className="mt-2 text-3xl font-bold text-white">0</p>
            </div>
            <div className="glass-card p-5 transition duration-300 hover:-translate-y-1 hover:bg-white/15">
              <AlertTriangle className="mb-4 h-5 w-5 text-red-300" />
              <p className="text-sm text-slate-400">Emergency notices</p>
              <p className="mt-2 text-3xl font-bold text-white">{emergencyCount}</p>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <section className="glass-card p-5">
              <h3 className="mb-5 text-lg font-semibold text-white">Priority Distribution</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priorityData}>
                    <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis allowDecimals={false} stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        background: '#0f172a',
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
              <h3 className="mb-5 text-lg font-semibold text-white">Category Mix</h3>
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
                        background: '#0f172a',
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
              <Activity className="h-5 w-5 text-blue-300" />
              <h3 className="text-lg font-semibold text-white">Activity Log</h3>
            </div>
            <div className="space-y-3">
              {notices.slice(0, 5).map((notice) => (
                <div key={notice._id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="text-sm font-medium text-white">{notice.title}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {notice.category} notice with {(notice.likes || []).length} likes
                  </p>
                </div>
              ))}
              {notices.length === 0 && (
                <p className="text-sm text-slate-400">No activity yet.</p>
              )}
            </div>
          </section>
        </div>
      )}
    </Layout>
  );
}
