import { useCallback, useEffect, useState } from 'react';
import { X, Loader2, CalendarDays, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useSocket } from '../../context/SocketContext';

function formatDateDisplay(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

export default function BookingModal({ amenity, communityId, onClose, onBooked }) {
  const { socket } = useSocket();
  const today = new Date().toISOString().split('T')[0];

  // Fix 3: subdocuments may serialize _id or id — guard both
  const amenityId = amenity._id || amenity.id;

  const [date, setDate] = useState(today);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingBookings, setExistingBookings] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Fetch existing confirmed bookings for the selected date
  const fetchSlots = useCallback(() => {
    if (!date || !amenityId) return;
    setLoadingSlots(true);
    api.get(`/community/${communityId}/amenities/${amenityId}/bookings?date=${date}`)
      .then(({ data }) => setExistingBookings(data))
      .catch(() => setExistingBookings([]))
      .finally(() => setLoadingSlots(false));
  }, [date, communityId, amenityId]);

  useEffect(() => { fetchSlots(); }, [fetchSlots]);

  // Fix 1 & 2: socket live refresh — when another user books the same amenity on the
  // same date while this modal is open, refresh the slots list automatically
  useEffect(() => {
    if (!socket) return;

    const handleBooked = (payload) => {
      // Only refresh if the event is for the same amenity and selected date
      if (payload.amenityId !== amenityId) return;
      const eventDate = new Date(payload.date).toISOString().split('T')[0];
      if (eventDate !== date) return;
      fetchSlots();
    };

    const handleCancelled = () => {
      // A cancellation frees up a slot — refresh if relevant date is shown
      fetchSlots();
    };

    socket.on('amenity:booked', handleBooked);
    socket.on('amenity:booking-cancelled', handleCancelled);

    return () => {
      socket.off('amenity:booked', handleBooked);
      socket.off('amenity:booking-cancelled', handleCancelled);
    };
  }, [socket, amenityId, date, fetchSlots]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!date || !startTime || !endTime) {
      setError('Date, start time, and end time are all required.');
      return;
    }
    if (startTime >= endTime) {
      setError('Start time must be before end time.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post(
        `/community/${communityId}/amenities/${amenityId}/bookings`,
        { date, startTime, endTime }
      );
      toast.success('Booking confirmed!');
      onBooked?.(data);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Booking failed';
      // Fix: show 409 conflict as an inline error, not a toast — user must see it clearly
      if (err.response?.status === 409) {
        setError(msg);
        fetchSlots(); // refresh slots so user can see what conflicts
      } else {
        toast.error(msg);
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-label="Close" />

      <div className="modal-content glass-card relative z-10 w-full max-w-md rounded-2xl p-6 dark:bg-[#13131f]">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Book {amenity.name}</h2>
            {amenity.capacity != null && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Capacity: {amenity.capacity}</p>
            )}
          </div>
          <button type="button" onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-400/20 dark:bg-red-500/10">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
            <p className="text-sm font-medium text-red-600 dark:text-red-300">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <CalendarDays className="h-3.5 w-3.5 text-[#6E8F73]" />
              Date
            </label>
            <input type="date" value={date} min={today}
              onChange={(e) => { setDate(e.target.value); setError(''); }}
              required className="glass-input w-full" />
          </div>

          {/* Time range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <Clock className="h-3.5 w-3.5 text-[#6E8F73]" />
                Start
              </label>
              <input type="time" value={startTime}
                onChange={(e) => { setStartTime(e.target.value); setError(''); }}
                required className="glass-input w-full" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">End</label>
              <input type="time" value={endTime}
                onChange={(e) => { setEndTime(e.target.value); setError(''); }}
                required className="glass-input w-full" />
            </div>
          </div>

          {/* Existing bookings for selected date */}
          <div>
            <p className="mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Booked slots on {formatDateDisplay(date)}
            </p>
            {loadingSlots ? (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…
              </div>
            ) : existingBookings.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500">No bookings yet — all slots are free.</p>
            ) : (
              <div className="space-y-1.5 max-h-28 overflow-y-auto">
                {existingBookings.map((b) => (
                  <div key={b._id} className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-1.5">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                      {b.startTime} – {b.endTime}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{b.bookedBy?.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6E8F73] to-[#C97B5A] py-2.5 text-sm font-bold text-white shadow-lg shadow-[#6E8F73]/25 transition-all hover:-translate-y-0.5 hover:shadow-[#6E8F73]/40 disabled:opacity-60 disabled:hover:translate-y-0">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Booking…</> : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}
