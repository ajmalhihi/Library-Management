import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Layout } from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import { ArrowLeft, BookOpen, AlertCircle, CheckCircle, HelpCircle, ShieldAlert, Sparkles } from 'lucide-react';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // States
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [borrowLoading, setBorrowLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const res = await API.get(`books/${id}/`);
        setBook(res.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to retrieve book details.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [id]);

  const handleBorrow = async () => {
    setError('');
    setSuccess('');
    setBorrowLoading(true);

    try {
      const res = await API.post(`books/${id}/borrow/`);
      setSuccess(res.data.message);
      
      // Update book status in local state
      setBook((prev) => ({ ...prev, is_available: false }));
      
      // Redirect to dashboard after brief delay to let user view success message
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to borrow book.');
    } finally {
      setBorrowLoading(false);
    }
  };

  return (
    <Layout>
      {/* Back navigation */}
      <div className="mb-6 select-none">
        <Link
          to="/books"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Catalogue
        </Link>
      </div>

      {/* Notifications */}
      {success && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-300 text-sm animate-fade-in">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-300 text-sm animate-fade-in">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6 animate-pulse max-w-4xl mx-auto">
          <div className="h-8 bg-slate-900 rounded w-1/3"></div>
          <div className="h-4 bg-slate-900 rounded w-1/4"></div>
          <div className="h-24 bg-slate-900 rounded w-full"></div>
          <div className="h-12 bg-slate-900 rounded-xl w-1/3"></div>
        </div>
      ) : book ? (
        /* Detailed Layout Card */
        <div className="glass-panel max-w-4xl mx-auto rounded-3xl overflow-hidden border border-slate-800/80 shadow-2xl shadow-slate-950/60 flex flex-col md:flex-row">
          
          {/* Left Visual Area */}
          <div className="md:w-1/3 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800/50 relative overflow-hidden select-none min-h-[350px]">
            {book.image_url ? (
              <img 
                src={book.image_url} 
                alt={book.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-indigo-950/50 to-slate-900/90">
                <BookOpen className="h-16 w-16 text-indigo-400 mb-4" />
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex flex-col items-start gap-1">
              <span className="inline-flex px-3 py-1 rounded-full text-[10px] font-bold bg-gradient-to-r from-purple-650 to-indigo-650 text-white border border-indigo-500/30 uppercase tracking-widest shadow-md">
                {book.genre}
              </span>
            </div>
          </div>

          {/* Right Text Content Area */}
          <div className="md:w-2/3 p-8 md:p-10 flex flex-col justify-between">
            <div>
              {/* Title & Author */}
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-2 leading-tight">
                {book.title}
              </h2>
              <p className="text-sm font-semibold text-slate-400 mb-6">by {book.author}</p>

              {/* Description block */}
              <div className="space-y-2 mb-8">
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-455 text-indigo-400">
                  Book Summary
                </span>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line bg-slate-900/30 p-4 rounded-xl border border-slate-900">
                  {book.description || "No description provided for this catalog listing."}
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-slate-900">
              
              {/* Availability Badging */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 font-medium select-none">Status:</span>
                {book.is_available ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 border border-emerald-500/20 rounded-full">
                    <CheckCircle className="h-4 w-4" /> Available for Loan
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-900 px-3 py-1 border border-slate-800 rounded-full">
                    <HelpCircle className="h-4 w-4" /> Currently Out on Loan
                  </span>
                )}
              </div>

              {/* Borrow trigger button */}
              {user?.role === 'ADMIN' ? (
                /* Admin view helper warning */
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 select-none">
                  <ShieldAlert className="h-4 w-4" /> Viewing as Admin Officer
                </span>
              ) : book.is_available ? (
                <button
                  onClick={handleBorrow}
                  disabled={borrowLoading}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/10 disabled:bg-indigo-600/50 disabled:cursor-not-allowed focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {borrowLoading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Processing Request...
                    </>
                  ) : (
                    'Borrow Book (14 Days)'
                  )}
                </button>
              ) : (
                <button
                  disabled
                  className="px-6 py-3 rounded-xl text-sm font-bold bg-slate-900 border border-slate-800 text-slate-650 text-slate-500 cursor-not-allowed select-none"
                >
                  Book Borrowed
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Not found state */
        <div className="glass-panel p-12 rounded-2xl flex flex-col items-center justify-center text-center max-w-md mx-auto border border-slate-800">
          <AlertCircle className="h-10 w-10 text-rose-500 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Book Not Found</h3>
          <p className="text-slate-400 text-sm mb-6">
            We couldn't locate the requested book detail in our catalog inventory database.
          </p>
          <Link
            to="/books"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold transition-all text-sm"
          >
            Return to Catalogue
          </Link>
        </div>
      )}
    </Layout>
  );
};

export default BookDetail;
