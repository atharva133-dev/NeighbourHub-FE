import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { AppearanceProvider } from './context/AppearanceContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Events from './pages/Events';
import LostFound from './pages/LostFound';
import Emergency from './pages/Emergency';
import LoginNew from './pages/LoginNew';
import Profile from './pages/Profile';
import NoticeDetail from './pages/NoticeDetail';
import Settings from './pages/Settings';
import Community from './pages/Community';
import Amenities from './pages/Amenities';
import MyBookings from './pages/MyBookings';

export default function App() {
  return (
    <AuthProvider>
      <AppearanceProvider>
        <SocketProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<LoginNew />} />
              <Route path="/register" element={<LoginNew initialMode="signup" />} />
              <Route
                path="/community"
                element={
                  <ProtectedRoute>
                    <Community />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/board"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events"
                element={
                  <ProtectedRoute>
                    <Events />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lost-found"
                element={
                  <ProtectedRoute>
                    <LostFound />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/emergency"
                element={
                  <ProtectedRoute>
                    <Emergency />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/notice/:id" element={<ProtectedRoute><NoticeDetail /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
              <Route
                path="/amenities"
                element={<ProtectedRoute><Amenities /></ProtectedRoute>}
              />
              <Route
                path="/my-bookings"
                element={<ProtectedRoute><MyBookings /></ProtectedRoute>}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster
              position="top-center"
              gutter={12}
              toastOptions={{
                duration: 2800,
                style: {
                  background: '#FCFBF6',
                  border: '1px solid rgba(32,38,31,0.12)',
                  color: '#20261F',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  fontWeight: '500',
                  fontSize: '14px',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  minWidth: '280px',
                  maxWidth: '400px',
                },
                success: {
                  style: {
                    background: '#FCFBF6',
                    border: '1px solid rgba(110,143,115,0.3)',
                    color: '#20261F',
                  },
                  iconTheme: {
                    primary: '#6E8F73',
                    secondary: '#FCFBF6',
                  },
                },
                error: {
                  style: {
                    background: '#FCFBF6',
                    border: '1px solid rgba(168,68,47,0.3)',
                    color: '#20261F',
                  },
                  iconTheme: {
                    primary: '#A8442F',
                    secondary: '#FCFBF6',
                  },
                },
              }}
            />
          </BrowserRouter>
        </SocketProvider>
      </AppearanceProvider>
    </AuthProvider>
  );
}
