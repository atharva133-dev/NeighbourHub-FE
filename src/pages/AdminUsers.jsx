import { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Shield, ShieldOff, Trash2, User } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

export default function AdminUsers() {
  const { isAdmin, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/auth/users');
      setUsers(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await api.patch('/auth/users/' + userId + '/role', { role: newRole });
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
      toast.success('User role changed to ' + newRole);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm('Delete user "' + userName + '" and all their notices/comments?')) return;
    try {
      await api.delete('/auth/users/' + userId);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      toast.success('User "' + userName + '" deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <Layout>
      <div className="mb-6 glass-card p-5">
        <p className="text-xs font-semibold uppercase text-blue-300">Admin</p>
        <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">User Management</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          View all registered users, manage roles, and remove accounts.
        </p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-6 py-3 font-semibold text-slate-200">User</th>
                <th className="px-6 py-3 font-semibold text-slate-200">Email</th>
                <th className="px-6 py-3 font-semibold text-slate-200">Role</th>
                <th className="px-6 py-3 font-semibold text-slate-200">Joined</th>
                <th className="px-6 py-3 font-semibold text-slate-200">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">No users found.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="transition hover:bg-white/5">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-xs font-bold text-white">
                          {u.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-white">{u.name}</p>
                          {u._id === currentUser?.id && <p className="text-xs text-blue-300">You</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{u.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={
                          'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ' +
                          (u.role === 'admin'
                            ? 'bg-purple-500/15 text-purple-200 ring-1 ring-purple-400/20'
                            : 'bg-slate-500/15 text-slate-200 ring-1 ring-slate-400/20')
                        }
                      >
                        {u.role === 'admin' ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Unknown'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleRole(u._id, u.role)}
                          disabled={u._id === currentUser?.id}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                          title={u.role === 'admin' ? 'Demote to user' : 'Promote to admin'}
                        >
                          {u.role === 'admin' ? <ShieldOff className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                          {u.role === 'admin' ? 'Demote' : 'Promote'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u._id, u.name)}
                          disabled={u._id === currentUser?.id}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-400/20 px-2.5 py-1.5 text-xs font-medium text-red-200 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                          title="Delete user"
                        >
                          <Trash2 className="h-3 w-3" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}