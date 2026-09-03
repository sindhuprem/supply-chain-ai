import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ShieldCheck, Truck, Factory, Store, Building2, Lock, User, Cpu } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('manufacturer');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleQuickLogin = (roleUsername) => {
    setUsername(roleUsername);
    setPassword('password123');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const userData = await login(username, password);
      const roleRedirects = {
        manufacturer: '/manufacturer',
        distributor: '/distributor',
        transporter: '/transporter',
        retailer: '/retailer',
      };
      navigate(roleRedirects[userData.role] || '/manufacturer');
    } catch (err) {
      console.error(err);
      if (err.code === 'ERR_NETWORK' || !err.response) {
        setError('Cannot connect to backend server at http://localhost:8000. Make sure the backend is running!');
      } else {
        setError(err.response?.data?.detail || 'Invalid username or password. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center p-3 bg-blue-600/20 rounded-2xl border border-blue-500/30 text-blue-400 mb-4 shadow-lg shadow-blue-500/10">
          <Cpu className="w-10 h-10 text-blue-400 animate-pulse" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
          Hierarchical Supply Chain AI
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Multi-Agent Disruption Response & Autonomous Route Replanning
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900/80 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl border border-slate-800 sm:px-10">
          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-sm text-center">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-300">Username / Role ID</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Enter username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200"
            >
              {submitting ? 'Authenticating...' : 'Sign In to Portal'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 px-2 text-slate-400 font-semibold">Demo Role Quick Access</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleQuickLogin('manufacturer')}
                className="flex items-center justify-center px-3 py-2 border border-slate-800 rounded-xl text-xs font-medium text-slate-300 bg-slate-950 hover:bg-slate-800 transition-colors"
              >
                <Factory className="w-4 h-4 mr-1.5 text-blue-400" />
                Manufacturer
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('distributor')}
                className="flex items-center justify-center px-3 py-2 border border-slate-800 rounded-xl text-xs font-medium text-slate-300 bg-slate-950 hover:bg-slate-800 transition-colors"
              >
                <Building2 className="w-4 h-4 mr-1.5 text-emerald-400" />
                Distributor
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('transporter')}
                className="flex items-center justify-center px-3 py-2 border border-slate-800 rounded-xl text-xs font-medium text-slate-300 bg-slate-950 hover:bg-slate-800 transition-colors"
              >
                <Truck className="w-4 h-4 mr-1.5 text-amber-400" />
                Transporter
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('retailer')}
                className="flex items-center justify-center px-3 py-2 border border-slate-800 rounded-xl text-xs font-medium text-slate-300 bg-slate-950 hover:bg-slate-800 transition-colors"
              >
                <Store className="w-4 h-4 mr-1.5 text-purple-400" />
                Retailer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
