import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Menu, Moon, Sun, BookOpen, ArrowLeftRight, Shield, Users, ChevronDown } from 'lucide-react';
import { useAppearance } from '../context/AppearanceContext';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import GuidelinesModal from './GuidelinesModal';

const PAGE_TITLES = {
  '/board': 'Community Board',
  '/events': 'Events',
  '/lost-found': 'Lost & Found',
  '/emergency': 'Emergency',
  '/amenities': 'Amenities',
  '/my-bookings': 'My Bookings',
  '/visitors': 'Visitor Passes',
  '/maintenance': 'Maintenance Requests',
  '/marketplace': 'Community Marketplace',
  '/chat': 'Community Chat & DMs',
  '/payments': 'Payments & Dues',
  '/profile': 'Profile',
  '/settings': 'Settings',
  '/admin': 'Admin Dashboard',
  '/admin/users': 'Manage Users',
  '/community': 'Communities',
};

export default function Topbar({ onSearchChange, onMobileMenuOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, activeCommunityId } = useAuth();
  const { appearance, setAppearance } = useAppearance();
  const [searchValue, setSearchValue] = useState('');
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const adminMenuRef = useRef(null);

  const pageTitle = PAGE_TITLES[location.pathname] || 'NeighbourHub';

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
    onSearchChange?.(e.target.value);
  };

  const toggleDark = () => {
    setAppearance({ theme: appearance.theme === 'dark' ? 'light' : 'dark' });
  };

  // Close admin menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (adminMenuRef.current && !adminMenuRef.current.contains(e.target)) {
        setAdminMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="topbar">
        {/* Mobile hamburger */}
        <button
          type="button"
          className="topbar-hamburger lg:hidden"
          onClick={onMobileMenuOpen}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Page title */}
        <div className="topbar-title">
          <h1 className="topbar-page-title">{pageTitle}</h1>
        </div>

        {/* Search — only show on board */}
        {location.pathname === '/board' && (
          <div className="topbar-search-wrap">
            <Search className="topbar-search-icon" />
            <input
              type="text"
              value={searchValue}
              onChange={handleSearch}
              placeholder="Search notices, events…"
              className="topbar-search-input"
            />
          </div>
        )}

        {/* Right actions */}
        <div className="topbar-actions">
          {activeCommunityId && (
            <>
              {/* Guidelines Button */}
              <button
                type="button"
                className="topbar-action-btn"
                onClick={() => setGuidelinesOpen(true)}
                title="View Community Guidelines"
              >
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Guidelines</span>
              </button>

              {/* Switch Community Button */}
              <button
                type="button"
                className="topbar-action-btn"
                onClick={() => navigate('/community')}
                title="Switch Community"
              >
                <ArrowLeftRight className="h-4 w-4" />
                <span className="hidden sm:inline">Switch</span>
              </button>
            </>
          )}

          {/* Admin Control Dropdown (Navbar Only) */}
          {user?.role === 'admin' && (
            <div style={{ position: 'relative' }} ref={adminMenuRef}>
              <button
                type="button"
                className="topbar-action-btn"
                onClick={() => setAdminMenuOpen((v) => !v)}
                title="Admin Controls"
              >
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>

              {adminMenuOpen && (
                <div className="topbar-admin-dropdown animate-fade-in">
                  <button
                    type="button"
                    className="topbar-admin-dropdown-item"
                    onClick={() => { navigate('/admin'); setAdminMenuOpen(false); }}
                  >
                    <Shield className="h-4 w-4" />
                    <span>Dashboard</span>
                  </button>
                  <button
                    type="button"
                    className="topbar-admin-dropdown-item"
                    onClick={() => { navigate('/admin/users'); setAdminMenuOpen(false); }}
                  >
                    <Users className="h-4 w-4" />
                    <span>Manage Users</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Dark mode toggle */}
          <button
            type="button"
            className="topbar-icon-btn"
            onClick={toggleDark}
            title={appearance.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {appearance.theme === 'dark'
              ? <Sun className="h-[18px] w-[18px]" />
              : <Moon className="h-[18px] w-[18px]" />
            }
          </button>

          {/* Notification bell */}
          <NotificationBell />
        </div>
      </header>

      {/* Guidelines Modal */}
      {guidelinesOpen && (
        <GuidelinesModal
          communityId={activeCommunityId}
          onClose={() => setGuidelinesOpen(false)}
        />
      )}
    </>
  );
}
