import { useEffect, useRef, useState } from 'react';
import { User, Camera, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function ProfileSection() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [removeAvatarFlag, setRemoveAvatarFlag] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setAvatarPreview(user.avatarUrl || '');
      setAvatarFile(null);
      setRemoveAvatarFlag(false);
    }
  }, [user]);

  const handleAvatarSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Avatar must be less than 2MB');
        return;
      }
      setAvatarFile(file);
      setRemoveAvatarFlag(false);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleAvatarChange = (e) => {
    if (e.target.files?.[0]) {
      handleAvatarSelect(e.target.files[0]);
    }
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview('');
    setRemoveAvatarFlag(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('bio', bio);
      if (avatarFile) formData.append('avatar', avatarFile);
      if (removeAvatarFlag) formData.append('removeAvatar', 'true');

      const { data } = await api.patch('/users/settings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUser(data);
      setAvatarFile(null);
      setRemoveAvatarFlag(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6">
      <h2 className="mb-6 text-xl font-semibold text-white">Profile</h2>

      <div className="mb-6">
        <label className="mb-3 block text-sm font-medium text-slate-200">Avatar</label>
        <div className="flex items-start gap-6">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <User className="h-12 w-12" />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg transition hover:bg-purple-500"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
          <div className="flex-1">
            <p className="mb-2 text-sm text-slate-300">Upload a profile picture. Max size: 2MB.</p>
            {(avatarPreview || user?.avatarUrl) && (
              <button
                type="button"
                onClick={removeAvatar}
                className="text-sm text-red-400 transition hover:text-red-300"
              >
                Remove avatar
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-200">
          Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="glass-input w-full"
          placeholder="Your name"
        />
      </div>

      <div className="mb-6">
        <label htmlFor="bio" className="mb-1 block text-sm font-medium text-slate-200">
          Bio
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          maxLength={300}
          className="glass-input w-full resize-none"
          placeholder="Tell us about yourself..."
        />
        <p className="mt-1 text-right text-xs text-slate-500">{bio.length}/300</p>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={loading}
        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition duration-200 hover:-translate-y-0.5 hover:shadow-purple-500/30 disabled:opacity-60"
      >
        <Save className="h-4 w-4" />
        {loading ? 'Saving...' : 'Save Changes'}
      </button>

      {user?.communityId?.code && (
        <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-200">Active Community</h3>
            <button
              type="button"
              onClick={async () => {
                if (!window.confirm('Are you sure you want to leave this community?')) return;
                try {
                  const { data } = await api.post(`/community/${user.communityId.id || user.communityId._id}/leave`);
                  toast.success(data.message);
                  setUser(data.user);
                } catch (err) {
                  toast.error(err.response?.data?.message || 'Failed to leave community');
                }
              }}
              className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/20 hover:text-red-300"
            >
              Leave Community
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-semibold text-white">{user.communityId.name}</p>
              <p className="text-sm text-slate-400">Code: <span className="font-mono text-purple-300">{user.communityId.code}</span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
