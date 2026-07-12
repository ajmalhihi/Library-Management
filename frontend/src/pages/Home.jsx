import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Star } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDashboard = () => {
    if (user?.role === 'ADMIN') {
      navigate('/admin/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans">

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg">Athena Library</span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-slate-400 text-sm">Hi, {user.first_name || user.email}</span>
                <button
                  onClick={handleDashboard}
                  className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
                >
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">
                  Log In
                </Link>
                <Link to="/register" className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-24 pb-20 px-6 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 h-[400px] w-[400px] bg-indigo-500/10 rounded-full filter blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] bg-emerald-500/5 rounded-full filter blur-[100px]" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold px-4 py-2 rounded-full mb-6 uppercase tracking-wider">
            <Star className="h-3 w-3" /> Your Digital Library
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            Discover & Borrow
            <span className="block bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              Books You Love
            </span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Athena Library gives you access to thousands of books. Browse, borrow, and manage your reading list all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <button
                onClick={handleDashboard}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 rounded-2xl text-base transition-all hover:scale-105"
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <Link to="/register" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 rounded-2xl text-base transition-all hover:scale-105">
                  Sign In
                </Link>
                <Link to="/login" className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-8 py-4 rounded-2xl text-base transition-all border border-slate-700">
                  Log In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Books Available", value: "500+", icon: "📚" },
            { label: "Active Members", value: "1,200+", icon: "👥" },
            { label: "Books Borrowed", value: "10,000+", icon: "📖" },
          ].map((stat) => (
            <div key={stat.label} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3">{stat.icon}</div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-slate-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Everything you need in a <span className="text-indigo-400">library</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { icon: "🔍", title: "Smart Search", desc: "Search books by title, author, or category in seconds." },
            { icon: "📦", title: "Easy Borrowing", desc: "Borrow books with one click and track your due dates." },
            { icon: "📋", title: "Borrow History", desc: "View your complete borrowing history anytime." },
            { icon: "🔔", title: "Due Date Alerts", desc: "Never miss a return date with our reminder system." },
          ].map((feature) => (
            <div key={feature.title} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex gap-4 items-start hover:border-indigo-500/30 transition-colors">
              <div className="text-3xl">{feature.icon}</div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <div className="bg-gradient-to-r from-indigo-500/10 to-emerald-500/10 border border-indigo-500/20 rounded-3xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to start reading?</h2>
          <p className="text-slate-400 mb-8">Join thousands of readers using Athena Library today.</p>
          {user ? (
            <button
              onClick={handleDashboard}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 rounded-2xl text-base transition-all hover:scale-105 inline-block"
            >
              Go to Dashboard
            </button>
          ) : (
            <Link to="/register" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 rounded-2xl text-base transition-all hover:scale-105 inline-block">
              Create Free Account
            </Link>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
        <p>© 2026 Athena Library Management System. All rights reserved.</p>
      </footer>

    </div>
  );
};

export default Home;