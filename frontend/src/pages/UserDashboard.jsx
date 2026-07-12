import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { Layout } from '../components/Layout';
import { Calendar, Clock, AlertTriangle, BookMarked, ArrowRight, RotateCcw, CheckCircle, RefreshCw } from 'lucide-react';

const UserDashboard = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [renewLoadingId, setRenewLoadingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchActiveRentals = async () => {
    try {
      const res = await API.get('rentals/my-dashboard/');
      setRentals(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch active rentals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchActiveRentals(); }, []);

  const handleReturn = async (rentalId) => {
    setSuccessMsg(''); setError('');
    setActionLoadingId(rentalId);
    try {
      const res = await API.post(`rentals/${rentalId}/return/`);
      setSuccessMsg(res.data.message);
      await fetchActiveRentals();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to return book.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRenew = async (rentalId) => {
    setSuccessMsg(''); setError('');
    setRenewLoadingId(rentalId);
    try {
      const res = await API.post(`rentals/${rentalId}/renew/`);
      setSuccessMsg(res.data.message);
      await fetchActiveRentals();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to renew book.');
    } finally {
      setRenewLoadingId(null);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white m-0">My Dashboard</h2>
          <p className="text-slate-400 text-sm mt-1">Manage your active loans and return books</p>
        </div>
        <Link to="/books" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold transition-all shadow-md shadow-indigo-600/10 shrink-0">
          Browse Catalogue <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-300 text-sm">
          <CheckCircle className="h-5 w-5 shrink-0" /><span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-300 text-sm">
          <AlertTriangle className="h-5 w-5 shrink-0" /><span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 animate-pulse">
              <div className="h-28 bg-slate-900 rounded-xl"></div>
              <div className="h-4 bg-slate-800 rounded w-2/3"></div>
              <div className="h-3 bg-slate-800 rounded w-1/2"></div>
              <div className="h-10 bg-slate-800 rounded-xl w-full mt-4"></div>
            </div>
          ))}
        </div>
      ) : rentals.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl flex flex-col items-center justify-center text-center max-w-xl mx-auto border border-slate-800/80">
          <div className="bg-slate-900 p-4 rounded-2xl text-slate-500 border border-slate-800 mb-4">
            <BookMarked className="h-10 w-10 text-indigo-400/60" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No borrowed books</h3>
          <p className="text-slate-400 text-sm max-w-sm mb-6 leading-relaxed">
            You do not currently have any active rentals. Explore our catalogue to borrow books!
          </p>
          <Link to="/books" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold transition-all text-sm">
            Browse Books
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rentals.map((rental) => {
            const isOverdue = rental.is_overdue;
            const daysLeft = rental.days_remaining;
            const isDueSoon = !isOverdue && daysLeft <= 3;

            return (
              <div key={rental.id} className={`glass-panel rounded-2xl overflow-hidden border flex flex-col transition-all duration-300 ${
                isOverdue
                  ? 'border-rose-500/30 hover:border-rose-500/50 shadow-lg shadow-rose-950/20'
                  : isDueSoon
                  ? 'border-amber-500/30 hover:border-amber-500/50'
                  : 'border-slate-800 hover:border-slate-700/80'
              }`}>

                {/* Book Cover */}
                {rental.book.image_url && (
                  <div className="h-28 w-full relative overflow-hidden shrink-0 border-b border-slate-900/50">
                    <img src={rental.book.image_url} alt={rental.book.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-4 mb-2.5">
                      <span className="inline-flex px-2 py-0.5 rounded bg-slate-900 text-[10px] font-bold text-indigo-400 border border-slate-800 uppercase tracking-wider">
                        {rental.book.genre}
                      </span>
                      {isOverdue ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <AlertTriangle className="h-3 w-3" /> OVERDUE
                        </span>
                      ) : isDueSoon ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
                          <Clock className="h-3 w-3" /> Due Soon
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <Clock className="h-3 w-3" /> Active
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-white line-clamp-1 mb-0.5">{rental.book.title}</h3>
                    <p className="text-xs text-slate-400 mb-4">by {rental.book.author}</p>
                  </div>

                  <div className="space-y-2 border-t border-slate-900 pt-4">
                    <div className="flex items-center gap-2.5 text-xs text-slate-400">
                      <Calendar className="h-4 w-4 shrink-0 text-slate-500" />
                      <span>Borrowed: {new Date(rental.borrow_date).toLocaleDateString()}</span>
                    </div>
                    <div className={`flex items-center gap-2.5 text-xs font-medium ${isOverdue ? 'text-rose-400' : isDueSoon ? 'text-amber-400' : 'text-slate-300'}`}>
                      <Clock className={`h-4 w-4 shrink-0 ${isOverdue ? 'text-rose-500' : isDueSoon ? 'text-amber-500' : 'text-indigo-400'}`} />
                      <span>
                        Due: {new Date(rental.due_date).toLocaleDateString()}
                        {' '}({isOverdue ? 'Overdue' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`})
                      </span>
                    </div>

                    {/* Renewal info */}
                    <div className="flex items-center gap-2.5 text-xs text-slate-500">
                      <RefreshCw className="h-3.5 w-3.5 shrink-0" />
                      <span>Renewals used: {rental.renewal_count} / 2</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 bg-slate-900/40 border-t border-slate-800/60 mt-auto space-y-2">
                  {/* Renew Button — show when not overdue and can renew */}
                  {rental.can_renew && (
                    <button
                      onClick={() => handleRenew(rental.id)}
                      disabled={renewLoadingId === rental.id}
                      className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-600 hover:text-white disabled:opacity-50 transition-all"
                    >
                      {renewLoadingId === rental.id ? (
                        <><div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-indigo-300 border-t-transparent" /> Renewing...</>
                      ) : (
                        <><RefreshCw className="h-3.5 w-3.5" /> Renew Loan (+14 days)</>
                      )}
                    </button>
                  )}

                  {/* Return Button */}
                  <button
                    onClick={() => handleReturn(rental.id)}
                    disabled={actionLoadingId === rental.id}
                    className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/80 disabled:opacity-50 transition-all"
                  >
                    {actionLoadingId === rental.id ? (
                      <><div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-transparent" /> Returning...</>
                    ) : (
                      <><RotateCcw className="h-3.5 w-3.5" /> Return Book</>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
};

export default UserDashboard;