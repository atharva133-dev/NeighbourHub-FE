import { useRef, useState } from 'react';
import { X, Camera, Loader2, Copy, Check, ArrowRight, Building2, GraduationCap, Globe, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const COMMUNITY_TYPES = [
  { value: 'society', label: 'Society / Building', icon: Building2 },
  { value: 'college_school', label: 'College / School', icon: GraduationCap },
  { value: 'other', label: 'Other', icon: Globe },
];

export default function CreateCommunityModal({ open, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
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
      <button type="button" className="absolute inset-0 bg-[#20261f]/60 backdrop-blur-sm" onClick={handleClose} aria-label="Close" />

      <div className="modal-content relative z-10 w-full max-w-md rounded-2xl p-6 max-h-[90vh] overflow-y-auto" style={{ background: '#f6f5ef', border: '1px solid #ddd7ca', boxShadow: '0 20px 50px rgba(32,38,31,0.12)' }}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold" style={{ fontFamily: '"Fraunces", serif', color: '#20261f' }}>
            {created ? 'Community Created!' : 'Create Community'}
          </h2>
          <button type="button" onClick={handleClose} className="rounded-lg p-1 text-[#656f5f] transition hover:bg-[#20261f]/5 hover:text-[#20261f]">
            <X className="h-5 w-5" />
          </button>
        </div>

        {created ? (
          <div className="text-center">
            <p className="mb-2 text-sm text-[#656f5f]">Share this code so others can join</p>
            <div className="mb-4 flex items-center justify-center gap-3">
              <span className="font-mono text-4xl font-bold tracking-widest" style={{ color: '#c97b5a', fontFamily: '"JetBrains Mono", monospace' }}>
                {created.code}
              </span>
              <button type="button" onClick={handleCopy}
                className="rounded-lg border border-[#ddd7ca] bg-[#fdfaf4] p-2 text-[#656f5f] transition hover:bg-[#20261f]/5 hover:text-[#20261f]">
                {copied ? <Check className="h-5 w-5" style={{ color: '#6E8F73' }} /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
            <p className="mb-6 text-sm text-[#656f5f]">
              <span className="font-semibold" style={{ color: '#20261f' }}>{created.name}</span> is ready
            </p>
            <button type="button"
              onClick={() => { handleClose(); onCreated?.(created, true); }}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #c97b5a, #ad6247)', boxShadow: '0 8px 20px rgba(201,123,90,0.3)' }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 12px 28px rgba(201,123,90,0.42)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 8px 20px rgba(201,123,90,0.3)'}
            >
              Go to Community
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Avatar */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl text-2xl font-bold text-white" style={{ background: 'linear-gradient(135deg, #c97b5a, #ad6247)' }}>
                  {avatarPreview
                    ? <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
                    : name.slice(0, 2).toUpperCase() || '?'
                  }
                </div>
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 rounded-full p-1.5 text-white shadow-lg" style={{ background: '#c97b5a' }}>
                  <Camera className="h-3.5 w-3.5" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="community-name" className="mb-1 block text-sm font-medium" style={{ color: '#20261f' }}>
                Community Name <span style={{ color: '#c97b5a' }}>*</span>
              </label>
              <input id="community-name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                required className="w-full rounded-xl border px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2" style={{ background: '#fdfaf4', borderColor: '#ddd7ca', color: '#20261f', focusRingColor: 'rgba(201,123,90,0.3)' }} placeholder="Oak Street Neighbours" />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="community-desc" className="mb-1 block text-sm font-medium" style={{ color: '#20261f' }}>
                Description
              </label>
              <textarea id="community-desc" value={description} onChange={(e) => setDescription(e.target.value)}
                rows={2} className="w-full rounded-xl border px-4 py-2.5 text-sm resize-none transition-all focus:outline-none focus:ring-2" style={{ background: '#fdfaf4', borderColor: '#ddd7ca', color: '#20261f', focusRingColor: 'rgba(201,123,90,0.3)' }} placeholder="What's this community about?" />
            </div>

            {/* Community Type Dropdown */}
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: '#20261f' }}>
                Community Type <span style={{ color: '#c97b5a' }}>*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                  className="w-full flex items-center justify-between rounded-xl border px-4 py-2.5 text-left text-sm transition-all focus:outline-none focus:ring-2"
                  style={{ background: '#fdfaf4', borderColor: '#ddd7ca', color: type ? '#20261f' : '#656f5f', focusRingColor: 'rgba(201,123,90,0.3)' }}
                >
                  <span className="flex items-center gap-2">
                    {type ? (
                      <>
                        {(() => {
                          const selectedType = COMMUNITY_TYPES.find(ct => ct.value === type);
                          const Icon = selectedType?.icon;
                          return Icon ? <Icon className="h-4 w-4" style={{ color: '#c97b5a' }} /> : null;
                        })()}
                        {COMMUNITY_TYPES.find(ct => ct.value === type)?.label}
                      </>
                    ) : 'Select community type'}
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showTypeDropdown ? 'rotate-180' : ''}`} style={{ color: '#656f5f' }} />
                </button>

                {showTypeDropdown && (
                  <div className="absolute z-10 mt-1 w-full rounded-xl border overflow-hidden" style={{ background: '#fdfaf4', borderColor: '#ddd7ca', boxShadow: '0 8px 20px rgba(32,38,31,0.12)' }}>
                    {COMMUNITY_TYPES.map((ct) => {
                      const Icon = ct.icon;
                      return (
                        <button
                          key={ct.value}
                          type="button"
                          onClick={() => { setType(ct.value); setShowTypeDropdown(false); }}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#20261f]/5"
                          style={{ color: '#20261f' }}
                        >
                          <Icon className="h-4 w-4" style={{ color: '#c97b5a' }} />
                          {ct.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Society-specific fields */}
            {type === 'society' && (
              <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: '#6E8F73', background: '#E4EBE1' }}>
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#4E6B54' }}>Society Details (optional)</p>
                <div>
                  <label className="mb-1 block text-xs font-medium" style={{ color: '#20261f' }}>Total Units / Flats</label>
                  <input type="number" min="1" value={totalUnits} onChange={(e) => setTotalUnits(e.target.value)}
                    className="w-full rounded-xl border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2" style={{ background: '#fdfaf4', borderColor: '#ddd7ca', color: '#20261f', focusRingColor: 'rgba(110,143,115,0.3)' }} placeholder="e.g. 120" />
                </div>
                <label className="flex cursor-pointer items-center gap-3 text-sm" style={{ color: '#20261f' }}>
                  <input type="checkbox" checked={hasSecurityGate} onChange={(e) => setHasSecurityGate(e.target.checked)}
                    className="h-4 w-4 rounded border-[#ddd7ca] bg-[#fdfaf4]" style={{ accentColor: '#6E8F73' }} />
                  Has security / gate entry
                </label>
              </div>
            )}

            {/* College/School-specific fields */}
            {type === 'college_school' && (
              <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: '#C97B5A', background: '#F3DFD1' }}>
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#A85C3F' }}>Institution Details (optional)</p>
                <div>
                  <label className="mb-1 block text-xs font-medium" style={{ color: '#20261f' }}>Institution Name</label>
                  <input type="text" value={institutionName} onChange={(e) => setInstitutionName(e.target.value)}
                    className="w-full rounded-xl border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2" style={{ background: '#fdfaf4', borderColor: '#ddd7ca', color: '#20261f', focusRingColor: 'rgba(201,123,90,0.3)' }} placeholder="e.g. St. Xavier's College" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium" style={{ color: '#20261f' }}>Affiliated Board / University</label>
                  <input type="text" value={affiliatedBoard} onChange={(e) => setAffiliatedBoard(e.target.value)}
                    className="w-full rounded-xl border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2" style={{ background: '#fdfaf4', borderColor: '#ddd7ca', color: '#20261f', focusRingColor: 'rgba(201,123,90,0.3)' }} placeholder="e.g. Mumbai University" />
                </div>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #c97b5a, #ad6247)', boxShadow: '0 8px 20px rgba(201,123,90,0.3)' }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.boxShadow = '0 12px 28px rgba(201,123,90,0.42)')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.boxShadow = '0 8px 20px rgba(201,123,90,0.3)')}
            >
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
