import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

function formatDate(date) {
  return new Date(date).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function NotificationBell() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const { data } = await api.get('/notifications/unread-count');
      setUnreadCount(data.count || 0);
    } catch {
      setUnreadCount(0);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchUnreadCount();
  }, [user]);

  useEffect(() => {
    if (!socket || !user) return;

    const handleNotification = ({ recipientId, notification }) => {
      if (recipientId !== user.id) return;
      toast(notification.message);
      setUnreadCount((count) => count + 1);
      setNotifications((prev) => {
        if (prev.some((item) => item._id === notification._id)) return prev;
        return [notification, ...prev];
      });
    };

    socket.on('notification:created', handleNotification);
    return () => socket.off('notification:created', handleNotification);
  }, [socket, user]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleToggle = async () => {
    try {
      const nextOpen = !open;
      setOpen(nextOpen);
      if (nextOpen) {
        await fetchNotifications();
      }
    } catch {
      setOpen(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setUnreadCount(0);
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      );
      toast.success('Notifications marked as read');
    } catch {
      await fetchUnreadCount();
      toast.error('Failed to update notifications');
    }
  };

  if (!user) return null;

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Notifications"
        className="relative rounded-xl border p-2 shadow-sm transition-all duration-300 hover:-translate-y-0.5"
        style={{ borderColor: '#ddd7ca', background: '#fdfaf4', color: '#656f5f' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#f6f5ef'; e.currentTarget.style.color = '#20261f'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = '#fdfaf4'; e.currentTarget.style.color = '#656f5f'; }}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold leading-none text-white" style={{ background: '#c97b5a' }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-3 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border shadow-xl backdrop-blur-xl animate-fade-in z-50"
          style={{ borderColor: '#ddd7ca', background: '#fdfaf4' }}
        >
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #ddd7ca' }}>
            <h3 className="text-sm font-semibold" style={{ color: '#20261f' }}>Notifications</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs font-semibold transition-colors"
                style={{ color: '#c97b5a' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#ad6247')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#c97b5a')}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="space-y-3 p-4">
                <div className="skeleton h-4 w-11/12" />
                <div className="skeleton h-4 w-8/12" />
                <div className="skeleton h-4 w-10/12" />
              </div>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm" style={{ color: '#656f5f' }}>
                No notifications yet.
              </p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className="px-4 py-3 last:border-0 transition-colors"
                  style={{
                    borderBottom: '1px solid #ddd7ca',
                    background: notification.read ? 'transparent' : 'rgba(201,123,90,0.06)',
                  }}
                >
                  <p className="text-sm" style={{ color: '#20261f' }}>{notification.message}</p>
                  <p className="mt-1 text-xs" style={{ color: '#8B7B6B' }}>
                    {formatDate(notification.createdAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
