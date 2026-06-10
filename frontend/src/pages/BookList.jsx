import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { Layout } from '../components/Layout';
import { Search, Book, CheckCircle2, HelpCircle, ArrowRight } from 'lucide-react';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const fetchBooks = async (query = '') => {
    setLoading(true);
    try {
      const res = await API.get(`books/${query ? `?search=${encodeURIComponent(query)}` : ''}`);
      setBooks(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load books catalogue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchBooks();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBooks(search);
  };

  const handleSearchClear = () => {
    setSearch('');
    fetchBooks('');
  };

  return (
    <Layout>
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white m-0">Books Catalogue</h2>
          <p className="text-slate-400 text-sm mt-1">Explore our physical library inventory, borrow research code and text</p>
        </div>

        {/* Search Bar Form */}
        <form onSubmit={handleSearchSubmit} className="flex w-full lg:max-w-md gap-3 select-none">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="h-4.5 w-4.5" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or author..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm font-medium transition-all focus:bg-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-600/25 focus:ring-2 focus:ring-indigo-500"
          >
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={handleSearchClear}
              className="px-4 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-sm font-medium transition-all"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* API Errors */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm animate-fade-in">
          {error}
        </div>
      )}

      {/* Loading Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 animate-pulse">
              <div className="h-48 bg-slate-900 rounded-xl"></div>
              <div className="h-4 bg-slate-800 rounded w-2/3"></div>
              <div className="h-3 bg-slate-800 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : books.length === 0 ? (
        /* Empty State */
        <div className="glass-panel p-12 rounded-2xl flex flex-col items-center justify-center text-center max-w-md mx-auto border border-slate-800/80">
          <div className="bg-slate-900 p-4 rounded-2xl text-slate-500 border border-slate-800 mb-4">
            <Book className="h-8 w-8 text-indigo-400/60" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No books found</h3>
          <p className="text-slate-400 text-sm mb-4">
            We couldn't find any books matching "{search}". Double-check your spelling or clear search filters.
          </p>
          <button
            onClick={handleSearchClear}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold transition-all"
          >
            Reset Catalog View
          </button>
        </div>
      ) : (
        /* Books Card Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map((book) => (
            <div
              key={book.id}
              className="glass-panel rounded-2xl border border-slate-800 hover:border-slate-700/80 overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/10 group"
            >
              {/* Graphic Block representing book */}
              <div className="h-48 bg-slate-900 border-b border-slate-800/50 relative overflow-hidden shrink-0 select-none">
                {book.image_url ? (
                  <img 
                    src={book.image_url} 
                    alt={book.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900/30 to-slate-900/80">
                    <Book className="h-10 w-10 text-indigo-500/40" />
                  </div>
                )}
                {/* Overlay gradient to make text more readable */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60" />
                <span className="absolute bottom-3 left-4 text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 bg-indigo-900/90 border border-indigo-500/30 rounded text-slate-200 shadow-md">
                  {book.genre}
                </span>
              </div>

              {/* Text info */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <h3 className="text-sm font-bold text-slate-100 line-clamp-2 leading-snug group-hover:text-indigo-400 transition-colors">
                      {book.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 truncate mb-3">by {book.author}</p>
                </div>

                <div className="pt-4 border-t border-slate-900/80 flex items-center justify-between mt-4">
                  {book.is_available ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20 rounded-full">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Available
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-900 px-2 py-0.5 border border-slate-800 rounded-full">
                      <HelpCircle className="h-3.5 w-3.5" /> Borrowed
                    </span>
                  )}

                  <Link
                    to={`/books/${book.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 group-hover:text-indigo-300 transition-all"
                  >
                    Details <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default BookList;
