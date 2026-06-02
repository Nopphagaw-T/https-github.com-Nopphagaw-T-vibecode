/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Kanban, ArrowRight } from 'lucide-react';

export default function LoginScreen() {
  const { signIn } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('anira@taskflow.app');
  const [password, setPassword] = useState('password123');
  const [errorText, setErrorText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (!email.trim() || !password.trim()) {
      setErrorText('Please fill in both email and password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const success = signIn(email.trim(), password.trim());
      setIsLoading(false);
      if (success) {
        navigate('/');
      } else {
        setErrorText('Invalid email or credentials. Use any predefined email like: anira@taskflow.app');
      }
    }, 600);
  };

  const selectPredefinedUser = async (em: string) => {
    setEmail(em);
    setErrorText('');
    setIsLoading(true);
    const success = await signIn(em, password);
    setIsLoading(false);
    if (success) {
      navigate('/');
    } else {
      setErrorText('Failed to sign in.');
    }
  };

  return (
    <div id="login-screen" className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shrink-0 p-8 shadow-xl shadow-slate-100/80 border border-slate-150 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Banner */}
        <div className="flex flex-col items-center text-center mb-8 select-none">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white mb-3 shadow-lg shadow-blue-500/20 active:scale-95 transition-transform">
            <Kanban className="w-6.5 h-6.5" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-none font-sans">
            Welcome to TaskFlow
          </h1>
          <p className="text-xs text-slate-400 mt-2 font-medium max-w-sm leading-relaxed">
            Centralize your teams’ tasks, track milestones, and prioritize what matters.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorText && (
            <div className="px-4 py-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-100 leading-normal">
              {errorText}
            </div>
          )}

          {/* Email Address */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Email Address / Account
            </label>
            <input
              type="email"
              placeholder="anira@taskflow.app"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorText) setErrorText('');
              }}
              className="w-full text-sm rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-slate-800"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-xs font-semibold tracking-wider uppercase text-slate-500">
              <label>Password</label>
              <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Demo environment: password can be any characters!'); }} className="text-blue-600 lowercase tracking-normal hover:underline normal-case">
                Forgot password?
              </a>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorText) setErrorText('');
              }}
              className="w-full text-sm rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-slate-800"
            />
          </div>

          {/* Login Submit CTA BUTTON */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 cursor-pointer select-none transition-all mt-6"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Create account navigation link */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">
            Don't have an account yet?{' '}
            <Link to="/signup" className="text-blue-600 font-bold hover:underline transition-colors pl-1">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* Helper fast links to select default mock profiles */}
      <div className="mt-6 flex flex-col items-center justify-center gap-1.5 font-sans">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          Or Quick Test Accounts
        </span>
        <div className="flex flex-wrap gap-2 justify-center max-w-md">
          {[
            { name: 'Anira (AW)', email: 'anira@taskflow.app' },
            { name: 'Marcus (MR)', email: 'marcus@taskflow.app' },
            { name: 'Priya (PN)', email: 'priya@taskflow.app' },
            { name: 'Tom (TB)', email: 'tom@taskflow.app' },
            { name: 'Sara (SO)', email: 'sara@taskflow.app' },
          ].map((item) => (
            <button
              key={item.email}
              type="button"
              onClick={() => selectPredefinedUser(item.email)}
              className="text-xs bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 font-medium px-3 py-1 rounded-full transition-colors active:scale-95 shadow-2xs cursor-pointer"
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
