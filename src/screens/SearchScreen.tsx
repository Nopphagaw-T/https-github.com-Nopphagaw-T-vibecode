/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Folder, User, CheckSquare, MessageSquare, Tag, X, Calendar, Circle } from 'lucide-react';
import { Status, Priority } from '../types';

interface SearchScreenProps {
  onTaskClick: (taskId: string) => void;
}

export default function SearchScreen({ onTaskClick }: SearchScreenProps) {
  const { tasks, projects, users, searchQuery, setSearchQuery } = useApp();

  const [selectedProjectId, setSelectedProjectId] = useState<string | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<Status | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'all'>('all');
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string | 'all'>('all');

  // Filter tasks globally based on search and selected chips
  const matchedTasks = tasks.filter((task) => {
    const text = (task.title + ' ' + task.description).toLowerCase();
    const matchesSearch = text.includes(searchQuery.toLowerCase());

    const matchesProject = selectedProjectId === 'all' || task.projectId === selectedProjectId;
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
    const matchesAssignee = selectedAssigneeId === 'all' || task.assigneeId === selectedAssigneeId;

    return matchesSearch && matchesProject && matchesStatus && matchesPriority && matchesAssignee;
  });

  const handleResetFilters = () => {
    setSelectedProjectId('all');
    setSelectedStatus('all');
    setSelectedPriority('all');
    setSelectedAssigneeId('all');
  };

  const handleClearAll = () => {
    setSearchQuery('');
    handleResetFilters();
  };

  // Helper styles
  const getPriorityStyle = (priority: Priority) => {
    switch (priority) {
      case 'low':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'medium':
        return 'bg-blue-50 text-blue-700 border-blue-150';
      case 'high':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'urgent':
        return 'bg-red-50 text-red-700 border-red-200';
    }
  };

  const getStatusBadge = (status: Status) => {
    switch (status) {
      case 'todo':
        return 'bg-slate-100 text-slate-600';
      case 'in_progress':
        return 'bg-blue-600/10 text-blue-600';
      case 'in_review':
        return 'bg-amber-500/10 text-amber-600';
      case 'done':
        return 'bg-emerald-600/10 text-emerald-600';
    }
  };

  const isFiltered =
    selectedProjectId !== 'all' ||
    selectedStatus !== 'all' ||
    selectedPriority !== 'all' ||
    selectedAssigneeId !== 'all';

  return (
    <div id="search-screen" className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-sans flex-1 flex flex-col">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Search className="w-6 h-6 text-blue-600" />
          Search Results
        </h1>
        {searchQuery ? (
          <p className="text-xs text-slate-500 mt-1">
            Showing results for query: <span className="font-bold text-slate-700 font-mono">"{searchQuery}"</span> across all team workspaces.
          </p>
        ) : (
          <p className="text-xs text-slate-500 mt-1 mb-2">
            Type keyword in the header search input above or browse items using filters.
          </p>
        )}
      </div>

      {/* Advanced Filter pill selects */}
      <div className="bg-slate-50/60 rounded-2xl border border-slate-150/70 p-4.5 shrink-0 flex flex-wrap items-center gap-3">
        {/* Project Selector */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-semibold whitespace-nowrap">Project:</span>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-semibold text-slate-700 focus:outline-none"
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Selector */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-semibold whitespace-nowrap">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as Status | 'all')}
            className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-semibold text-slate-700 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="in_review">In Review</option>
            <option value="done">Done</option>
          </select>
        </div>

        {/* Priority Selector */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-semibold whitespace-nowrap">Priority:</span>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value as Priority | 'all')}
            className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-semibold text-slate-700 focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Employee Selector */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-semibold whitespace-nowrap">Assignee:</span>
          <select
            value={selectedAssigneeId}
            onChange={(e) => setSelectedAssigneeId(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-semibold text-slate-700 focus:outline-none"
          >
            <option value="all">Everyone</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        {/* Clear control */}
        {(isFiltered || searchQuery) && (
          <button
            onClick={handleClearAll}
            className="text-xs text-rose-500 font-bold hover:text-rose-700 transition-colors flex items-center gap-1 cursor-pointer pl-1"
          >
            <X className="w-4 h-4" />
            <span>Reset constraints</span>
          </button>
        )}
      </div>

      {/* Grid Content Results */}
      <div className="flex-1 min-h-0">
        {matchedTasks.length > 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-3.5">Task Title</th>
                    <th className="px-6 py-3.5">Project</th>
                    <th className="px-6 py-3.5">Assignee</th>
                    <th className="px-6 py-3.5">Priority</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-center">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {matchedTasks.map((task) => {
                    const taskProject = projects.find((p) => p.id === task.projectId);
                    const taskAssignee = users.find((u) => u.id === task.assigneeId);
                    const isOverdue = task.dueDate && task.dueDate < '2026-06-02' && task.status !== 'done';

                    return (
                      <tr
                        key={task.id}
                        onClick={() => onTaskClick(task.id)}
                        className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                      >
                        {/* Title & tags */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors leading-tight">
                              {task.title}
                            </span>
                            {task.labels.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {task.labels.map((lbl, idx) => (
                                  <span key={idx} className="text-[9px] font-bold bg-slate-50 border border-slate-150 text-slate-400 px-1.5 py-0.2 rounded-md uppercase">
                                    {lbl}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Project name with badge */}
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: taskProject?.color || '#cbd5e1' }}
                            />
                            <span className="text-slate-700">{taskProject?.name || 'Unknown'}</span>
                          </div>
                        </td>

                        {/* Assignee initials fallback */}
                        <td className="px-6 py-4 whitespace-nowrap text-xs">
                          <div className="flex items-center gap-2 font-medium text-slate-700">
                            <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[9px] text-slate-500 shadow-2xs select-none">
                              {taskAssignee ? taskAssignee.initials : '—'}
                            </div>
                            <span className="truncate max-w-[100px]">
                              {taskAssignee ? taskAssignee.name : 'Unassigned'}
                            </span>
                          </div>
                        </td>

                        {/* Priority */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getPriorityStyle(task.priority)}`}>
                            {task.priority}
                          </span>
                        </td>

                        {/* Status badge */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.8 rounded-full border-none ${getStatusBadge(task.status)}`}>
                            {task.status.replace('_', ' ')}
                          </span>
                        </td>

                        {/* Due Date */}
                        <td className="px-4 py-4 whitespace-nowrap text-center text-xs font-mono font-semibold">
                          {task.dueDate ? (
                            <span className={isOverdue ? 'text-red-650' : 'text-slate-500'}>
                              {task.dueDate}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Empty Search results state */
          <div className="bg-white border border-slate-150/50 rounded-2xl p-16 text-center max-w-sm mx-auto mt-6">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <span className="text-sm font-bold text-slate-800">No matching search items</span>
            <p className="text-xs text-slate-400 max-w-[280px] mx-auto mt-1 leading-relaxed">
              We couldn't find items matching your search requirements. Try expanding your filters.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-4 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
            >
              Reset constraints
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
