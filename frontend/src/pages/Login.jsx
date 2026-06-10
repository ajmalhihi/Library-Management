import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, BookOpen, AlertCircle, CheckCircle } from 'lucide-react';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // UX States
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle redirect messages
  useEffect(() => {
    if (searchParams.get('expired')) {
      setApiError('Your session has expired. Please log in again.');
    }
    if (searchParams.get('registered')) {
      setSuccessMsg('Registration successful! Please log in below.');
    }
  }, [searchParams]);

  // Form Field Validation
  const validateForm = () => {
    const formErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      formErrors.email = 'Email address is required';
    } else if (!emailRegex.test(email.trim())) {
      formErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      formErrors.password = 'Password is required';
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccessMsg('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      const user = await login(email, password);
      // Success redirection based on role
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setApiError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Visual background lights */}
      <div className="absolute top-1/4 left-1/4 h-[350px] w-[350px] bg-indigo-500/10 rounded-full filter blur-[80px]" />
      <div className="absolute bottom-1/4 right-1/4 h-[350px] w-[350px] bg-emerald-500/5 rounded-full filter blur-[80px]" />

      <div className="w-full max-w-md animate-fade-in relative z-10">
        {/* Brand Logo Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-600/30 mb-3 border border-indigo-400/20">
            <BookOpen className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white m-0">Welcome Back</h2>
          <p className="text-sm text-slate-400 mt-2 font-medium">Athena Library Management System</p>
        </div>

        {/* Login Glassmorphic Panel */}
        <div className="glass-panel p-8 rounded-2xl shadow-xl shadow-slate-950/50">
          {/* Notifications */}
          {apiError && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 text-rose-300 text-sm animate-fade-in">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3 text-emerald-300 text-sm animate-fade-in">
              <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 bg-slate-900/80 border rounded-xl text-slate-100 placeholder-slate-500 text-sm font-medium transition-all focus:bg-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none ${
                    errors.email ? 'border-rose-500' : 'border-slate-800'
                  }`}
                  placeholder="name@example.com"
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-rose-400 font-medium flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.email}
                </p>
              )}
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 bg-slate-900/80 border rounded-xl text-slate-100 placeholder-slate-500 text-sm font-medium transition-all focus:bg-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none ${
                    errors.password ? 'border-rose-500' : 'border-slate-800'
                  }`}
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-rose-400 font-medium flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.password}
                </p>
              )}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-150 flex items-center justify-center gap-2 mt-6 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 outline-none"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Logging in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Toggle link */}
        <p className="text-center text-sm text-slate-400 mt-6 font-medium">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-bold transition-all">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
