import { useCallback, useEffect, useState } from 'react';
import { Trash2, Loader2, Settings2, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import AddAmenityForm from './AddAmenityForm';

export default function AdminAmenityManager({ communityId }) {
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  const fetchAmenities = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/community/${communityId}/amenities`);
      setAmenities(data);
    } catch (err) {
      // If 400 (non-society), silently ignore — parent already gates
      if (err.response?.status !== 400) {
        toast.error(err.response?.data?.message || 'Failed to load amenities');
      }
    } finally {
      setLoading(false);
    }
  }, [communityId]);

  useEffect(() => { fetchAmenities(); }, [fetchAmenities]);

  const handleDelete = async (amenityId) => {
    setDeletingId(amenityId);
    try {
      const { data } = await api.delete(`/community/${communityId}/amenities/${amenityId}`);
      setAmenities((prev) => prev.filter((a) => a._id !== amenityId));
      const cancelled = data.cancelledBookings || 0;
      toast.success(`Amenity deleted${cancelled > 0 ? ` · ${cancelled} booking(s) cancelled` : ''}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete amenity');
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Add amenity toggle */}
      <button
        type="button"
        onClick={() => setFormOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-4 py-2.5 text-sm font-bold text-purple-700 transition-all hover:bg-purple-100 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-300 dark:hover:bg-purple-500/20"
      >
        <Settings2 className="h-4 w-4" />
        {formOpen ? 'Hide form' : 'Add New Amenity'}
        {formOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {formOpen && (
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 p-5 animate-fade-in">
          <AddAmenityForm
            communityId={communityId}
            onAdded={(newAmenity) => {
              setAmenities((prev) => [...prev, newAmenity]);
              setFormOpen(false);
            }}
          />
        </div>
      )}

      {/* Amenity list */}
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-slate-400 py-4">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading amenities…
        </div>
      ) : amenities.length === 0 ? (
        <div className="rounded-2xl border-dashed border-2 border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/3 py-10 text-center">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No amenities added yet.</p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Use the button above to add your first one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {amenities.map((amenity) => (
            <div key={amenity._id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 px-4 py-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{amenity.name}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    amenity.isBookable
                      ? 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300'
                      : 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400'
                  }`}>
                    {amenity.isBookable ? 'Bookable' : 'View only'}
                  </span>
                  {amenity.capacity != null && (
                    <span className="text-xs text-slate-400">Cap: {amenity.capacity}</span>
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

              {/* Confirm delete inline */}
              {confirmDeleteId === amenity._id ? (
                <div className="flex items-center gap-2 shrink-0">
                  <p className="text-xs text-red-500 dark:text-red-400 font-medium hidden sm:block">
                    Delete + cancel bookings?
                  </p>
                  <button
                    type="button"
                    onClick={() => handleDelete(amenity._id)}
                    disabled={deletingId === amenity._id}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60"
                  >
                    {deletingId === amenity._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Yes, delete'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(null)}
                    className="rounded-lg border border-slate-200 dark:border-white/10 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(amenity._id)}
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-400/20 dark:bg-transparent dark:text-red-300 dark:hover:bg-red-500/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
