import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User as UserIcon, Mail, Lock, BookOpen, AlertCircle } from 'lucide-react';

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiErrors, setApiErrors] = useState({});

  const validateForm = () => {
    const formErrors = {};
    const emailRegex = /^[^\s@]+@gmail\.com$/;

    if (!name.trim()) formErrors.name = 'Full name is required';

    if (!email.trim()) {
      formErrors.email = 'Email address is required';
    } else if (!emailRegex.test(email.trim())) {
      formErrors.email = 'Only Gmail addresses are allowed (e.g. name@gmail.com)';
    }

    if (!password) {
      formErrors.password = 'Password is required';
    } else if (password.length < 8) {
      formErrors.password = 'Password must be at least 8 characters long';
    }

    if (!confirmPassword) {
      formErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      formErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiErrors({});

    if (!validateForm()) return;

    setLoading(true);
    try {
      await register(name, email, password, confirmPassword, 'USER');
      navigate('/login?registered=true');
    } catch (err) {
      if (typeof err === 'object') {
        setApiErrors(err);
      } else {
        setApiErrors({ general: err });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 h-[350px] w-[350px] bg-indigo-500/10 rounded-full filter blur-[80px]" />
      <div className="absolute bottom-1/4 right-1/4 h-[350px] w-[350px] bg-emerald-500/5 rounded-full filter blur-[80px]" />

      <div className="w-full max-w-md animate-fade-in relative z-10">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-600/30 mb-3 border border-indigo-400/20">
            <BookOpen className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white m-0">Create Account</h2>
          <p className="text-sm text-slate-400 mt-2 font-medium">Join the Athena Library Management System</p>
        </div>

        <div className="glass-panel p-8 rounded-2xl shadow-xl shadow-slate-950/50">

          {apiErrors.general && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 text-rose-300 text-sm animate-fade-in">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{apiErrors.general}</span>
            </div>
          )}

          {apiErrors.non_field_errors && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 text-rose-300 text-sm animate-fade-in">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{apiErrors.non_field_errors.join(' ')}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name field */}
            <div>
              <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <UserIcon className="h-4.5 w-4.5" />
                </div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full pl-11 pr-4 py-2.5 bg-slate-900/80 border rounded-xl text-slate-100 placeholder-slate-500 text-sm font-medium transition-all focus:bg-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none ${
                    errors.name ? 'border-rose-500' : 'border-slate-800'
                  }`}
                  placeholder="John Doe"
                  disabled={loading}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-rose-400 font-medium flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.name}
                </p>
              )}
            </div>

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
                  className={`w-full pl-11 pr-4 py-2.5 bg-slate-900/80 border rounded-xl text-slate-100 placeholder-slate-500 text-sm font-medium transition-all focus:bg-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none ${
                    errors.email || apiErrors.email ? 'border-rose-500' : 'border-slate-800'
                  }`}
                  placeholder="name@gmail.com"
                  disabled={loading}
                />
              </div>
              {(errors.email || apiErrors.email) && (
                <p className="mt-1 text-xs text-rose-400 font-medium flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.email || apiErrors.email?.join(' ')}
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
                  className={`w-full pl-11 pr-4 py-2.5 bg-slate-900/80 border rounded-xl text-slate-100 placeholder-slate-500 text-sm font-medium transition-all focus:bg-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none ${
                    errors.password || apiErrors.password ? 'border-rose-500' : 'border-slate-800'
                  }`}
                  placeholder="Min 8 characters"
                  disabled={loading}
                />
              </div>
              {(errors.password || apiErrors.password) && (
                <p className="mt-1 text-xs text-rose-400 font-medium flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.password || apiErrors.password?.join(' ')}
                </p>
              )}
            </div>

            {/* Confirm Password field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-11 pr-4 py-2.5 bg-slate-900/80 border rounded-xl text-slate-100 placeholder-slate-500 text-sm font-medium transition-all focus:bg-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none ${
                    errors.confirmPassword || apiErrors.confirm_password ? 'border-rose-500' : 'border-slate-800'
                  }`}
                  placeholder="Confirm password"
                  disabled={loading}
                />
              </div>
              {(errors.confirmPassword || apiErrors.confirm_password) && (
                <p className="mt-1 text-xs text-rose-400 font-medium flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.confirmPassword || apiErrors.confirm_password?.join(' ')}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-150 flex items-center justify-center gap-2 mt-6 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 outline-none"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating account...
                </>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-400 mt-6 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-bold transition-all">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;