import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { Layout } from '../components/Layout';
import { 
  Library, 
  Users, 
  BookMarked, 
  ShieldAlert, 
  Calendar, 
  Mail, 
  ArrowRight,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_books: 0,
    total_users: 0,
    currently_borrowed: 0,
    overdue_rentals_count: 0
  });
  const [overdueRentals, setOverdueRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      // Run concurrent requests
      const [statsRes, overdueRes] = await Promise.all([
        API.get('admin/dashboard/'),
        API.get('admin/rentals/overdue/')
      ]);
      setStats(statsRes.data);
      setOverdueRentals(overdueRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch admin dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <Layout>
      {/* Page Header */}
      <div className="mb-8 select-none">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
          <span className="text-[10px] tracking-widest font-extrabold uppercase text-amber-500 bg-amber-500/10 px-2 py-0.5 border border-amber-500/20 rounded">
            Administrative Control Panel
          </span>
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight text-white m-0 mt-2">Executive Summary</h2>
        <p className="text-slate-400 text-sm mt-1">Real-time status overview of catalog assets, member rentals, and alerts</p>
      </div>

      {/* API Error Box */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-3 animate-fade-in">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-8 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-slate-900 rounded-2xl border border-slate-800"></div>
            ))}
          </div>
          <div className="h-64 bg-slate-900 rounded-2xl border border-slate-800"></div>
        </div>
      ) : (
        <>
          {/* ==========================================
              METRIC CARDS GRID
              ========================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 select-none">
            
            {/* Total Books */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between hover:border-slate-700/80 transition-all">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Books</p>
                <h3 className="text-3xl font-extrabold text-white">{stats.total_books}</h3>
              </div>
              <div className="bg-indigo-500/10 p-3.5 rounded-xl border border-indigo-500/20 text-indigo-400">
                <Library className="h-6 w-6" />
              </div>
            </div>

            {/* Total Active Users */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between hover:border-slate-700/80 transition-all">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Members</p>
                <h3 className="text-3xl font-extrabold text-white">{stats.total_users}</h3>
              </div>
              <div className="bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-500/20 text-emerald-400">
                <Users className="h-6 w-6" />
              </div>
            </div>

            {/* Currently Borrowed */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between hover:border-slate-700/80 transition-all">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Loans</p>
                <h3 className="text-3xl font-extrabold text-white">{stats.currently_borrowed}</h3>
              </div>
              <div className="bg-sky-500/10 p-3.5 rounded-xl border border-sky-500/20 text-sky-400">
                <BookMarked className="h-6 w-6" />
              </div>
            </div>

            {/* Overdue Rentals */}
            <div className={`glass-panel p-6 rounded-2xl border flex items-center justify-between transition-all ${
              stats.overdue_rentals_count > 0 
                ? 'border-rose-500/20 hover:border-rose-500/35 shadow-lg shadow-rose-950/5' 
                : 'border-slate-800 hover:border-slate-700/80'
            }`}>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overdue Alerts</p>
                <h3 className={`text-3xl font-extrabold ${
                  stats.overdue_rentals_count > 0 ? 'text-rose-400' : 'text-white'
                }`}>{stats.overdue_rentals_count}</h3>
              </div>
              <div className={`p-3.5 rounded-xl border transition-all ${
                stats.overdue_rentals_count > 0 
                  ? 'bg-rose-500/15 border-rose-500/20 text-rose-400' 
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}>
                <ShieldAlert className="h-6 w-6" />
              </div>
            </div>

          </div>

          {/* ==========================================
              URGENT OVERDUE RENTALS SECTION
              ========================================== */}
          <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl shadow-slate-950/40">
            {/* Box Header */}
            <div className="p-6 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between select-none">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-lg border ${
                  overdueRentals.length > 0 ? 'bg-rose-500/10 border-rose-500/25 text-rose-400' : 'bg-slate-850 border-slate-800 text-slate-400'
                }`}>
                  <ShieldAlert className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white m-0">Critical Action Items: Overdue Rental Log</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Rentals that have breached their 14-day return agreements</p>
                </div>
              </div>

              <Link
                to="/admin/rentals"
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 transition-colors"
              >
                Inspect All Loans <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* List */}
            {overdueRentals.length === 0 ? (
              /* Success/Empty State */
              <div className="p-12 text-center select-none flex flex-col items-center justify-center max-w-sm mx-auto">
                <div className="bg-emerald-500/15 p-3 rounded-full border border-emerald-500/25 text-emerald-400 mb-3">
                  <TrendingUp className="h-6 w-6 rotate-45" />
                </div>
                <h4 className="text-sm font-bold text-white">All Clear!</h4>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">
                  There are currently no overdue books in the library system. Member agreements are operating smoothly.
                </p>
              </div>
            ) : (
              /* Urgent List Rows */
              <div className="divide-y divide-slate-900/60">
                {overdueRentals.map((rental) => {
                  const daysOverdue = Math.ceil(
                    (new Date().getTime() - new Date(rental.due_date).getTime()) / (1000 * 3600 * 24)
                  );

                  return (
                    <div 
                      key={rental.id} 
                      className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-slate-900/30 transition-colors border-l-4 border-l-rose-500 bg-rose-500/[0.01]"
                    >
                      {/* Left: Book & Borrower details */}
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-200 truncate m-0">{rental.book.title}</h4>
                          <span className="shrink-0 text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/25 px-2 py-0.5 rounded">
                            {daysOverdue} Day{daysOverdue !== 1 ? 's' : ''} Overdue
                          </span>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-medium select-text">
                          <span className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                            Borrower: {rental.user.name}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                            Email: {rental.user.email}
                          </span>
                        </div>
                      </div>

                      {/* Right: Dates detail */}
                      <div className="flex sm:flex-col items-center sm:items-end gap-x-4 gap-y-1 text-xs text-slate-400 select-none shrink-0 font-medium">
                        <span className="flex items-center gap-1 bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800 text-[11px]">
                          <Calendar className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                          Due Date: {new Date(rental.due_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </Layout>
  );
};

export default AdminDashboard;
