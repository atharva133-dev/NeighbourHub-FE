import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from './Skeletons';

export default function ProtectedRoute({ children }) {
  const { user, loading, activeCommunityId } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader />;
  }

  if (!user) return <Navigate to="/login" replace />;

  // If authenticated but no community selected, redirect to community picker
  // (unless already on the /community page)
  if (!activeCommunityId && location.pathname !== '/community') {
    return <Navigate to="/community" replace />;
  }

  return children;
}
