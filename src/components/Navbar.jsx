import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { 
  Search, Menu, X, User, Settings, LogOut, Calendar,
  Search as SearchIcon, AlertTriangle, Home, Users, Shield,
  ArrowLeftRight, BookOpen, Dumbbell,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import GuidelinesModal from './GuidelinesModal';

export default function Navbar({ onSearchChange }) {
  const { user, logout, activeCommunityId } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);
  const userDropdownRef = useRef(null);

  const communityName =
    typeof user?.communityId === 'object'
      ? user?.communityId?.name
      : null;

  const communityType =
    typeof user?.communityId === 'object'
      ? user?.communityId?.type
      : user?.communityType;
  const isSociety = communityType === 'society';

  const handleLogout = () => {
    logout();
    navigate('/login');
    setUserDropdownOpen(false);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearchChange) {
      onSearchChange(query);
    }
  };

  const navItems = [
    { label: 'Board', to: '/board', icon: Home },
    { label: 'Events', to: '/events', icon: Calendar },
    { label: 'Lost & Found', to: '/lost-found', icon: SearchIcon },
    { label: 'Emergency', to: '/emergency', icon: AlertTriangle },
    ...(isSociety ? [{ label: 'Amenities', to: '/amenities', icon: Dumbbell }] : []),
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 border-b backdrop-blur-xl transition-colors duration-500" style={{ borderColor: '#ddd7ca', background: 'rgba(246,245,239,0.9)' }}>
      <div className="w-full px-8 flex items-center justify-between h-16">
          {/* Logo + Community Name */}
          <Link to="/board" className="flex flex-shrink-0 items-center gap-3 group min-w-[180px] mr-6">
            <div className="relative h-12 w-12 overflow-hidden rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-105">
              <img
                src="/logo2.png"
                alt="NeighbourHub Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <p className="text-xl font-extrabold tracking-tight" style={{ color: '#20261F' }}>
                Neighbour<span className="bg-gradient-to-r from-[#6E8F73] via-[#C97B5A] to-[#A8442F] bg-clip-text text-transparent">Hub</span>
              </p>
              {communityName ? (
                <p className="text-xs font-semibold" style={{ color: '#6E8F73' }}>{communityName}</p>
              ) : (
                <p className="text-xs" style={{ color: 'rgba(32,38,31,0.7)' }}>Community board</p>
              )}
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1.5">
            {navItems.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'text-white shadow-sm'
                      : 'hover:bg-[#fdfaf4]'
                  }`
                }
                style={(({ isActive }) => ({
                  background: isActive ? 'linear-gradient(135deg, #c97b5a, #ad6247)' : undefined,
                  color: isActive ? undefined : '#656f5f'
                }))}
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex w-56 min-w-[200px] flex-1 mr-6">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors" style={{ color: '#656f5f' }} />
              <input
                type="text"
                placeholder="Search notices, events..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full rounded-xl border px-10 py-2 text-sm placeholder transition-all duration-350 focus:outline-none focus:ring-2"
                style={{ borderColor: '#ddd7ca', background: '#fdfaf4', color: '#20261f', placeholderColor: '#8B7B6B', focusRingColor: 'rgba(201,123,90,0.3)', focusBorderColor: '#c97b5a', focusBackground: '#f6f5ef' }}
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Switch Community */}
            {activeCommunityId && (
              <button
                type="button"
                onClick={() => navigate('/community')}
                title="Switch Community"
                className="hidden sm:flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium shadow-sm transition-all duration-300"
                style={{ borderColor: '#ddd7ca', background: '#fdfaf4', color: '#656f5f' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f6f5ef'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#fdfaf4'}
              >
                <ArrowLeftRight className="h-4 w-4" />
                <span className="hidden lg:inline">Switch</span>
              </button>
            )}

            <div className="flex items-center">
              <NotificationBell />
            </div>

            {/* User Avatar Dropdown */}
            <div ref={userDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 rounded-xl border px-2 py-1.5 shadow-sm transition-all duration-300"
                style={{ borderColor: '#ddd7ca', background: '#fdfaf4' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f6f5ef'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#fdfaf4'}
              >
                <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg text-sm font-bold text-white shadow-inner" style={{ background: 'linear-gradient(135deg, #c97b5a, #ad6247)' }}>
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    user?.name?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <span className="hidden sm:block text-sm font-semibold pr-1 transition-colors" style={{ color: '#656f5f' }}>
                  {user?.name?.split(' ')[0] || 'User'}
                </span>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border shadow-xl backdrop-blur-xl animate-fade-in z-50" style={{ borderColor: '#ddd7ca', background: '#fdfaf4' }}>
                  <div className="px-4 py-3" style={{ borderBottom: '1px solid #ddd7ca' }}>
                    <p className="text-sm font-bold" style={{ color: '#20261f' }}>{user?.name}</p>
                    <p className="text-xs" style={{ color: '#656f5f' }}>{user?.email}</p>
                    {communityName && (
                      <p className="mt-1 text-xs font-semibold" style={{ color: '#c97b5a' }}>{communityName}</p>
                    )}
                  </div>
                  <div className="py-1.5">
                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                      style={{ color: '#656f5f' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f6f5ef'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    {isSociety && (
                      <Link
                        to="/my-bookings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                        style={{ color: '#656f5f' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f6f5ef'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <Dumbbell className="h-4 w-4" />
                        My Bookings
                      </Link>
                    )}
                    <Link
                      to="/settings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                      style={{ color: '#656f5f' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f6f5ef'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                    <Link
                      to="/community"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                      style={{ color: '#656f5f' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f6f5ef'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <ArrowLeftRight className="h-4 w-4" />
                      Switch Community
                    </Link>
                    {user?.role === 'admin' && (
                      <>
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                          style={{ color: '#656f5f' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#f6f5ef'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <Shield className="h-4 w-4" />
                          Dashboard
                        </Link>
                        <Link
                          to="/admin/users"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                          style={{ color: '#656f5f' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#f6f5ef'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <Users className="h-4 w-4" />
                          Users
                        </Link>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                      style={{ color: '#c97b5a' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(201,123,90,0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden rounded-xl border p-2 shadow-sm transition-colors"
              style={{ borderColor: '#ddd7ca', background: '#fdfaf4', color: '#656f5f' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f6f5ef'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#fdfaf4'}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div className="lg:hidden fixed inset-0 top-16 z-40 backdrop-blur-xs"
            style={{ background: 'rgba(32,38,31,0.2)' }}
            onClick={() => setMobileMenuOpen(false)} />
          {/* Menu panel */}
          <div className="lg:hidden relative z-50 border-t backdrop-blur-xl mobile-menu-slide" style={{ borderColor: '#ddd7ca', background: 'rgba(246,245,239,0.95)' }}>
            <div className="px-4 py-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: '#656f5f' }} />
                <input type="text" placeholder="Search notices, events..." value={searchQuery} onChange={handleSearchChange}
                  className="w-full rounded-xl border px-10 py-2.5 text-sm outline-none focus:ring-2"
                  style={{ borderColor: '#ddd7ca', background: '#fdfaf4', color: '#20261f', placeholderColor: '#8B7B6B', focusRingColor: 'rgba(201,123,90,0.3)', focusBorderColor: '#c97b5a', focusBackground: '#f6f5ef' }}
                />
              </div>

              <nav className="space-y-1">
                {navItems.map(({ label, to, icon: Icon }) => (
                  <NavLink key={to} to={to} onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-150 ${
                        isActive ? 'text-white shadow-sm' : 'hover:bg-[#fdfaf4]'
                      }`
                    }
                    style={(({ isActive }) => ({
                      background: isActive ? 'linear-gradient(135deg, #c97b5a, #ad6247)' : undefined,
                      color: isActive ? undefined : '#656f5f'
                    }))}
                    >
                    <Icon className="h-5 w-5" />
                    {label}
                  </NavLink>
                ))}
              </nav>

              <div className="border-t pt-4 space-y-1" style={{ borderColor: '#ddd7ca' }}>
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gain-3 rounded-xl px-4 py-3 text-sm transition-colors"
                  style={{ color: '#656f5f' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f6f5ef'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <User className="h-5 w-5" />Profile
                </Link>
                {isSociety && (
                  <Link to="/my-bookings" onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors"
                    style={{ color: '#656f5f' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f6f5ef'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <Dumbbell className="h-5 w-5" />My Bookings
                  </Link>
                )}
                <Link to="/settings" onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors"
                  style={{ color: '#656f5f' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f6f5ef'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <Settings className="h-5 w-5" />Settings
                </Link>
                <Link to="/community" onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors"
                  style={{ color: '#656f5f' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f6f5ef'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <ArrowLeftRight className="h-5 w-5" />Switch Community
                </Link>
                {activeCommunityId && (
                  <button type="button"
                    onClick={() => { setMobileMenuOpen(false); setGuidelinesOpen(true); }}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors"
                    style={{ color: '#656f5f' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f6f5ef'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <BookOpen className="h-5 w-5" />Guidelines
                  </button>
                )}
                <button type="button" onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors"
                  style={{ color: '#c97b5a' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(201,123,90,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <LogOut className="h-5 w-5" />Logout
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Guidelines modal */}
      {guidelinesOpen && (
        <GuidelinesModal
          communityId={activeCommunityId}
          onClose={() => setGuidelinesOpen(false)}
        />
      )}
    </nav>
  );
}
