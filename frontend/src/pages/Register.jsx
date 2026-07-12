import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User as UserIcon, Mail, Lock, BookOpen, AlertCircle, Eye, EyeOff, CheckCircle } from 'lucide-react';

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiErrors, setApiErrors] = useState({});

  // Password strength checker
  const getPasswordStrength = (pwd) => {
    let score = 0;
    const checks = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };
    score = Object.values(checks).filter(Boolean).length;
    return { score, checks };
  };

  const passwordStrength = getPasswordStrength(password);

  const getStrengthLabel = (score) => {
    if (score <= 1) return { label: 'Very Weak', color: 'bg-rose-500' };
    if (score === 2) return { label: 'Weak', color: 'bg-orange-500' };
    if (score === 3) return { label: 'Fair', color: 'bg-yellow-500' };
    if (score === 4) return { label: 'Strong', color: 'bg-emerald-500' };
    return { label: 'Very Strong', color: 'bg-emerald-400' };
  };

  const strengthInfo = getStrengthLabel(passwordStrength.score);

  // Validate single field
  const validateField = (fieldName, value) => {
    const emailRegex = /^[^\s@]+@gmail\.com$/;
    const nameRegex = /^[a-zA-Z\s]+$/;

    switch (fieldName) {
      case 'name':
        if (!value.trim()) return 'Full name is required';
        if (!nameRegex.test(value.trim())) return 'Name cannot contain numbers or special characters';
        if (value.trim().length < 3) return 'Name must be at least 3 characters';
        return '';
      case 'email':
        if (!value.trim()) return 'Email address is required';
        if (!emailRegex.test(value.trim())) return 'Only Gmail addresses allowed (e.g. name@gmail.com)';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
        if (!/[0-9]/.test(value)) return 'Password must contain at least one number';
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return 'Password must contain at least one special character';
        return '';
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== password) return 'Passwords do not match';
        return '';
      default:
        return '';
    }
  };

  // Handle real time validation on change
  const handleChange = (fieldName, value) => {
    if (fieldName === 'name') setName(value);
    if (fieldName === 'email') setEmail(value);
    if (fieldName === 'password') setPassword(value);
    if (fieldName === 'confirmPassword') setConfirmPassword(value);

    if (touched[fieldName]) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: validateField(fieldName, value),
      }));
    }
  };

  // Mark field as touched on blur
  const handleBlur = (fieldName) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    const value =
      fieldName === 'name' ? name :
      fieldName === 'email' ? email :
      fieldName === 'password' ? password :
      confirmPassword;
    setErrors((prev) => ({
      ...prev,
      [fieldName]: validateField(fieldName, value),
    }));
  };

  // Validate all fields on submit
  const validateForm = () => {
    const allTouched = { name: true, email: true, password: true, confirmPassword: true };
    setTouched(allTouched);
    const formErrors = {
      name: validateField('name', name),
      email: validateField('email', email),
      password: validateField('password', password),
      confirmPassword: validateField('confirmPassword', confirmPassword),
    };
    setErrors(formErrors);
    return !Object.values(formErrors).some(Boolean);
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

  const inputClass = (fieldName) =>
    `w-full pl-11 pr-10 py-2.5 bg-slate-900/80 border rounded-xl text-slate-100 placeholder-slate-500 text-sm font-medium transition-all focus:bg-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none ${
      touched[fieldName] && errors[fieldName]
        ? 'border-rose-500'
        : touched[fieldName] && !errors[fieldName]
        ? 'border-emerald-500'
        : 'border-slate-800'
    }`;

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
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 text-rose-300 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{apiErrors.general}</span>
            </div>
          )}

          {apiErrors.non_field_errors && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 text-rose-300 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{apiErrors.non_field_errors.join(' ')}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <UserIcon className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  className={inputClass('name')}
                  placeholder="John Doe"
                  disabled={loading}
                />
                {touched.name && !errors.name && (
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-emerald-500">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                )}
              </div>
              {touched.name && errors.name && (
                <p className="mt-1 text-xs text-rose-400 font-medium flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.name}
                </p>
              )}
            </div>

            {/* Email field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={inputClass('email')}
                  placeholder="name@gmail.com"
                  disabled={loading}
                />
                {touched.email && !errors.email && (
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-emerald-500">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                )}
              </div>
              {touched.email && errors.email && (
                <p className="mt-1 text-xs text-rose-400 font-medium flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.email}
                </p>
              )}
            </div>

            {/* Password field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className={inputClass('password')}
                  placeholder="Min 8 characters"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password strength bar */}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          i <= passwordStrength.score ? strengthInfo.color : 'bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-400">
                    Strength: <span className={`font-semibold ${
                      passwordStrength.score <= 2 ? 'text-rose-400' :
                      passwordStrength.score === 3 ? 'text-yellow-400' : 'text-emerald-400'
                    }`}>{strengthInfo.label}</span>
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-1">
                    {[
                      { key: 'length', label: '8+ characters' },
                      { key: 'uppercase', label: 'Uppercase letter' },
                      { key: 'number', label: 'Number' },
                      { key: 'special', label: 'Special character' },
                    ].map((check) => (
                      <p key={check.key} className={`text-xs flex items-center gap-1 ${
                        passwordStrength.checks[check.key] ? 'text-emerald-400' : 'text-slate-500'
                      }`}>
                        {passwordStrength.checks[check.key] ? '✓' : '○'} {check.label}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {touched.password && errors.password && (
                <p className="mt-1 text-xs text-rose-400 font-medium flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  className={inputClass('confirmPassword')}
                  placeholder="Confirm password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {touched.confirmPassword && errors.confirmPassword && (
                <p className="mt-1 text-xs text-rose-400 font-medium flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.confirmPassword}
                </p>
              )}
              {touched.confirmPassword && !errors.confirmPassword && confirmPassword && (
                <p className="mt-1 text-xs text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Passwords match!
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