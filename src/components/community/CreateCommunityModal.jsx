import { useRef, useState } from 'react';
import { X, Camera, Loader2, Copy, Check, ArrowRight, Building2, GraduationCap, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const COMMUNITY_TYPES = [
  {
    value: 'society',
    label: 'Society / Building',
    icon: Building2,
    desc: 'Residential society, apartment complex, or housing colony',
    color: 'border-purple-400 bg-purple-50 text-purple-700 dark:border-purple-500/50 dark:bg-purple-500/10 dark:text-purple-300',
    active: 'border-purple-600 bg-purple-100 text-purple-800 ring-2 ring-purple-500/30 dark:border-purple-400 dark:bg-purple-500/20 dark:text-purple-200',
  },
  {
    value: 'college_school',
    label: 'College / School',
    icon: GraduationCap,
    desc: 'Educational institution community',
    color: 'border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-500/50 dark:bg-emerald-500/10 dark:text-emerald-300',
    active: 'border-emerald-600 bg-emerald-100 text-emerald-800 ring-2 ring-emerald-500/30 dark:border-emerald-400 dark:bg-emerald-500/20 dark:text-emerald-200',
  },
  {
    value: 'other',
    label: 'Other',
    icon: Globe,
    desc: 'Neighbourhood, club, or any other group',
    color: 'border-blue-400 bg-blue-50 text-blue-700 dark:border-blue-500/50 dark:bg-blue-500/10 dark:text-blue-300',
    active: 'border-blue-600 bg-blue-100 text-blue-800 ring-2 ring-blue-500/30 dark:border-blue-400 dark:bg-blue-500/20 dark:text-blue-200',
  },
];

export default function CreateCommunityModal({ open, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(null);
  const [copied, setCopied] = useState(false);

  // Society-specific
  const [totalUnits, setTotalUnits] = useState('');
  const [hasSecurityGate, setHasSecurityGate] = useState(false);

  // Institution-specific
  const [institutionName, setInstitutionName] = useState('');
  const [affiliatedBoard, setAffiliatedBoard] = useState('');

  const fileInputRef = useRef(null);

  if (!open) return null;

  const reset = () => {
    setName(''); setDescription(''); setType('');
    setAvatarFile(null); setAvatarPreview('');
    setCreated(null); setCopied(false);
    setTotalUnits(''); setHasSecurityGate(false);
    setInstitutionName(''); setAffiliatedBoard('');
  };

  const handleClose = () => { reset(); onClose(); };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 2 * 1024 * 1024) { toast.error('Image must be less than 2MB'); return; }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Community name is required'); return; }
    if (!type) { toast.error('Please select a community type'); return; }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('description', description.trim());
      formData.append('type', type);
      if (avatarFile) formData.append('avatar', avatarFile);

      // Append type-specific details as JSON string (multipart safe)
      if (type === 'society') {
        formData.append('societyDetails', JSON.stringify({
          totalUnits: totalUnits ? Number(totalUnits) : undefined,
          hasSecurityGate,
        }));
      }
      if (type === 'college_school') {
        formData.append('institutionDetails', JSON.stringify({
          institutionName: institutionName.trim() || undefined,
          affiliatedBoard: affiliatedBoard.trim() || undefined,
        }));
      }

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

      <div className="modal-content glass-card relative z-10 w-full max-w-md rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
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
              <button type="button" onClick={handleCopy}
                className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white">
                {copied ? <Check className="h-5 w-5 text-green-400" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
            <p className="mb-6 text-sm text-slate-300">
              <span className="font-semibold text-white">{created.name}</span> is ready
            </p>
            <button type="button"
              onClick={() => { handleClose(); onCreated?.(created, true); }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 py-2.5 text-sm font-semibold text-white">
              Go to Community
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Avatar */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 text-2xl font-bold text-white">
                  {avatarPreview
                    ? <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
                    : name.slice(0, 2).toUpperCase() || '?'
                  }
                </div>
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 rounded-full bg-purple-600 p-1.5 text-white shadow-lg">
                  <Camera className="h-3.5 w-3.5" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="community-name" className="mb-1 block text-sm font-medium text-slate-200">
                Community Name <span className="text-red-400">*</span>
              </label>
              <input id="community-name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                required className="glass-input w-full" placeholder="Oak Street Neighbours" />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="community-desc" className="mb-1 block text-sm font-medium text-slate-200">
                Description
              </label>
              <textarea id="community-desc" value={description} onChange={(e) => setDescription(e.target.value)}
                rows={2} className="glass-input w-full resize-none" placeholder="What's this community about?" />
            </div>

            {/* Community Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Community Type <span className="text-red-400">*</span>
              </label>
              <div className="space-y-2">
                {COMMUNITY_TYPES.map((ct) => {
                  const Icon = ct.icon;
                  const isSelected = type === ct.value;
                  return (
                    <button key={ct.value} type="button" onClick={() => setType(ct.value)}
                      className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200 ${
                        isSelected ? ct.active : ct.color + ' hover:opacity-90'
                      }`}>
                      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold leading-tight">{ct.label}</p>
                        <p className="mt-0.5 text-xs opacity-75">{ct.desc}</p>
                      </div>
                      {isSelected && (
                        <span className="ml-auto shrink-0 mt-0.5 h-4 w-4 rounded-full bg-current opacity-80 flex items-center justify-center">
                          <Check className="h-2.5 w-2.5 text-white" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Society-specific fields */}
            {type === 'society' && (
              <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wide text-purple-300">Society Details (optional)</p>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-300">Total Units / Flats</label>
                  <input type="number" min="1" value={totalUnits} onChange={(e) => setTotalUnits(e.target.value)}
                    className="glass-input w-full" placeholder="e.g. 120" />
                </div>
                <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-300">
                  <input type="checkbox" checked={hasSecurityGate} onChange={(e) => setHasSecurityGate(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-white/10 text-purple-600 focus:ring-purple-500/40" />
                  Has security / gate entry
                </label>
              </div>
            )}

            {/* College/School-specific fields */}
            {type === 'college_school' && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-300">Institution Details (optional)</p>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-300">Institution Name</label>
                  <input type="text" value={institutionName} onChange={(e) => setInstitutionName(e.target.value)}
                    className="glass-input w-full" placeholder="e.g. St. Xavier's College" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-300">Affiliated Board / University</label>
                  <input type="text" value={affiliatedBoard} onChange={(e) => setAffiliatedBoard(e.target.value)}
                    className="glass-input w-full" placeholder="e.g. Mumbai University" />
                </div>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Creating...</>
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
