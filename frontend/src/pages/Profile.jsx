import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Layout } from '../components/Layout';
import API from '../services/api';
import { User, Mail, Lock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

const Profile = () => {
  const { user, login } = useContext(AuthContext);

  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (newPassword) {
      if (!currentPassword) errs.current_password = 'Current password is required';
      if (newPassword.length < 8) errs.new_password = 'New password must be at least 8 characters';
      if (newPassword !== confirmPassword) errs.confirm_password = 'Passwords do not match';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setErrors({});
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = { name };
      if (newPassword) {
        payload.current_password = currentPassword;
        payload.new_password = newPassword;
        payload.confirm_password = confirmPassword;
      }

      const res = await API.put('auth/profile/update/', payload);
      setSuccess('Profile updated successfully!');

      // Update stored user
      const updatedUser = res.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      if (err.response?.data) {
        setErrors(err.response.data);
      } else {
        setErrors({ general: 'Failed to update profile. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full pl-11 pr-4 py-2.5 bg-slate-900/80 border rounded-xl text-slate-100 placeholder-slate-500 text-sm font-medium transition-all focus:bg-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none ${
      errors[field] ? 'border-rose-500' : 'border-slate-800'
    }`;

  return (
    <Layout>
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold tracking-tight text-white m-0">My Profile</h2>
        <p className="text-slate-400 text-sm mt-1">Update your name and password</p>
      </div>

      <div className="max-w-lg">

        {/* Profile Info Card */}
        <div className="glass-panel rounded-2xl border border-slate-800 p-6 mb-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-indigo-400">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <div className="text-white font-bold text-lg">{user?.name}</div>
            <div className="text-slate-400 text-sm">{user?.email}</div>
            <div className="mt-1">
              <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-300 text-sm">
            <CheckCircle className="h-5 w-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* General Error */}
        {errors.general && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-300 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{errors.general}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass-panel rounded-2xl border border-slate-800 p-6 space-y-5">

          {/* Name Field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass('name')}
                placeholder="Your full name"
                disabled={loading}
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {errors.name}
              </p>
            )}
          </div>

          {/* Email — read only */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Email Address <span className="text-slate-600 normal-case font-normal">(cannot be changed)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                value={user?.email || ''}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-900/40 border border-slate-800 rounded-xl text-slate-500 text-sm font-medium outline-none cursor-not-allowed"
                disabled
              />
            </div>
          </div>

          <div className="border-t border-slate-800 pt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
              Change Password <span className="text-slate-600 normal-case font-normal">(leave blank to keep current)</span>
            </p>

            {/* Current Password */}
            <div className="mb-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Current Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={`w-full pl-11 pr-10 py-2.5 bg-slate-900/80 border rounded-xl text-slate-100 placeholder-slate-500 text-sm font-medium transition-all focus:bg-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none ${errors.current_password ? 'border-rose-500' : 'border-slate-800'}`}
                  placeholder="Enter current password"
                  disabled={loading}
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300">
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.current_password && (
                <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.current_password}
                </p>
              )}
            </div>

            {/* New Password */}
            <div className="mb-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full pl-11 pr-10 py-2.5 bg-slate-900/80 border rounded-xl text-slate-100 placeholder-slate-500 text-sm font-medium transition-all focus:bg-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none ${errors.new_password ? 'border-rose-500' : 'border-slate-800'}`}
                  placeholder="Min 8 characters"
                  disabled={loading}
                />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300">
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.new_password && (
                <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.new_password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-11 pr-10 py-2.5 bg-slate-900/80 border rounded-xl text-slate-100 placeholder-slate-500 text-sm font-medium transition-all focus:bg-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none ${errors.confirm_password ? 'border-rose-500' : 'border-slate-800'}`}
                  placeholder="Confirm new password"
                  disabled={loading}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirm_password && (
                <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.confirm_password}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Saving...</>
            ) : 'Save Changes'}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default Profile;