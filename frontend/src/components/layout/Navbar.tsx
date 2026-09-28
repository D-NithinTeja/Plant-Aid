import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Sprout,
  Scan,
  LayoutDashboard,
  History,
  BookOpen,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  WifiOff,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  // Ping backend API status
  useEffect(() => {
    const checkApi = async () => {
      try {
        await api.get('/');
        setBackendOnline(true);
      } catch {
        setBackendOnline(false);
      }
    };
    checkApi();
    const interval = setInterval(checkApi, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, requiresAuth: true },
    { name: 'Live Scan', path: '/scan', icon: Scan, requiresAuth: true },
    { name: 'History', path: '/history', icon: History, requiresAuth: true },
    { name: 'Disease Guide', path: '/guide', icon: BookOpen, requiresAuth: false },
  ];

  const visibleLinks = navLinks.filter((link) => !link.requiresAuth || isAuthenticated);

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-agri-800 border border-agri-700 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <Sprout className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-lg text-slate-900 tracking-tight">Plant-Aid</span>
                <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-agri-100 text-agri-800 border border-agri-200">
                  Field Vision
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium hidden sm:block">Groundnut Pathology Suite</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {visibleLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-agri-50 text-agri-800 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-agri-700' : 'text-slate-400'}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Header Section */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Backend connectivity indicator */}
            <div
              className={`flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${
                backendOnline === true
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                  : backendOnline === false
                  ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                  : 'bg-slate-100 text-slate-500'
              }`}
              title={backendOnline ? 'FastAPI Backend Online' : 'FastAPI Backend Unreachable'}
            >
              {backendOnline === true ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono">API Live</span>
                </>
              ) : backendOnline === false ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-rose-500" />
                  <span className="font-mono">API Offline</span>
                </>
              ) : (
                <span>Checking...</span>
              )}
            </div>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-agri-100 text-agri-800 flex items-center justify-center text-xs font-bold">
                    {user?.user_name ? user.user_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="max-w-[120px] truncate">{user?.user_name || 'Account'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4 text-slate-600 hover:text-rose-700" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/auth"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth?mode=register"
                  className="px-4 py-2 text-sm font-medium text-white bg-agri-700 hover:bg-agri-800 rounded-lg shadow-sm transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 touch-target flex items-center justify-center"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-1">
            {visibleLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium ${
                    isActive ? 'bg-agri-50 text-agri-800 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-agri-700' : 'text-slate-400'}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-slate-200">
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  <UserIcon className="w-5 h-5 text-slate-400" />
                  <span className="font-medium">{user?.user_name || 'My Profile'}</span>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-rose-600 hover:bg-rose-50 font-medium"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center py-2.5 px-4 rounded-lg border border-slate-300 text-slate-700 font-medium text-center"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth?mode=register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center py-2.5 px-4 rounded-lg bg-agri-700 text-white font-medium text-center shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
