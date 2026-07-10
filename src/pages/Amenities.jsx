import { useCallback, useEffect, useState } from 'react';
import { Building2, Dumbbell, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Layout from '../components/Layout';
import AmenityCard from '../components/amenities/AmenityCard';
import BookingModal from '../components/amenities/BookingModal';

export default function Amenities() {
  const { user, activeCommunityId } = useAuth();
  const { socket } = useSocket();

  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingAmenity, setBookingAmenity] = useState(null);

  // Fix 4: derive communityType FIRST — before any API call
  const communityType = typeof user?.communityId === 'object'
    ? user?.communityId?.type
    : user?.communityType;

  const isSociety = communityType === 'society';

  // Fix 4: only fetch if community is actually a society — no wasteful 400 API call
  const fetchAmenities = useCallback(async () => {
    if (!activeCommunityId || !isSociety) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data } = await api.get(`/community/${activeCommunityId}/amenities`);
      setAmenities(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load amenities');
    } finally {
      setLoading(false);
    }
  }, [activeCommunityId, isSociety]);

  useEffect(() => { fetchAmenities(); }, [fetchAmenities]);

  // Fix 2: socket listeners that actually do something useful at page level.
  // The BookingModal handles its own per-date slot refresh.
  // At page level we only need to handle amenity deletion cascades from admin —
  // which isn't emitted currently, so these are kept minimal and properly cleaned up.
  useEffect(() => {
    if (!socket || !isSociety) return;

    const handleBooked = () => {
      // Slot-level updates are handled inside BookingModal.
      // No page-level state change needed.
    };

    const handleCancelled = () => {
      // Slot-level updates are handled inside BookingModal.
      // No page-level state change needed.
    };

    socket.on('amenity:booked', handleBooked);
    socket.on('amenity:booking-cancelled', handleCancelled);

    return () => {
      socket.off('amenity:booked', handleBooked);
      socket.off('amenity:booking-cancelled', handleCancelled);
    };
  }, [socket, isSociety]);

  // Fix 4: show "not available" immediately without hitting the API
  if (communityType && !isSociety) {
    return (
      <Layout>
        <div className="glass-card flex flex-col items-center justify-center rounded-2xl px-6 py-24 text-center border border-slate-200 bg-white/50 dark:border-white/10 dark:bg-white/5">
          <Building2 className="h-12 w-12 text-slate-400 mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Not available</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Amenities & Booking is only available for Society communities.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6 glass-card p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 shadow-md">
            <Dumbbell className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Amenities</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Book shared facilities in your society</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      ) : amenities.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center border-dashed border-2 border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/3 py-20 text-center rounded-2xl">
          <Dumbbell className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-lg font-semibold text-slate-600 dark:text-slate-300">No amenities yet</p>
          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
            No amenities have been added yet for this community.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {amenities.map((amenity, index) => (
            <div key={amenity._id} className="animate-fade-in" style={{ animationDelay: `${index * 40}ms` }}>
              <AmenityCard amenity={amenity} onBook={setBookingAmenity} />
            </div>
          ))}
        </div>
      )}

      {bookingAmenity && (
        <BookingModal
          amenity={bookingAmenity}
          communityId={activeCommunityId}
          onClose={() => setBookingAmenity(null)}
          onBooked={() => setBookingAmenity(null)}
        />
      )}
    </Layout>
  );
}
