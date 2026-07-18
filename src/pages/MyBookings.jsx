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

  useEffect(() => {
    if (!socket) return;
    const handle = ({ bookingId }) =>
      setBookings((prev) => prev.map((b) => b._id === bookingId ? { ...b, status: 'cancelled' } : b));
    socket.on('amenity:booking-cancelled', handle);
    return () => socket.off('amenity:booking-cancelled', handle);
  }, [socket]);

  const handleCancel = async (bookingId) => {
    setCancellingId(bookingId);
    try {
      await api.delete(`/bookings/${bookingId}`);
      setBookings((prev) => prev.map((b) => b._id === bookingId ? { ...b, status: 'cancelled' } : b));
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
      {/* Page header */}
      <div className="mb-6 flex items-center gap-4 rounded-[20px] border border-[#e2e8f0] bg-white px-5 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0f172a] shadow-sm">
          <CalendarDays className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#0f172a]" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>My Bookings</h1>
          <p className="text-xs text-[#64748b]">Your amenity booking history</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#475569]" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center border-dashed border-2 border-[#e2e8f0] bg-white py-20 text-center rounded-[20px]">
          <CalendarDays className="h-12 w-12 text-[#cbd5e1] mb-4" />
          <p className="text-lg font-semibold text-[#0f172a]">No bookings yet</p>
          <p className="mt-1 text-sm text-[#64748b]">Visit the Amenities page to make a booking.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {confirmed.length > 0 && (
            <section>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-[#64748b]">
                Upcoming ({confirmed.length})
              </h2>
              <div className="space-y-3">
                {confirmed.map((booking) => (
                  <BookingRow key={booking._id} booking={booking} onCancel={handleCancel} cancellingId={cancellingId} />
                ))}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-[#64748b]">
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
    <div className={`rounded-[20px] border border-[#e2e8f0] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all ${cancelled ? 'opacity-60' : 'hover:shadow-md hover:border-[#cbd5e1]'}`}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-[#0f172a]">{booking.amenityName}</p>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
              booking.status === 'confirmed'
                ? 'bg-[#ecfdf5] text-[#047857] border-[#d1fae5]'
                : 'bg-[#f1f5f9] text-[#475569] border-[#e2e8f0]'
            }`}>
              {booking.status === 'confirmed'
                ? <CheckCircle2 className="h-3 w-3" />
                : <XCircle className="h-3 w-3" />
              }
              {booking.status}
            </span>
          </div>
          {booking.community?.name && (
            <p className="mt-0.5 text-xs text-[#64748b]">{booking.community.name}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#64748b]">
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
            className="shrink-0 flex items-center gap-1.5 rounded-xl border border-[#fca5a5] bg-[#fef2f2] px-3 py-1.5 text-xs font-semibold text-[#b91c1c] transition hover:bg-[#fee2e2] disabled:opacity-60"
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
