import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  BookOpen, 
  LayoutDashboard, 
  BookMarked, 
  History, 
  LogOut, 
  Menu, 
  X, 
  Users, 
  Library,
  ShieldCheck,
  User as UserIcon
} from 'lucide-react';

export const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const getNavLinks = () => {
    if (user?.role === 'ADMIN') {
      return [
        { name: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Manage Books', path: '/admin/books', icon: Library },
        { name: 'All Rentals', path: '/admin/rentals', icon: BookMarked },
        { name: 'Users Directory', path: '/admin/users', icon: Users },
      ];
    } else {
      return [
        { name: 'My Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Books Catalogue', path: '/books', icon: BookOpen },
        { name: 'My History', path: '/history', icon: History },
        { name: 'My Profile', path: '/profile', icon: UserIcon },
      ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <div className="min-h-screen bg-transparent flex flex-col md:flex-row text-slate-100">

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 glass-panel border-r border-slate-800 shrink-0 select-none">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
          <div className="bg-gradient-to-tr from-fuchsia-600 to-indigo-600 p-2 rounded-lg text-white shadow-md shadow-indigo-600/30">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white m-0 leading-tight">Athena</h1>
            <p className="text-xs text-indigo-400 font-medium">Library Manager</p>
          </div>
        </div>

        {/* User Mini Profile */}
        <div className="p-4 mx-4 my-6 bg-slate-900/60 border border-slate-800/50 rounded-xl flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/30">
            <span className="text-lg font-bold text-indigo-400">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="truncate">
            <h4 className="text-sm font-semibold text-slate-200 truncate">{user?.name}</h4>
            <div className="flex items-center gap-1 mt-0.5">
              {user?.role === 'ADMIN' ? (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <ShieldCheck className="h-2.5 w-2.5" /> ADMIN
                </span>
              ) : (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  USER
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-indigo-600/25 border border-indigo-500/35'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer Logout */}
        <div className="p-4 border-t border-slate-800/80">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 border border-transparent hover:border-rose-500/20 transition-all duration-200"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Logout Session
          </button>
        </div>
      </aside>

      {/* MOBILE NAVIGATION BAR */}
      <div className="md:hidden glass-panel border-b border-slate-800 w-full flex items-center justify-between px-6 py-4 select-none shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-fuchsia-600 to-indigo-600 p-1.5 rounded text-white">
            <BookOpen className="h-5 w-5" />
          </div>
          <h1 className="text-md font-bold text-white tracking-tight m-0">Athena</h1>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded transition-all"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Navigation Drawer */}
      <div className={`md:hidden fixed top-0 bottom-0 left-0 w-64 bg-slate-950 border-r border-slate-800 z-50 flex flex-col transition-transform duration-300 transform ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-400" />
            <span className="font-bold text-white">Athena Navigation</span>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 mx-4 my-4 bg-slate-900/60 border border-slate-800 rounded-lg flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <span className="text-sm font-bold text-indigo-400">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="truncate">
            <h4 className="text-xs font-semibold text-slate-200 truncate">{user?.name}</h4>
            <span className="text-[9px] uppercase font-bold text-indigo-400">{user?.role}</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto bg-transparent p-6 md:p-8 animate-fade-in">
        {children}
      </main>
    </div>
  );
};