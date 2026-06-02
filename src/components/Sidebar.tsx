/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LayoutDashboard, FolderKanban, Settings, ChevronLeft, ChevronRight, Star, LogOut, Kanban } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (c: boolean) => void;
}

export default function Sidebar({ isOpen, onClose, isCollapsed, setIsCollapsed }: SidebarProps) {
  const { projects, signOut, currentUser } = useApp();
  const location = useLocation();

  const handleSignOut = () => {
    signOut();
  };

  // Nav menu list
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'All Projects', path: '/projects', icon: FolderKanban },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile drawer backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar navigation panel */}
      <aside
        id="app-sidebar"
        className={`fixed lg:sticky top-0 left-0 h-screen bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 z-40 flex flex-col border-r border-slate-200 dark:border-slate-800 shrink-0 transition-all duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          isCollapsed ? 'w-[72px]' : 'w-[240px]'
        }`}
      >
        {/* Header Branding */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800">
          <Link to="/" className="flex items-center gap-2.5 truncate font-sans font-bold">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/20 active:scale-95 transition-transform">
              <Kanban className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                TaskFlow
              </span>
            )}
          </Link>

          {/* Desktop sidebar expand/collapse chevron toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Primary nav list */}
        <nav className="flex-grow overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin">
          <div className="space-y-1">
            {navItems.map((item) => {
              const IconComp = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group duration-150 ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-bold border-l-2 border-blue-600 dark:border-blue-500 rounded-l-none'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-850'
                  }`}
                  title={item.name}
                >
                  <IconComp className={`w-5 h-5 shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                  {!isCollapsed && <span className="truncate">{item.name}</span>}
                </NavLink>
              );
            })}
          </div>

          {/* Starred/Shortcut Projects Section */}
          <div className="pt-6">
            {!isCollapsed && (
              <div className="px-3 mb-2 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Quick Shortcuts
                </span>
                <Star className="w-3 h-3 text-slate-400 dark:text-slate-500 fill-slate-400 dark:fill-slate-500" />
              </div>
            )}

            <div className="space-y-1">
              {projects.map((proj) => {
                const isActive = location.pathname === `/projects/${proj.id}`;
                return (
                  <NavLink
                    key={proj.id}
                    to={`/projects/${proj.id}`}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-850'
                    }`}
                    title={proj.name}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: proj.color }}
                    />
                    {!isCollapsed && <span className="truncate">{proj.name}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>
        </nav>

        {/* User context footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-950/45">
          {currentUser && (
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-2 py-1.5 mb-1.5`}>
              <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 flex items-center justify-center font-bold text-xs text-blue-600 dark:text-blue-400 shrink-0 select-none shadow-sm">
                {currentUser.initials}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{currentUser.name}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{currentUser.email}</span>
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleSignOut}
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center' : 'gap-3 px-3'
            } py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer`}
            title="Sign Out"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
