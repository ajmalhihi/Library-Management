import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Layout } from '../components/Layout';
import { History as HistoryIcon, Calendar, CheckCircle2, Clock, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const History = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await API.get('rentals/history/');
        setRentals(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load borrowing history.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <Layout>
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold tracking-tight text-white m-0">My History</h2>
        <p className="text-slate-400 text-sm mt-1">Audit log of your full library borrowing activities</p>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm animate-fade-in">
          {error}
        </div>
      )}

      {/* Loading State */}
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
        <div className="glass-panel p-12 rounded-2xl flex flex-col items-center justify-center text-center max-w-xl mx-auto border border-slate-800/80">
          <div className="bg-slate-900 p-4 rounded-2xl text-slate-500 border border-slate-800 mb-4 select-none">
            <HistoryIcon className="h-10 w-10 text-indigo-400/60" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No borrowing records</h3>
          <p className="text-slate-400 text-sm max-w-sm mb-6 leading-relaxed">
            Your loan log is completely empty. Start exploring books in our repository and rent a copy!
          </p>
          <Link
            to="/books"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all text-sm shadow-md shadow-indigo-600/10"
          >
            Browse Catalog
          </Link>
        </div>
      ) : (
        /* History Log Table card */
        <div className="glass-panel rounded-2xl border border-slate-800/85 overflow-hidden shadow-xl shadow-slate-950/50">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse select-none">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-6">Book Description</th>
                  <th className="py-4 px-6">Date Borrowed</th>
                  <th className="py-4 px-6">Date Due</th>
                  <th className="py-4 px-6">Date Returned</th>
                  <th className="py-4 px-6">Status Badge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/80 text-sm">
                {rentals.map((rental) => {
                  const borrowDate = new Date(rental.borrow_date).toLocaleDateString();
                  const dueDate = new Date(rental.due_date).toLocaleDateString();
                  const returnDate = rental.return_date 
                    ? new Date(rental.return_date).toLocaleDateString() 
                    : null;

                  return (
                    <tr 
                      key={rental.id} 
                      className="hover:bg-slate-900/40 transition-colors group"
                    >
                      {/* Book detail */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <Link 
                            to={`/books/${rental.book.id}`}
                            className="font-bold text-slate-200 hover:text-indigo-400 transition-colors inline-flex items-center gap-1 w-fit"
                          >
                            {rental.book.title}
                            <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500" />
                          </Link>
                          <span className="text-xs text-slate-400 font-medium">by {rental.book.author}</span>
                        </div>
                      </td>

                      {/* Borrow date */}
                      <td className="py-4 px-6 text-slate-300 font-medium">
                        <span className="inline-flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-500 shrink-0" />
                          {borrowDate}
                        </span>
                      </td>

                      {/* Due date */}
                      <td className="py-4 px-6 text-slate-300 font-medium">{dueDate}</td>

                      {/* Return date */}
                      <td className="py-4 px-6 text-slate-300 font-medium">
                        {returnDate ? (
                          <span className="inline-flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-500 shrink-0" />
                            {returnDate}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic font-semibold">Not Returned Yet</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 font-medium">
                        {rental.is_returned ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="h-3 w-3" /> Returned
                          </span>
                        ) : rental.is_overdue ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <AlertTriangle className="h-3 w-3" /> Overdue
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            <Clock className="h-3 w-3" /> Borrowed
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

export default History;
