import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Layout } from '../components/Layout';
import { 
  Users, 
  Mail, 
  User as UserIcon, 
  ShieldCheck, 
  LockOpen,
  Calendar,
  AlertCircle
} from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get('admin/users/');
        setUsers(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch registered users.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <Layout>
      {/* Page Header */}
      <div className="mb-8 select-none">
        <h2 className="text-2xl font-extrabold tracking-tight text-white m-0">Users Directory</h2>
        <p className="text-slate-400 text-sm mt-1">Audit registered library members and administrative staff officers</p>
      </div>

      {/* API Errors */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-3 animate-fade-in">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden animate-pulse">
          <div className="h-12 bg-slate-900 border-b border-slate-800"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 border-b border-slate-900 flex justify-between">
              <div className="h-4 bg-slate-900 rounded w-1/4"></div>
              <div className="h-4 bg-slate-900 rounded w-1/12"></div>
            </div>
          ))}
        </div>
      ) : (
        /* Users List Directory Table */
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl shadow-slate-950/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400 select-none">
                  <th className="py-4 px-6">Staff/Member Profile</th>
                  <th className="py-4 px-6">Email Address</th>
                  <th className="py-4 px-6">Permission Role</th>
                  <th className="py-4 px-6">Access State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/80 text-sm">
                {users.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                    
                    {/* User profile info */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3.5">
                        <div className={`p-2 border rounded-lg shrink-0 select-none ${
                          item.role === 'ADMIN' 
                            ? 'bg-amber-500/10 border-amber-500/25 text-amber-400' 
                            : 'bg-indigo-500/10 border-indigo-500/25 text-indigo-400'
                        }`}>
                          <UserIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-200 m-0">{item.name}</h4>
                          <span className="text-[10px] text-slate-500 font-semibold select-none">ID: #{item.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-4 px-6 select-text">
                      <span className="inline-flex items-center gap-2 font-medium text-slate-300">
                        <Mail className="h-4 w-4 text-slate-500 shrink-0 select-none" />
                        {item.email}
                      </span>
                    </td>

                    {/* Role badge */}
                    <td className="py-4 px-6 font-bold select-none">
                      {item.role === 'ADMIN' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <ShieldCheck className="h-3 w-3" /> Admin Staff
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Standard User
                        </span>
                      )}
                    </td>

                    {/* Access Status */}
                    <td className="py-4 px-6 font-medium select-none">
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
                        <LockOpen className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        Active Account
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminUsers;
