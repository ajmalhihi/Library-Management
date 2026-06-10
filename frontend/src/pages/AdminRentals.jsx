import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Layout } from '../components/Layout';
import { 
  BookMarked, 
  Clock, 
  ShieldAlert, 
  Calendar, 
  Mail, 
  User, 
  CheckCircle,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';

const AdminRentals = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL, ACTIVE, OVERDUE

  const fetchRentals = async () => {
    setLoading(true);
    try {
      let endpoint = 'admin/rentals/';
      if (filter === 'OVERDUE') {
        endpoint = 'admin/rentals/overdue/';
      }
      const res = await API.get(endpoint);
      
      let data = res.data;
      // If client-side filtering for ACTIVE is needed
      if (filter === 'ACTIVE') {
        data = data.filter(rental => !rental.is_returned);
      }
      
      setRentals(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to retrieve global rental transactions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, [filter]);

  return (
    <Layout>
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8 select-none">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white m-0">Library Rentals Log</h2>
          <p className="text-slate-400 text-sm mt-1">Audit active book loans, returned logs, and overdue violations</p>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-3 gap-2 bg-slate-900/60 p-1 border border-slate-800 rounded-xl max-w-sm w-full shrink-0">
          <button
            onClick={() => setFilter('ALL')}
            className={`py-2 rounded-lg text-xs font-bold transition-all ${
              filter === 'ALL'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-205'
            }`}
          >
            All Loans
          </button>
          <button
            onClick={() => setFilter('ACTIVE')}
            className={`py-2 rounded-lg text-xs font-bold transition-all ${
              filter === 'ACTIVE'
                ? 'bg-emerald-600/90 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-205'
            }`}
          >
            Active Loans
          </button>
          <button
            onClick={() => setFilter('OVERDUE')}
            className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              filter === 'OVERDUE'
                ? 'bg-rose-600/90 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-205'
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" /> Overdue
          </button>
        </div>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm animate-fade-in">
          {error}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden animate-pulse">
          <div className="h-12 bg-slate-900 border-b border-slate-800"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 border-b border-slate-900 space-y-3">
              <div className="h-4 bg-slate-900 rounded w-1/3"></div>
              <div className="h-3 bg-slate-900 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : rentals.length === 0 ? (
        /* Empty State */
        <div className="glass-panel p-12 rounded-2xl flex flex-col items-center justify-center text-center max-w-md mx-auto border border-slate-800/80 select-none">
          <div className="bg-slate-900 p-4 rounded-2xl text-slate-500 border border-slate-800 mb-4">
            <BookMarked className="h-8 w-8 text-indigo-400/60" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No rentals logged</h3>
          <p className="text-slate-400 text-sm mb-4">
            There are currently no transaction records matching the "{filter.toLowerCase()}" criteria.
          </p>
        </div>
      ) : (
        /* Rentals log table */
        <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl shadow-slate-950/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400 select-none">
                  <th className="py-4 px-6">Book Title</th>
                  <th className="py-4 px-6">Member Profile</th>
                  <th className="py-4 px-6">Borrow / Due Date</th>
                  <th className="py-4 px-6">Date Returned</th>
                  <th className="py-4 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/80 text-sm">
                {rentals.map((rental) => {
                  const borrowDate = new Date(rental.borrow_date).toLocaleDateString();
                  const dueDate = new Date(rental.due_date).toLocaleDateString();
                  const returnDate = rental.return_date 
                    ? new Date(rental.return_date).toLocaleDateString() 
                    : null;
                  
                  const isOverdue = rental.is_overdue;

                  return (
                    <tr 
                      key={rental.id} 
                      className={`transition-colors ${
                        isOverdue 
                          ? 'border-l-4 border-l-rose-500/80 bg-rose-500/[0.005] hover:bg-rose-500/[0.02]' 
                          : 'hover:bg-slate-900/40'
                      }`}
                    >
                      {/* Book detail */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-200">{rental.book.title}</span>
                          <span className="text-xs text-slate-500">by {rental.book.author}</span>
                        </div>
                      </td>

                      {/* User detail */}
                      <td className="py-4 px-6 select-text">
                        <div className="flex flex-col font-medium">
                          <span className="inline-flex items-center gap-1.5 text-slate-200">
                            <User className="h-3.5 w-3.5 text-slate-500" />
                            {rental.user.name}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                            <Mail className="h-3.5 w-3.5 text-slate-500" />
                            {rental.user.email}
                          </span>
                        </div>
                      </td>

                      {/* Borrow / Due dates */}
                      <td className="py-4 px-6 font-medium text-slate-300">
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                            {borrowDate} (Start)
                          </span>
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                            isOverdue ? 'text-rose-400' : 'text-slate-400'
                          }`}>
                            <Clock className={`h-3.5 w-3.5 shrink-0 ${isOverdue ? 'text-rose-500' : 'text-slate-500'}`} />
                            {dueDate} (Due)
                          </span>
                        </div>
                      </td>

                      {/* Returned date */}
                      <td className="py-4 px-6 text-slate-300 font-medium select-none">
                        {returnDate ? (
                          <span className="inline-flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-500 shrink-0" />
                            {returnDate}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic font-semibold">Outstanding Loan</span>
                        )}
                      </td>

                      {/* Status badge */}
                      <td className="py-4 px-6 font-medium select-none">
                        {rental.is_returned ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle className="h-3 w-3" /> Returned
                          </span>
                        ) : isOverdue ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <AlertTriangle className="h-3 w-3" /> Overdue
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            <HelpCircle className="h-3 w-3" /> Active Loan
                          </span>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminRentals;
