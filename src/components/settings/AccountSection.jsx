import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function AccountSection() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setChangingPassword(true);
    try {
      await api.patch('/users/password', { currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error('Enter your password to confirm deletion');
      return;
    }

    setDeleting(true);
    try {
      await api.delete('/users/account', { data: { password: deletePassword } });
      logout();
      toast.success('Account deleted');
      navigate('/register');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6">
        <h2 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">Account</h2>
        <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">Manage your login credentials</p>

        <div className="mb-6">
          <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">Email</label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="glass-input w-full cursor-not-allowed opacity-70 bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400"
          />
          <p className="mt-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">Email cannot be changed</p>
        </div>

        <div className="border-t border-slate-200 pt-6 dark:border-white/10">
          <h3 className="mb-5 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <KeyRound className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            Change Password
          </h3>
          <div className="space-y-5">
            <div>
              <label htmlFor="currentPassword" className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Current Password
              </label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="glass-input w-full"
                autoComplete="current-password"
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="glass-input w-full"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="glass-input w-full"
                autoComplete="new-password"
              />
            </div>
            <button
              type="button"
              onClick={handleChangePassword}
              disabled={changingPassword}
              className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-purple-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-purple-500/40 disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {changingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl border-red-200 p-6 dark:border-red-500/20">
        <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-red-600 dark:text-red-400">
          <Trash2 className="h-5 w-5" />
          Delete Account
        </h3>
        <p className="mb-5 text-sm text-slate-600 dark:text-slate-400">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>

        {!showDeleteConfirm ? (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition-all hover:bg-red-100 dark:border-red-500/40 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-500/10"
          >
            Delete my account
          </button>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Enter password to confirm"
              className="glass-input w-full max-w-sm"
              autoComplete="current-password"
            />
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="rounded-xl bg-red-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-red-500/25 transition-all hover:bg-red-700 hover:shadow-red-500/40 disabled:opacity-60"
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletePassword('');
                }}
                className="rounded-xl px-5 py-2 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
