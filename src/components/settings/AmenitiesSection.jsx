import { useCallback, useEffect, useState } from 'react';
import { Dumbbell, Trash2, Plus, Loader2, Users, Info, ExternalLink, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import ToggleSwitch from './ToggleSwitch';

// Quick-add suggestions so admins don't have to type from scratch
const SUGGESTED_AMENITIES = [
  { name: 'Gym',          description: 'Fitness and exercise equipment', icon: '🏋️' },
  { name: 'Swimming Pool',description: 'Outdoor / indoor pool',          icon: '🏊' },
  { name: 'Clubhouse',    description: 'Community hall for gatherings',  icon: '🏛️' },
  { name: 'Parking',      description: 'Visitor parking slots',          icon: '🚗' },
  { name: 'Terrace',      description: 'Open rooftop terrace area',      icon: '🌇' },
  { name: 'Badminton Court', description: 'Indoor / outdoor court',      icon: '🏸' },
  { name: 'Kids Play Area',  description: "Children's play zone",        icon: '🛝' },
  { name: 'Yoga Room',    description: 'Dedicated yoga and meditation room', icon: '🧘' },
];

export default function AmenitiesSection() {
  const { activeCommunityId } = useAuth();
  const navigate = useNavigate();

  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  // null = loading community info, true/false = resolved
  const [isCommunityAdmin, setIsCommunityAdmin] = useState(null);
  const [isSociety, setIsSociety] = useState(false);

  // Add form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isBookable, setIsBookable] = useState(true);
  const [capacity, setCapacity] = useState('');
  const [operatingHours, setOperatingHours] = useState('');
  const [operatingDays, setOperatingDays] = useState([]);
  const [adding, setAdding] = useState(false);

  // Quick-add confirmation state
  const [quickAddPending, setQuickAddPending] = useState(null); // { name, description, icon }
  const [quickAddBookable, setQuickAddBookable] = useState(true);
  const [quickAddOperatingHours, setQuickAddOperatingHours] = useState('');
  const [quickAddOperatingDays, setQuickAddOperatingDays] = useState([]);

  // Delete confirm
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch community info + amenities
  useEffect(() => {
    if (!activeCommunityId) {
      setIsCommunityAdmin(false);
      setIsSociety(false);
      setLoading(false);
      return;
    }
    api.get(`/community/${activeCommunityId}`)
      .then(({ data }) => {
        setIsCommunityAdmin(!!data.isAdmin);
        setIsSociety(data.type === 'society');
      })
      .catch(() => { setIsCommunityAdmin(false); setLoading(false); });
  }, [activeCommunityId]);

  const fetchAmenities = useCallback(async () => {
    if (!activeCommunityId || !isSociety) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data } = await api.get(`/community/${activeCommunityId}/amenities`);
      setAmenities(data);
    } catch (err) {
      if (err.response?.status !== 400) {
        toast.error(err.response?.data?.message || 'Failed to load amenities');
      }
    } finally {
      setLoading(false);
    }
  }, [activeCommunityId, isSociety]);

  useEffect(() => {
    if (isCommunityAdmin !== null) fetchAmenities();
  }, [isCommunityAdmin, fetchAmenities]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Amenity name is required'); return; }
    setAdding(true);
    try {
      const { data } = await api.post(`/community/${activeCommunityId}/amenities`, {
        name: name.trim(),
        description: description.trim(),
        isBookable,
        capacity: capacity ? Number(capacity) : undefined,
        operatingHours: operatingHours.trim(),
        operatingDays,
      });
      setAmenities((prev) => [...prev, data]);
      toast.success(`"${data.name}" added`);
      setName(''); setDescription(''); setIsBookable(true); setCapacity('');
      setOperatingHours(''); setOperatingDays([]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add amenity');
    } finally {
      setAdding(false);
    }
  };

  const handleQuickAdd = (suggestion) => {
    if (amenities.some((a) => a.name.toLowerCase() === suggestion.name.toLowerCase())) {
      toast.error(`"${suggestion.name}" is already added`);
      return;
    }
    setQuickAddPending(suggestion);
    setQuickAddBookable(true); // default to bookable
    setQuickAddOperatingHours('');
    setQuickAddOperatingDays([]);
  };

  // Step 2: confirming the quick-add with the chosen bookable setting
  const handleQuickAddConfirm = async () => {
    if (!quickAddPending) return;
    setAdding(true);
    try {
      const { data } = await api.post(`/community/${activeCommunityId}/amenities`, {
        name: quickAddPending.name,
        description: quickAddPending.description,
        isBookable: quickAddBookable,
        operatingHours: quickAddOperatingHours.trim(),
        operatingDays: quickAddOperatingDays,
      });
      setAmenities((prev) => [...prev, data]);
      toast.success(`"${data.name}" added`);
      setQuickAddPending(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add amenity');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (amenityId) => {
    setDeletingId(amenityId);
    try {
      const { data } = await api.delete(`/community/${activeCommunityId}/amenities/${amenityId}`);
      setAmenities((prev) => prev.filter((a) => (a._id || a.id) !== amenityId));
      const cancelled = data.cancelledBookings || 0;
      toast.success(`Deleted${cancelled > 0 ? ` · ${cancelled} booking(s) cancelled` : ''}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isCommunityAdmin === null) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  // ── Not a society community ───────────────────────────────────────────────
  if (!isSociety) {
    return (
      <div className="glass-card rounded-2xl border border-slate-200 bg-white/60 p-6 dark:border-white/10 dark:bg-white/5">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {activeCommunityId
            ? 'Amenities are only available for Society communities.'
            : 'No active community selected. Enter a community first.'}
        </p>
      </div>
    );
  }

  // ── Regular member view ───────────────────────────────────────────────────
  if (!isCommunityAdmin) {
    return (
      <div className="space-y-4">
        <div className="glass-card rounded-2xl border border-slate-200 bg-white/60 p-6 dark:border-white/10 dark:bg-white/5">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 shadow-md shadow-purple-500/20">
              <Dumbbell className="h-5 w-5 text-white" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Community Amenities</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Shared facilities in your society</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-slate-400 py-4">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : amenities.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No amenities have been added yet for this community.
            </p>
          ) : (
            <div className="space-y-2">
              {amenities.map((amenity) => (
                <div key={amenity._id || amenity.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{amenity.name}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        amenity.isBookable
                          ? 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300'
                          : 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400'
                      }`}>
                        {amenity.isBookable ? 'Bookable' : 'View only'}
                      </span>
                      {amenity.capacity != null && (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                          <Users className="h-3 w-3" />{amenity.capacity}
                        </span>
                      )}
                      {(amenity.operatingHours || (amenity.operatingDays && amenity.operatingDays.length > 0)) && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300 px-2 py-0.5 text-xs font-medium ring-1 ring-purple-200 dark:ring-purple-500/20">
                          <Clock className="h-3 w-3" />
                          {amenity.operatingHours || 'Available'}
                          {amenity.operatingDays && amenity.operatingDays.length > 0 && ` (${amenity.operatingDays.length === 7 ? 'Everyday' : amenity.operatingDays.join(', ')})`}
                        </span>
                      )}
                    </div>
                    {amenity.description && (
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{amenity.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => navigate('/amenities')}
            className="mt-5 flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-purple-500/25 transition-all hover:-translate-y-0.5 hover:shadow-purple-500/40"
          >
            <ExternalLink className="h-4 w-4" />
            Go to Amenities & Book
          </button>
        </div>
      </div>
    );
  }

  // ── Admin view ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Current amenities list */}
      <div className="glass-card rounded-2xl border border-slate-200 bg-white/60 p-6 dark:border-white/10 dark:bg-white/5">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 shadow-md shadow-purple-500/20">
            <Dumbbell className="h-5 w-5 text-white" />
          </span>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Manage Amenities</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Add or remove bookable facilities for your society</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-slate-400 py-4">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : amenities.length === 0 ? (
          <div className="rounded-xl border-dashed border-2 border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/3 py-8 text-center">
            <Dumbbell className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No amenities added yet.</p>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Use the quick-add below or the custom form.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {amenities.map((amenity) => {
              const aid = amenity._id || amenity.id;
              return (
                <div key={aid} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{amenity.name}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        amenity.isBookable
                          ? 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300'
                          : 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400'
                      }`}>
                        {amenity.isBookable ? 'Bookable' : 'View only'}
                      </span>
                      {amenity.capacity != null && (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                          <Users className="h-3 w-3" />{amenity.capacity}
                        </span>
                      )}
                      {(amenity.operatingHours || (amenity.operatingDays && amenity.operatingDays.length > 0)) && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300 px-2 py-0.5 text-xs font-medium ring-1 ring-purple-200 dark:ring-purple-500/20">
                          <Clock className="h-3 w-3" />
                          {amenity.operatingHours || 'Available'}
                          {amenity.operatingDays && amenity.operatingDays.length > 0 && ` (${amenity.operatingDays.length === 7 ? 'Everyday' : amenity.operatingDays.join(', ')})`}
                        </span>
                      )}
                    </div>
                    {amenity.description && (
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{amenity.description}</p>
                    )}
                  </div>

                  {confirmDeleteId === aid ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <p className="text-xs text-red-500 dark:text-red-400 font-medium hidden sm:block">Cancels bookings too</p>
                      <button type="button" onClick={() => handleDelete(aid)} disabled={deletingId === aid}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60">
                        {deletingId === aid ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Yes, delete'}
                      </button>
                      <button type="button" onClick={() => setConfirmDeleteId(null)}
                        className="rounded-lg border border-slate-200 dark:border-white/10 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setConfirmDeleteId(aid)}
                      className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-400/20 dark:bg-transparent dark:text-red-300 dark:hover:bg-red-500/10">
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick-add suggestions */}
      <div className="glass-card rounded-2xl border border-slate-200 bg-white/60 p-6 dark:border-white/10 dark:bg-white/5">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md shadow-emerald-500/20">
            <Plus className="h-5 w-5 text-white" />
          </span>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Quick Add</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Tap to add a common amenity</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {SUGGESTED_AMENITIES.map((s) => {
            const alreadyAdded = amenities.some((a) => a.name.toLowerCase() === s.name.toLowerCase());
            const isSelected = quickAddPending?.name === s.name;
            return (
              <button key={s.name} type="button"
                onClick={() => handleQuickAdd(s)}
                disabled={adding || alreadyAdded}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed ${
                  alreadyAdded
                    ? 'border-green-200 bg-green-50 text-green-600 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400 opacity-60'
                    : isSelected
                      ? 'border-purple-400 bg-purple-100 text-purple-700 ring-2 ring-purple-300 dark:border-purple-500 dark:bg-purple-500/20 dark:text-purple-300 dark:ring-purple-500/40'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-purple-500/40 dark:hover:bg-purple-500/10 dark:hover:text-purple-300 hover:-translate-y-0.5'
                }`}>
                <span>{s.icon}</span>
                {s.name}
                {alreadyAdded && <span className="text-xs opacity-75">✓</span>}
              </button>
            );
          })}
        </div>

        {/* Inline confirmation card when a quick-add is selected */}
        {quickAddPending && (
          <div className="mt-4 rounded-xl border border-purple-200 bg-purple-50/80 p-4 dark:border-purple-500/30 dark:bg-purple-500/10 animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{quickAddPending.icon}</span>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{quickAddPending.name}</p>
                {quickAddPending.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">{quickAddPending.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 px-4 py-3 mb-3">
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Allow bookings</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Members can reserve this amenity</p>
              </div>
              <ToggleSwitch checked={quickAddBookable} onChange={setQuickAddBookable} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 mb-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Operating Hours (optional)
                </label>
                <input
                  type="text"
                  value={quickAddOperatingHours}
                  onChange={(e) => setQuickAddOperatingHours(e.target.value)}
                  placeholder="e.g. 9am - 9pm"
                  className="glass-input w-full"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Operating Days (optional)
                </label>
                <div className="flex items-center gap-1 flex-wrap mt-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        if (quickAddOperatingDays.includes(day)) {
                          setQuickAddOperatingDays(quickAddOperatingDays.filter(d => d !== day));
                        } else {
                          setQuickAddOperatingDays([...quickAddOperatingDays, day]);
                        }
                      }}
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${quickAddOperatingDays.includes(day) ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'}`}
                    >
                      {day[0]}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setQuickAddOperatingDays(quickAddOperatingDays.length === 7 ? [] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])}
                    className="ml-2 rounded-lg text-xs font-semibold px-2 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                  >
                    Everyday
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleQuickAddConfirm}
                disabled={adding}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:-translate-y-0.5 hover:shadow-emerald-500/40 disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {adding ? <><Loader2 className="h-4 w-4 animate-spin" />Adding…</> : <><Plus className="h-4 w-4" />Confirm Add</>}
              </button>
              <button
                type="button"
                onClick={() => setQuickAddPending(null)}
                className="rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Custom add form */}
      <div className="glass-card rounded-2xl border border-slate-200 bg-white/60 p-6 dark:border-white/10 dark:bg-white/5">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 shadow-md shadow-blue-500/20">
            <Info className="h-5 w-5 text-white" />
          </span>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Custom Amenity</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Add something unique to your society</p>
          </div>
        </div>

        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Name <span className="text-red-400">*</span>
              </label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rooftop Garden" required className="glass-input w-full" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Capacity (optional)
              </label>
              <input type="number" min="1" value={capacity} onChange={(e) => setCapacity(e.target.value)}
                placeholder="Max people" className="glass-input w-full" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Operating Hours (optional)
              </label>
              <input
                type="text"
                value={operatingHours}
                onChange={(e) => setOperatingHours(e.target.value)}
                placeholder="e.g. 9am - 9pm"
                className="glass-input w-full"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Operating Days (optional)
              </label>
              <div className="flex items-center gap-1 flex-wrap mt-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      if (operatingDays.includes(day)) {
                        setOperatingDays(operatingDays.filter(d => d !== day));
                      } else {
                        setOperatingDays([...operatingDays, day]);
                      }
                    }}
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${operatingDays.includes(day) ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'}`}
                  >
                    {day[0]}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setOperatingDays(operatingDays.length === 7 ? [] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])}
                  className="ml-2 rounded-lg text-xs font-semibold px-2 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                >
                  Everyday
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Description (optional)
            </label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              rows={2} placeholder="Brief description…" className="glass-input w-full resize-none" />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-white/10 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Allow bookings</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Members can reserve this amenity</p>
            </div>
            <ToggleSwitch checked={isBookable} onChange={setIsBookable} />
          </div>

          <button type="submit" disabled={adding}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-purple-500/25 transition-all hover:-translate-y-0.5 hover:shadow-purple-500/40 disabled:opacity-60 disabled:hover:translate-y-0">
            {adding ? <><Loader2 className="h-4 w-4 animate-spin" />Adding…</> : <><Plus className="h-4 w-4" />Add Amenity</>}
          </button>
        </form>
      </div>
    </div>
  );
}
