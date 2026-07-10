import { useCallback, useEffect, useState } from 'react';
import { CalendarDays, Clock, Loader2, XCircle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useSocket } from '../context/SocketContext';
import Layout from '../components/Layout';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function MyBookings() {
  const { socket } = useSocket();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/bookings/my');
      setBookings(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  // Socket: if any of my bookings gets cancelled externally, update UI
  useEffect(() => {
    if (!socket) return;
    const handle = ({ bookingId }) => {
      setBookings((prev) =>
        prev.map((b) => b._id === bookingId ? { ...b, status: 'cancelled' } : b)
      );
    };
    socket.on('amenity:booking-cancelled', handle);
    return () => socket.off('amenity:booking-cancelled', handle);
  }, [socket]);

  const handleCancel = async (bookingId) => {
    setCancellingId(bookingId);
    try {
      await api.delete(`/bookings/${bookingId}`);
      setBookings((prev) =>
        prev.map((b) => b._id === bookingId ? { ...b, status: 'cancelled' } : b)
      );
      toast.success('Booking cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  const confirmed = bookings.filter((b) => b.status === 'confirmed');
  const past = bookings.filter((b) => b.status === 'cancelled');

  return (
    <Layout>
      <div className="mb-6 glass-card p-5 rounded-2xl">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">My Bookings</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your amenity booking history</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center border-dashed border-2 border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/3 py-20 text-center rounded-2xl">
          <CalendarDays className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-lg font-semibold text-slate-600 dark:text-slate-300">No bookings yet</p>
          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
            Visit the Amenities page to make a booking.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {confirmed.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Upcoming ({confirmed.length})
              </h2>
              <div className="space-y-3">
                {confirmed.map((booking) => (
                  <BookingRow
                    key={booking._id}
                    booking={booking}
                    onCancel={handleCancel}
                    cancellingId={cancellingId}
                  />
                ))}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Cancelled ({past.length})
              </h2>
              <div className="space-y-3">
                {past.map((booking) => (
                  <BookingRow key={booking._id} booking={booking} cancelled />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </Layout>
  );
}

function BookingRow({ booking, onCancel, cancellingId, cancelled }) {
  return (
    <div className={`glass-card p-4 rounded-2xl transition-all ${cancelled ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-slate-900 dark:text-white">{booking.amenityName}</p>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
              booking.status === 'confirmed'
                ? 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300'
                : 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400'
            }`}>
              {booking.status === 'confirmed'
                ? <CheckCircle2 className="h-3 w-3" />
                : <XCircle className="h-3 w-3" />
              }
              {booking.status}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {booking.community?.name}
          </p>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDate(booking.date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {booking.startTime} – {booking.endTime}
            </span>
          </div>
        </div>

        {!cancelled && onCancel && (
          <button
            type="button"
            onClick={() => onCancel(booking._id)}
            disabled={cancellingId === booking._id}
            className="shrink-0 flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-60 dark:border-red-400/20 dark:bg-transparent dark:text-red-300 dark:hover:bg-red-500/10"
          >
            {cancellingId === booking._id
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <XCircle className="h-3.5 w-3.5" />
            }
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
