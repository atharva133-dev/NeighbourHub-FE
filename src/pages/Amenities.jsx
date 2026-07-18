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

  const communityType = typeof user?.communityId === 'object'
    ? user?.communityId?.type
    : user?.communityType;
  const isSociety = communityType === 'society';

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

  useEffect(() => {
    if (!socket || !isSociety) return;
    const handleBooked = () => {};
    const handleCancelled = () => {};
    socket.on('amenity:booked', handleBooked);
    socket.on('amenity:booking-cancelled', handleCancelled);
    return () => {
      socket.off('amenity:booked', handleBooked);
      socket.off('amenity:booking-cancelled', handleCancelled);
    };
  }, [socket, isSociety]);

  if (communityType && !isSociety) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center rounded-[20px] border border-[#e2e8f0] bg-white px-6 py-24 text-center shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <Building2 className="h-12 w-12 text-[#94a3b8] mb-4" />
          <h2 className="text-xl font-bold text-[#0f172a]">Not available</h2>
          <p className="mt-2 text-sm text-[#64748b]">
            Amenities & Booking is only available for Society communities.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Page header */}
      <div className="mb-6 flex items-center gap-4 rounded-[20px] border border-[#e2e8f0] bg-white px-5 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0f172a] shadow-sm">
          <Dumbbell className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#0f172a]" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>Amenities</h1>
          <p className="text-xs text-[#64748b]">Book shared facilities in your society</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#475569]" />
        </div>
      ) : amenities.length === 0 ? (
        <div className="flex flex-col items-center justify-center border-dashed border-2 border-[#e2e8f0] bg-white py-20 text-center rounded-[20px]">
          <Dumbbell className="h-12 w-12 text-[#cbd5e1] mb-4" />
          <p className="text-lg font-semibold text-[#0f172a]">No amenities yet</p>
          <p className="mt-1 text-sm text-[#64748b]">No amenities have been added for this community.</p>
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
