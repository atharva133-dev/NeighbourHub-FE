import { useRef, useState } from 'react';
import { X, Camera, Loader2, Copy, Check, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function CreateCommunityModal({ open, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  if (!open) return null;

  const reset = () => {
    setName('');
    setDescription('');
    setAvatarFile(null);
    setAvatarPreview('');
    setCreated(null);
    setCopied(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image must be less than 2MB');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Community name is required');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('description', description.trim());
      if (avatarFile) formData.append('avatar', avatarFile);

      const { data } = await api.post('/community/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setCreated(data);
      toast.success('Community created!');
      onCreated?.(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create community');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(created.code);
      setCopied(true);
      toast.success('Code copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy code');
    }
  };

  return (
    <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} aria-label="Close" />

      <div className="modal-content glass-card relative z-10 w-full max-w-md rounded-2xl p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {created ? 'Community Created!' : 'Create Community'}
          </h2>
          <button type="button" onClick={handleClose} className="rounded-lg p-1 text-slate-400 transition hover:bg-white/10 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {created ? (
          <div className="text-center">
            <p className="mb-2 text-sm text-slate-400">Share this code so others can join</p>
            <div className="mb-4 flex items-center justify-center gap-3">
              <span className="font-mono text-4xl font-bold tracking-widest text-purple-400">
                {created.code}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                {copied ? <Check className="h-5 w-5 text-green-400" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
            <p className="mb-6 text-sm text-slate-300">
              <span className="font-semibold text-white">{created.name}</span> is ready
            </p>
            <button
              type="button"
              onClick={() => {
                handleClose();
                onCreated?.(created, true);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 py-2.5 text-sm font-semibold text-white"
            >
              Go to Community
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 text-2xl font-bold text-white">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
                  ) : (
                    name.slice(0, 2).toUpperCase() || '?'
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 rounded-full bg-purple-600 p-1.5 text-white shadow-lg"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </div>
            </div>

            <div>
              <label htmlFor="community-name" className="mb-1 block text-sm font-medium text-slate-200">
                Community Name
              </label>
              <input
                id="community-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="glass-input w-full"
                placeholder="Oak Street Neighbours"
              />
            </div>

            <div>
              <label htmlFor="community-desc" className="mb-1 block text-sm font-medium text-slate-200">
                Description
              </label>
              <textarea
                id="community-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="glass-input w-full resize-none"
                placeholder="What's this community about?"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Community'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
