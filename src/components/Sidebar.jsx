import { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Home, Calendar, Search, AlertTriangle, Dumbbell,
  User, Settings, LogOut, Shield, Users, ArrowLeftRight,
  BookOpen, ChevronUp, X, Car, Wrench, ShoppingBag, MessageSquare, CreditCard,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GuidelinesModal from './GuidelinesModal';

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const { user, logout, activeCommunityId } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);
  const userMenuRef = useRef(null);

  const communityName =
    typeof user?.communityId === 'object' ? user?.communityId?.name : null;
  const communityType =
    typeof user?.communityId === 'object'
      ? user?.communityId?.type
      : user?.communityType;
  const isSociety = communityType === 'society';

  const handleLogout = () => {
    logout();
    navigate('/login');
    setUserMenuOpen(false);
  };

  // Close mobile sidebar when clicking outside user menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    onMobileClose?.();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const navLinkClass = ({ isActive }) =>
    `sidebar-nav-item${isActive ? ' active' : ''}`;

  const navLinkStyle = ({ isActive }) =>
    isActive
      ? {
          background: 'linear-gradient(135deg, #c97b5a, #ad6247)',
          color: '#fff',
          boxShadow: '0 4px 14px rgba(201,123,90,0.28)',
        }
      : {};

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(32,38,31,0.35)', backdropFilter: 'blur(4px)' }}
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`sidebar${mobileOpen ? ' mobile-open' : ''}`}
        aria-label="Main navigation"
      >
        {/* ── Logo ── */}
        <div className="sidebar-logo-area">
          <Link to="/board" className="sidebar-logo-link">
            <div className="sidebar-logo-img">
              <img
                src="/logo2.png"
                alt="NeighbourHub logo"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement.textContent = '🏘️';
                }}
              />
            </div>
            <div>
              <p className="sidebar-logo-text">
                Neighbour<span>Hub</span>
              </p>
              <p className="sidebar-community-name" style={!communityName ? { opacity: 0.5 } : {}}>
                {communityName || 'Community board'}
              </p>
            </div>
          </Link>

          {/* Mobile close button */}
          <button
            type="button"
            className="sidebar-mobile-close lg:hidden"
            onClick={onMobileClose}
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Nav Links ── */}
        <nav className="sidebar-nav" role="navigation" aria-label="App navigation">

          <span className="sidebar-section-label">Main</span>

          <NavLink to="/board" end className={navLinkClass} style={navLinkStyle}>
            <Home className="sidebar-nav-icon" />
            <span>Board</span>
          </NavLink>

          <NavLink to="/events" className={navLinkClass} style={navLinkStyle}>
            <Calendar className="sidebar-nav-icon" />
            <span>Events</span>
          </NavLink>

          <NavLink to="/lost-found" className={navLinkClass} style={navLinkStyle}>
            <Search className="sidebar-nav-icon" />
            <span>Lost &amp; Found</span>
          </NavLink>

          <NavLink to="/emergency" className={navLinkClass} style={navLinkStyle}>
            <AlertTriangle className="sidebar-nav-icon" />
            <span>Emergency</span>
          </NavLink>

          {isSociety && (
            <NavLink to="/amenities" className={navLinkClass} style={navLinkStyle}>
              <Dumbbell className="sidebar-nav-icon" />
              <span>Amenities</span>
            </NavLink>
          )}

          {isSociety && (
            <NavLink to="/my-bookings" className={navLinkClass} style={navLinkStyle}>
              <BookOpen className="sidebar-nav-icon" />
              <span>My Bookings</span>
            </NavLink>
          )}

          <div className="sidebar-divider" />
          <span className="sidebar-section-label">New Features</span>

          <NavLink to="/visitors" className={navLinkClass} style={navLinkStyle}>
            <Car className="sidebar-nav-icon" />
            <span>Visitors</span>
          </NavLink>

          <NavLink to="/maintenance" className={navLinkClass} style={navLinkStyle}>
            <Wrench className="sidebar-nav-icon" />
            <span>Maintenance</span>
          </NavLink>

          <NavLink to="/marketplace" className={navLinkClass} style={navLinkStyle}>
            <ShoppingBag className="sidebar-nav-icon" />
            <span>Marketplace</span>
          </NavLink>

          <NavLink to="/chat" className={navLinkClass} style={navLinkStyle}>
            <MessageSquare className="sidebar-nav-icon" />
            <span>Chat &amp; Messages</span>
          </NavLink>

          <NavLink to="/payments" className={navLinkClass} style={navLinkStyle}>
            <CreditCard className="sidebar-nav-icon" />
            <span>Payments &amp; Dues</span>
          </NavLink>

          <div className="sidebar-divider" />
          <span className="sidebar-section-label">Account</span>

          <NavLink to="/profile" className={navLinkClass} style={navLinkStyle}>
            <User className="sidebar-nav-icon" />
            <span>Profile</span>
          </NavLink>

          <NavLink to="/settings" className={navLinkClass} style={navLinkStyle}>
            <Settings className="sidebar-nav-icon" />
            <span>Settings</span>
          </NavLink>

        </nav>

        {/* ── User card ── */}
        <div className="sidebar-user-area" ref={userMenuRef}>
          {/* Popover menu */}
          {userMenuOpen && (
            <div className="sidebar-user-popover animate-fade-in">
              <button
                type="button"
                className="sidebar-user-popover-item"
                onClick={() => { navigate('/profile'); setUserMenuOpen(false); }}
              >
                <User className="h-4 w-4" />
                View Profile
              </button>
              <button
                type="button"
                className="sidebar-user-popover-item"
                onClick={() => { navigate('/settings'); setUserMenuOpen(false); }}
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>
              <div className="sidebar-user-popover-divider" />
              <button
                type="button"
                className="sidebar-user-popover-item logout"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}

          <button
            type="button"
            className="sidebar-user-card"
            onClick={() => setUserMenuOpen((v) => !v)}
            aria-haspopup="true"
            aria-expanded={userMenuOpen}
          >
            <div className="sidebar-user-avatar">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="h-full w-full object-cover rounded-[10px]" />
              ) : (
                user?.name?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <div className="sidebar-user-info">
              <p className="sidebar-user-name">{user?.name?.split(' ')[0] || 'User'}</p>
              <p className="sidebar-user-role">
                {user?.role === 'admin' ? 'Admin' : 'Resident'}
              </p>
            </div>
            <ChevronUp
              className="sidebar-user-chevron"
              style={{ transform: userMenuOpen ? 'rotate(0deg)' : 'rotate(180deg)' }}
            />
          </button>
        </div>
      </aside>
    </>
  );
}
