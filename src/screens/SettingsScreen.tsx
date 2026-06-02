/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, User, Eye, Bell, Shield, Palette, Sparkles, Check, ToggleLeft, ToggleRight } from 'lucide-react';

export default function SettingsScreen() {
  const { currentUser, addToast, theme, setTheme } = useApp();
  const navigate = useNavigate();

  // Settings mock UI states
  const [accent, setAccent] = useState('blue');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [reassignAlerts, setReassignAlerts] = useState(true);
  const [commentAlerts, setCommentAlerts] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('Preferences saved successfully!', 'success');
  };

  const handleToggle = (state: boolean, setter: (s: boolean) => void, field: string) => {
    setter(!state);
    addToast(`${field} ${!state ? 'enabled' : 'disabled'}.`, 'success');
  };

  return (
    <div id="settings-screen" className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6 font-sans">
      {/* Back breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-350 transition-colors cursor-pointer"
          title="Back to previous page"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Account Settings</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500">Manage your profile, visual styles, and workspace notification preferences.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* PROFILE CARD */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <User className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 font-sans">Workspace Profile</h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-1">
            {/* User initial avatar circle */}
            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center font-bold text-lg text-white select-none shadow-md shadow-blue-500/10">
              {currentUser?.initials || 'AW'}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 leading-snug">{currentUser?.name || 'Testing Account'}</h3>
              <p className="text-xs text-slate-450 dark:text-slate-400 mt-0.5 leading-snug">{currentUser?.email || 'anira@taskflow.app'}</p>
              <span className="inline-block bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-md mt-2">
                Team Contributor / Manager
              </span>
            </div>
            
            <span className="text-[10px] text-slate-400 dark:text-slate-500 italic">Static credentials</span>
          </div>
        </div>

        {/* WORKSPACE PREFERENCES */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Palette className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 font-sans">Appearance & Theme</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
            {/* Theme Toggle */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Interface Mode</label>
              <div className="flex border border-slate-200 dark:border-slate-800 rounded-xl p-0.5 bg-slate-50 dark:bg-slate-950 max-w-xs">
                {['light', 'dark'].map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => {
                      setTheme(t as 'light' | 'dark');
                      addToast(`Visual theme set to ${t}. (Preview optimized)`, 'success');
                    }}
                    className={`flex-1 text-center py-2.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                      theme === t
                        ? 'bg-white dark:bg-slate-800 shadow-xs text-slate-800 dark:text-slate-100'
                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Accent Theme selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wide">Brand Color Accent</label>
              <div className="flex gap-2 p-1 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 max-w-xs justify-around h-10">
                {[
                  { id: 'blue', color: 'bg-blue-600' },
                  { id: 'purple', color: 'bg-indigo-600' },
                  { id: 'cyan', color: 'bg-cyan-600' },
                  { id: 'green', color: 'bg-emerald-600' },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => {
                      setAccent(item.id);
                      addToast(`Accent color updated to ${item.id}`, 'success');
                    }}
                    className={`w-6 h-6 rounded-full hover:scale-105 transition-all relative flex items-center justify-center self-center cursor-pointer ${item.color}`}
                  >
                    {accent === item.id && <Check className="w-3.5 h-3.5 text-white" style={{ strokeWidth: 3 }} />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* NOTIFICATION PREFERENCES TABS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Bell className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 font-sans">Notification Options</h2>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-3.5 pt-1.5">
            {/* Email dispatch alert option */}
            <div className="flex items-center justify-between py-1 bg-white dark:bg-slate-900">
              <div className="flex flex-col leading-snug">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">Email Digest Alert</span>
                <span className="text-xs text-slate-425 dark:text-slate-400">Send a weekly aggregate of completed milestones and upcoming tasks.</span>
              </div>
              <button
                type="button"
                onClick={() => handleToggle(emailAlerts, setEmailAlerts, 'Email digests')}
                className="text-slate-400 hover:text-slate-650 transition-colors"
              >
                {emailAlerts ? <ToggleRight className="w-10 h-10 text-blue-600" /> : <ToggleLeft className="w-10 h-10 text-slate-300 dark:text-slate-600" />}
              </button>
            </div>

            {/* Task assignment option */}
            <div className="flex items-center justify-between py-3 bg-white dark:bg-slate-900">
              <div className="flex flex-col leading-snug">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">Task Reassignment Alerts</span>
                <span className="text-xs text-slate-425 dark:text-slate-400">Trigger a browser notification whenever teammate delegates cards to you.</span>
              </div>
              <button
                type="button"
                onClick={() => handleToggle(reassignAlerts, setReassignAlerts, 'Task allocations')}
                className="text-slate-400 hover:text-slate-650 transition-colors"
              >
                {reassignAlerts ? <ToggleRight className="w-10 h-10 text-blue-600" /> : <ToggleLeft className="w-10 h-10 text-slate-300 dark:text-slate-600" />}
              </button>
            </div>

            {/* Comment Thread follow Option */}
            <div className="flex items-center justify-between py-3 bg-white dark:bg-slate-900">
              <div className="flex flex-col leading-snug">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">Discussions alerts</span>
                <span className="text-xs text-slate-425 dark:text-slate-400">Notify me immediately about comments on topics I have contributed to.</span>
              </div>
              <button
                type="button"
                onClick={() => handleToggle(commentAlerts, setCommentAlerts, 'Thread feedback')}
                className="text-slate-400 hover:text-slate-650 transition-colors"
              >
                {commentAlerts ? <ToggleRight className="w-10 h-10 text-blue-600" /> : <ToggleLeft className="w-10 h-10 text-slate-300 dark:text-slate-600" />}
              </button>
            </div>
          </div>
        </div>

        {/* Action Save Bar */}
        <div className="flex items-center justify-end gap-3 shrink-0 pt-2 pb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 text-xs font-bold rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-850 dark:hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 hover:shadow-blue-500/15 transition-all select-none cursor-pointer"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
}
