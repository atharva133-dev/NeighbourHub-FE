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
    { label: 'Board', to: '/', icon: Home },
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
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-[#0f0f1a]/80 transition-colors duration-500">
      <div className="w-full px-8 flex items-center justify-between h-16">
          {/* Logo + Community Name */}
          <Link to="/" className="flex flex-shrink-0 items-center gap-3 group min-w-[180px] mr-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg shadow-purple-500/20 overflow-hidden transition-transform duration-300 group-hover:scale-105">
              <img src="/logo.png" alt="NH Logo" className="h-full w-full object-cover" />
            </div>
            <div className="hidden sm:block">
              <p className="text-base font-bold text-slate-900 dark:text-white transition-colors duration-500">NeighbourHub</p>
              {communityName ? (
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">{communityName}</p>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">Community board</p>
              )}
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md shadow-purple-500/25'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex w-56 min-w-[200px] flex-1">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-purple-500" />
              <input
                type="text"
                placeholder="Search notices, events..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-10 py-2 text-sm text-slate-900 placeholder-slate-400 transition-all duration-300 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-slate-500 dark:focus:border-purple-500/50 dark:focus:bg-white/10 dark:focus:ring-purple-500/20"
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
                className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all duration-300 hover:bg-slate-50 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:shadow-none dark:hover:bg-white/10 dark:hover:text-white"
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
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5 shadow-sm transition-all duration-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:shadow-none dark:hover:bg-white/10"
              >
                <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 text-sm font-bold text-white shadow-inner">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    user?.name?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <span className="hidden sm:block text-sm font-medium text-slate-700 dark:text-slate-300 pr-1 transition-colors">
                  {user?.name?.split(' ')[0] || 'User'}
                </span>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0f0f1a]/95 dark:shadow-2xl dark:shadow-black/40 animate-fade-in z-50">
                  <div className="border-b border-slate-100 dark:border-white/10 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                    {communityName && (
                      <p className="mt-1 text-xs font-medium text-purple-600 dark:text-purple-300">{communityName}</p>
                    )}
                  </div>
                  <div className="py-2">
                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    {isSociety && (
                      <Link
                        to="/my-bookings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                      >
                        <Dumbbell className="h-4 w-4" />
                        My Bookings
                      </Link>
                    )}
                    <Link
                      to="/settings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                    <Link
                      to="/community"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                    >
                      <ArrowLeftRight className="h-4 w-4" />
                      Switch Community
                    </Link>
                    {user?.role === 'admin' && (
                      <>
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                        >
                          <Shield className="h-4 w-4" />
                          Dashboard
                        </Link>
                        <Link
                          to="/admin/users"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                        >
                          <Users className="h-4 w-4" />
                          Users
                        </Link>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
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
              className="lg:hidden rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:shadow-none dark:hover:bg-white/10 dark:hover:text-white"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div className="lg:hidden fixed inset-0 top-16 z-40 bg-slate-900/30 backdrop-blur-sm dark:bg-black/40"
            onClick={() => setMobileMenuOpen(false)} />
          {/* Menu panel */}
          <div className="lg:hidden relative z-50 border-t border-slate-200 bg-white/95 backdrop-blur-xl dark:border-white/10 dark:bg-[#0f0f1a]/95 mobile-menu-slide">
            <div className="px-4 py-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Search notices, events..." value={searchQuery} onChange={handleSearchChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-10 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-slate-500 dark:focus:border-purple-500/50 dark:focus:bg-white/10" />
              </div>

              <nav className="space-y-1">
                {navItems.map(({ label, to, icon: Icon }) => (
                  <NavLink key={to} to={to} onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md shadow-purple-500/20'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white'
                      }`
                    }>
                    <Icon className="h-5 w-5" />
                    {label}
                  </NavLink>
                ))}
              </nav>

              <div className="border-t border-slate-200 pt-4 space-y-1 dark:border-white/10">
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white">
                  <User className="h-5 w-5" />Profile
                </Link>
                {isSociety && (
                  <Link to="/my-bookings" onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white">
                    <Dumbbell className="h-5 w-5" />My Bookings
                  </Link>
                )}
                <Link to="/settings" onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white">
                  <Settings className="h-5 w-5" />Settings
                </Link>
                <Link to="/community" onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white">
                  <ArrowLeftRight className="h-5 w-5" />Switch Community
                </Link>
                {activeCommunityId && (
                  <button type="button"
                    onClick={() => { setMobileMenuOpen(false); setGuidelinesOpen(true); }}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white">
                    <BookOpen className="h-5 w-5" />Guidelines
                  </button>
                )}
                <button type="button" onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300">
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
