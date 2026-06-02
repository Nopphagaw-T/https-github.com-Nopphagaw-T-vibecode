/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Menu, Search, Plus, Bell, User, Settings, LogOut, X, Sun, Moon } from 'lucide-react';

interface TopBarProps {
  onMenuToggle: () => void;
  onAddTaskClick: () => void;
}

export default function TopBar({ onMenuToggle, onAddTaskClick }: TopBarProps) {
  const { searchQuery, setSearchQuery, currentUser, signOut, theme, setTheme, users, signIn } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync typing with routing
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim() && location.pathname !== '/search') {
      navigate('/search');
    }
  };

  // Clear search field
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Mock list of notifications
  const mockNotifications = [
    { id: 1, text: 'Marcus Reed assigned you "Book ad placements"', read: false, time: '2h ago' },
    { id: 2, text: 'Priya Nair added a comment on "Design homepage hero"', read: true, time: '1d ago' },
  ];

  return (
    <header id="app-topbar" className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 h-16 flex items-center justify-between px-4 sm:px-6 z-30 font-sans">
      {/* Left: Hamburguer on mobile + Logo placeholder/title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition-colors"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5.5 h-5.5" />
        </button>

        <div className="hidden sm:flex lg:hidden items-center gap-2 font-bold text-slate-800 dark:text-white select-none">
          <span className="text-blue-600 font-mono tracking-tighter">TF</span>
          <span className="text-sm font-bold">TaskFlow</span>
        </div>
      </div>

      {/* Center Search Input */}
      <div className="flex-1 max-w-md mx-4 sm:mx-8 relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
          <Search className="w-4.5 h-4.5" />
        </div>
        <input
          type="text"
          placeholder="Global search tasks, tags, projects..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-9 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-105/50 dark:focus:ring-blue-900/30 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all text-slate-800 dark:text-slate-100"
        />
        {searchQuery && (
          <button
            onClick={handleClearSearch}
            className="absolute inset-y-0 right-2.5 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            title="Clear Search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Right side operations */}
      <div className="flex items-center gap-2 sm:gap-3.5">
        {/* Quick Add Task */}
        <button
          onClick={onAddTaskClick}
          className="bg-blue-605 hover:bg-blue-700 hover:shadow-blue-500/15 text-white text-xs sm:text-sm font-semibold rounded-xl px-2.5 sm:px-4 py-1.5 sm:py-2 flex items-center gap-1.5 shadow-md shadow-blue-500/5 active:scale-97 transition-all cursor-pointer select-none border border-blue-600"
        >
          <Plus className="w-4 h-4 shrink-0" style={{ strokeWidth: 2.5 }} />
          <span className="hidden md:inline">Quick Task</span>
        </button>

        {/* Theme Toggler Icon */}
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        >
          {theme === 'light' ? <Moon className="w-5 h-5 shrink-0" /> : <Sun className="w-5 h-5 shrink-0 animate-in spin-in-12 duration-300" />}
        </button>

        {/* Notifications Menu Trigger */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className={`p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer ${
              notificationsOpen ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white' : ''
            }`}
            title="Notifications"
          >
            <Bell className="w-5 h-5 shrink-0" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse border border-white dark:border-slate-900" />
          </button>

          {/* Notifications Dropdown Panel */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2.5 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-150">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-widest">Notifications</span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold cursor-pointer hover:underline">Mark all read</span>
              </div>
              <div className="divide-y divide-slate-50 dark:divide-slate-850 max-h-64 overflow-y-auto">
                {mockNotifications.map((notif) => (
                  <div key={notif.id} className={`p-4 gap-3 text-xs leading-normal flex flex-col hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors ${!notif.read ? 'bg-blue-50/10 dark:bg-blue-900/10' : ''}`}>
                    <div className="flex justify-between items-start">
                      <p className="text-slate-700 dark:text-slate-300 font-medium">{notif.text}</p>
                      {!notif.read && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0 mt-1" />}
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{notif.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User context setting dropdown trigger */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            {currentUser?.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs select-none shadow-sm">
                {currentUser?.initials || '??'}
              </div>
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-150 dark:border-slate-800 py-1.5 z-50 text-slate-700 dark:text-slate-300 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 select-none bg-slate-50/55 dark:bg-slate-950/55 mb-1.5">
                <span className="block text-xs font-bold text-slate-800 dark:text-slate-100 truncate leading-snug">{currentUser?.name}</span>
                <span className="block text-[10px] text-slate-400 dark:text-slate-550 truncate leading-snug">{currentUser?.email}</span>
              </div>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/settings');
                }}
                className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2 mb-0.5 cursor-pointer"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Account Settings</span>
              </button>

              <div className="px-4 py-1.5 border-t border-b border-slate-100 dark:border-slate-800 select-none bg-slate-50/40 dark:bg-slate-950/40 my-1">
                <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Fast Demo Switch</span>
              </div>
              <div className="px-2 py-0.5 max-h-40 overflow-y-auto space-y-0.5">
                {users.filter(u => u.id !== currentUser?.id).map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      signIn(u.email);
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-2 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/70 dark:hover:bg-blue-950/20 transition-all flex items-center gap-2.5 cursor-pointer truncate"
                  >
                    <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-955 flex items-center justify-center font-bold text-[9px] text-blue-600 dark:text-blue-400 shrink-0 select-none">
                      {u.initials}
                    </div>
                    <span className="truncate">{u.name}</span>
                  </button>
                ))}
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  signOut();
                }}
                className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/20 text-red-650 dark:text-red-400 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-red-400" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
