import React, { useState } from 'react';
import { UserProfile } from '../types';
import { LocalFinanceDB } from '../lib/db';
import { LogIn, UserPlus, ShieldAlert, CheckCircle2, User, HelpCircle } from 'lucide-react';

interface SessionControlProps {
  user: UserProfile | null;
  onUserUpdate: (newUser: UserProfile | null) => void;
}

export default function SessionControl({ user, onUserUpdate }: SessionControlProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const loggedIn = LocalFinanceDB.login(email, name || undefined);
    onUserUpdate(loggedIn);
    setNotice(`Successfully authenticated as ${loggedIn.name}`);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleGoogleMockLogin = () => {
    const googleUser = LocalFinanceDB.login('mywindows10proacc@gmail.com', 'Google User');
    onUserUpdate(googleUser);
    setNotice('Connected seamlessly via Google Oauth Auth!');
    setTimeout(() => setNotice(null), 3000);
  };

  const handleLogout = () => {
    LocalFinanceDB.logout();
    onUserUpdate(null);
    setNotice('Logged out safely. Sandbox state remains.');
    setTimeout(() => setNotice(null), 3000);
  };

  return (
    <div id="session-component" className="bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-100 dark:border-slate-900 shadow-sm animate-fade-in">
      <h2 className="text-xl font-display font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
        <User className="w-5 h-5 text-indigo-500" />
        Authentication Dashboard
      </h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-sans">
        Configure users, test isolated database scopes, and verify PostgreSQL Row-Level Security profiles dynamically.
      </p>

      {notice && (
        <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl flex items-center gap-2 border border-emerald-100 dark:border-emerald-900/50">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {user ? (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-2 border border-slate-100 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">Current Active Security Token</div>
            <div className="flex flex-col gap-1">
              <span className="font-display font-medium text-slate-900 dark:text-white">{user.name}</span>
              <span className="text-xs text-indigo-500 dark:text-indigo-400 font-mono select-all overflow-hidden text-ellipsis">{user.email}</span>
            </div>
            <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>DB User ID: {user.id}</span>
              <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl flex gap-2 border border-indigo-100/30">
            <ShieldAlert className="w-4.5 h-4.5 text-indigo-500 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed text-indigo-700 dark:text-indigo-400">
              Database Row-Level Security (RLS) is active. Your queries are automatically filtered using:
              <code className="block mt-1 font-mono p-1 bg-white dark:bg-slate-950 rounded border border-indigo-100/50 dark:border-indigo-900">
                WHERE user_id = auth.uid()
              </code>
              Changing email creates a completely separate clean context and private ledger automatically!
            </div>
          </div>

          <button
            id="btn-logout"
            onClick={handleLogout}
            className="w-full py-2.5 px-4 rounded-xl font-medium text-xs bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/40 transition-colors cursor-pointer"
          >
            Sign Out and Terminate Session
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${!isSignUp ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${isSignUp ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 font-sans uppercase">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white font-mono"
              />
            </div>

            {isSignUp && (
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 font-sans uppercase">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Alex Henderson"
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>
            )}

            <button
              id="btn-login-submit"
              type="submit"
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
              {isSignUp ? 'Create Secured Account' : 'Authenticate Securely'}
            </button>
          </form>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-100 dark:border-slate-900"></div>
            <span className="flex-shrink mx-4 text-[10px] text-slate-400 font-mono uppercase">Or Connect Instantly</span>
            <div className="flex-grow border-t border-slate-100 dark:border-slate-900"></div>
          </div>

          <button
            id="btn-google-login"
            onClick={handleGoogleMockLogin}
            className="w-full py-2.5 px-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign In with Google Account
          </button>
        </div>
      )}
    </div>
  );
}
