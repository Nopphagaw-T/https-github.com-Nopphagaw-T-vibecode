/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Status, Priority, Task } from '../types';
import {
  Trello,
  List,
  Search,
  Plus,
  Calendar,
  MessageSquare,
  User as UserIcon,
  ChevronsUpDown,
  ChevronDown,
  X,
  Filter,
  ArrowLeft,
  Settings,
  CircleDot
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProjectDetailScreenProps {
  onAddTaskClick: (projectId: string, status?: Status) => void;
  onTaskClick: (taskId: string) => void;
}

const COLUMNS: { status: Status; label: string; color: string }[] = [
  { status: 'todo', label: 'To Do', color: 'border-slate-200' },
  { status: 'in_progress', label: 'In Progress', color: 'border-blue-500' },
  { status: 'in_review', label: 'In Review', color: 'border-amber-500' },
  { status: 'done', label: 'Done', color: 'border-emerald-500' },
];

export default function ProjectDetailScreen({ onAddTaskClick, onTaskClick }: ProjectDetailScreenProps) {
  const { projectId } = useParams<{ projectId: string }>();
  const { projects, tasks, users, moveTask, updateTask } = useApp();

  const [activeTab, setActiveTab] = useState<'board' | 'list'>('board');
  const [localSearch, setLocalSearch] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'all'>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string | 'all'>('all');

  // Sorting state for list view
  const [sortField, setSortField] = useState<'title' | 'assignee' | 'priority' | 'status' | 'dueDate' | 'comments'>('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Find active project
  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    return (
      <div className="p-12 text-center max-w-md mx-auto">
        <h2 className="text-xl font-bold text-slate-800">Project Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">The project you are trying to access does not exist or has been removed.</p>
        <Link to="/" className="mt-4 inline-block text-xs font-semibold text-blue-600 hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // Find users belonging to this project (Section 6.7)
  const projectMembers = users.filter((u) => project.memberIds.includes(u.id));

  // Filter Tasks belonging to project
  const projectTasks = tasks.filter((t) => t.projectId === project.id);

  // Apply filters: search term, priority, assignee
  const filteredTasks = projectTasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(localSearch.toLowerCase()) ||
      task.description.toLowerCase().includes(localSearch.toLowerCase());

    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;

    const matchesAssignee = selectedAssignee === 'all' || task.assigneeId === selectedAssignee;

    return matchesSearch && matchesPriority && matchesAssignee;
  });

  // Sort Tasks for table List view
  const sortedTasksForTable = [...filteredTasks].sort((a, b) => {
    let comparison = 0;

    if (sortField === 'title') {
      comparison = a.title.localeCompare(b.title);
    } else if (sortField === 'assignee') {
      const uA = users.find((u) => u.id === a.assigneeId)?.name || 'ZUnassigned';
      const uB = users.find((u) => u.id === b.assigneeId)?.name || 'ZUnassigned';
      comparison = uA.localeCompare(uB);
    } else if (sortField === 'priority') {
      const priorityOrder = { low: 0, medium: 1, high: 2, urgent: 3 };
      comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
    } else if (sortField === 'status') {
      const statusOrder = { todo: 0, in_progress: 1, in_review: 2, done: 3 };
      comparison = statusOrder[a.status] - statusOrder[b.status];
    } else if (sortField === 'dueDate') {
      const dA = a.dueDate || '9999-99-99';
      const dB = b.dueDate || '9999-99-99';
      comparison = dA.localeCompare(dB);
    } else if (sortField === 'comments') {
      comparison = a.commentCount - b.commentCount;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Drag and drop event handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: Status) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      moveTask(taskId, targetStatus);
    }
  };

  const clearAllFilters = () => {
    setLocalSearch('');
    setSelectedPriority('all');
    setSelectedAssignee('all');
  };

  // Badging helper styles
  const getPriorityStyle = (priority: Priority) => {
    switch (priority) {
      case 'low':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'medium':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'high':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'urgent':
        return 'bg-red-50 text-red-700 border-red-200';
    }
  };

  // Checks if any filter is active
  const isFiltered = localSearch !== '' || selectedPriority !== 'all' || selectedAssignee !== 'all';

  return (
    <div id="project-detail-screen" className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto flex flex-col min-h-[calc(100vh-4rem)] font-sans">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 pb-1 border-b border-slate-100 shrink-0">
        <div className="flex items-start gap-3">
          <Link
            to="/projects"
            className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors shrink-0 mt-1"
            title="Back to all projects"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full shrink-0 animate-pulse" style={{ backgroundColor: project.color }} />
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-sans">
                {project.name}
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl font-medium leading-relaxed">
              {project.description || 'Marketing campaigns and project assets launch board.'}
            </p>
          </div>
        </div>

        {/* View Toggle + Action Button */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Board/List selector segment */}
          <div className="flex items-center border border-slate-200 rounded-xl p-0.5.5 bg-slate-50 shrink-0 select-none m-0.5">
            <button
              onClick={() => setActiveTab('board')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                activeTab === 'board'
                  ? 'bg-white shadow-sm text-blue-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Trello className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                activeTab === 'list'
                  ? 'bg-white shadow-sm text-blue-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>

          <button
            onClick={() => onAddTaskClick(project.id)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl px-4 py-2 flex items-center gap-1.5 shadow-md shadow-blue-500/5 active:scale-97 transition-all cursor-pointer inline-flex"
          >
            <Plus className="w-4 h-4" style={{ strokeWidth: 2.5 }} />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* SEARCH AND FILTER SEGMENTS */}
      <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-4 shrink-0 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {/* Live Search inside project */}
          <div className="relative w-full max-w-xs shrink-0">
            <Search className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 w-4 h-4 self-center top-[11px]" />
            <input
              type="text"
              placeholder="Filter tasks in this project..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full text-xs bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
            />
          </div>

          {/* Priority filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Priority:</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value as Priority | 'all')}
              className="text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 font-semibold focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Assignee selection */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Assignee:</span>
            <select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 font-semibold focus:outline-none max-w-[150px]"
            >
              <option value="all">Everyone</option>
              {projectMembers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* Active chips indicator */}
          {isFiltered && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-rose-500 font-medium hover:text-rose-700 transition-colors flex items-center gap-1 cursor-pointer pl-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear filters</span>
            </button>
          )}
        </div>

        <div className="text-xs text-slate-400 font-medium self-end md:self-auto shrink-0 select-none">
          {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} found
        </div>
      </div>

      {/* VIEW PANEL SELECTION (Kanban / List Table) */}
      <div className="flex-1 min-h-0 min-w-0">
        <AnimatePresence mode="wait">
          {activeTab === 'board' ? (
            /* KANBAN BOARD VIEW */
            <motion.div
              key="board"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.15 }}
              className="relative h-full select-none"
            >
              {filteredTasks.length === 0 && isFiltered ? (
                /* Filter Empty State */
                <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center max-w-sm mx-auto mt-6">
                  <Filter className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-slate-800">No tasks match your filters</h3>
                  <p className="text-xs text-slate-400 max-w-[280px] mx-auto mt-1 leading-normal">
                    Try adjusting the search query, selecting another priority, or clearing assignee constraints.
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="mt-4 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Clear Filter Criteria
                  </button>
                </div>
              ) : (
                /* Grid Columns list side-by-side */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-6 overflow-x-auto min-h-[500px]">
                  {COLUMNS.map((column) => {
                    const columnTasks = filteredTasks.filter((t) => t.status === column.status);

                    return (
                      <div
                        key={column.status}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, column.status)}
                        className={`flex flex-col bg-slate-50 border border-slate-100 rounded-2xl p-4.5 min-h-[400px] shrink-0 w-full transition-all`}
                      >
                        {/* Column Header */}
                        <div className="flex items-center justify-between pb-3 shrink-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-700 tracking-tight">{column.label}</span>
                            <span className="bg-slate-200/60 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {columnTasks.length}
                            </span>
                          </div>
                          <button
                            onClick={() => onAddTaskClick(project.id, column.status)}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors cursor-pointer"
                            title={`Add task into ${column.label}`}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* List items holding tasks */}
                        <div className="flex-1 overflow-y-auto space-y-2.5 mt-1 pr-0.5.5">
                          {columnTasks.length > 0 ? (
                            columnTasks.map((task) => {
                              const assignee = users.find((u) => u.id === task.assigneeId);
                              const isOverdue = task.dueDate && task.dueDate < '2026-06-02' && task.status !== 'done';

                              return (
                                <div
                                  key={task.id}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, task.id)}
                                  onClick={() => onTaskClick(task.id)}
                                  className="group bg-white rounded-xl border border-slate-100 hover:border-slate-200 shadow-2xs hover:shadow-sm p-4 transition-all duration-150 cursor-grab active:cursor-grabbing text-left"
                                >
                                  {/* Badges strip */}
                                  <div className="flex flex-wrap gap-1 items-center pb-2.5">
                                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getPriorityStyle(task.priority)}`}>
                                      {task.priority}
                                    </span>
                                    {task.labels.slice(0, 2).map((lbl, idx) => (
                                      <span
                                        key={idx}
                                        className="text-[9px] font-bold uppercase bg-slate-50 border border-slate-150 text-slate-500 px-1.5 py-0.5 rounded-md"
                                      >
                                        {lbl}
                                      </span>
                                    ))}
                                  </div>

                                  {/* Title & description */}
                                  <h4 className="text-sm font-semibold text-slate-800 tracking-tight leading-snug group-hover:text-blue-600 transition-colors">
                                    {task.title}
                                  </h4>
                                  {task.description && (
                                    <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                                      {task.description}
                                    </p>
                                  )}

                                  {/* Bottom stats row */}
                                  <div className="flex items-center justify-between pt-3.5 mt-3.5 border-t border-slate-50 shrink-0">
                                    {/* Due date tag */}
                                    {task.dueDate ? (
                                      <div className={`flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-md ${
                                        isOverdue ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'
                                      }`}>
                                        <Calendar className="w-3 h-3" />
                                        <span className="font-mono">{task.dueDate.replace('2026-', '')}</span>
                                      </div>
                                    ) : (
                                      <span className="w-1" />
                                    )}

                                    {/* Right attributes: Comment count bubble & assignee initial */}
                                    <div className="flex items-center gap-2.5">
                                      {task.commentCount > 0 && (
                                        <div className="flex items-center gap-1 text-slate-400" title={`${task.commentCount} comments`}>
                                          <MessageSquare className="w-3.5 h-3.5" />
                                          <span className="text-[10px] font-bold font-mono">{task.commentCount}</span>
                                        </div>
                                      )}

                                      {/* Assignee Avatar initials fallback */}
                                      <div
                                        className={`w-6 h-6 rounded-full border border-white flex items-center justify-center font-bold text-[9px] shadow-2xs select-none ${
                                          assignee ? 'bg-slate-200 text-slate-700' : 'bg-slate-50 text-slate-400 border-dashed border-slate-200'
                                        }`}
                                        title={assignee ? `Assigned to ${assignee.name}` : 'Unassigned'}
                                      >
                                        {assignee ? assignee.initials : <UserIcon className="w-3 h-3 text-slate-400" />}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            /* Column Empty state */
                            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-4 text-center mt-2.5 min-h-[140px] select-none">
                              <CircleDot className="w-6 h-6 text-slate-300 mb-1" />
                              <span className="text-xs text-slate-400 font-bold">No tasks here</span>
                              <button
                                onClick={() => onAddTaskClick(project.id, column.status)}
                                className="text-[10px] text-blue-600 hover:underline font-semibold mt-1"
                              >
                                Create Task
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          ) : (
            /* LIST TABULAR ROW VIEW */
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.15 }}
              className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-2xs pb-6 font-sans"
            >
              {sortedTasksForTable.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer select-none">
                        <th onClick={() => handleSort('title')} className="px-6 py-3.5 hover:bg-slate-100/50 hover:text-slate-800 transition-colors">
                          <div className="flex items-center gap-1">
                            <span>Title</span>
                            <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                        </th>
                        <th onClick={() => handleSort('assignee')} className="px-6 py-3.5 hover:bg-slate-100/50 hover:text-slate-800 transition-colors">
                          <div className="flex items-center gap-1">
                            <span>Assignee</span>
                            <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                        </th>
                        <th onClick={() => handleSort('priority')} className="px-6 py-3.5 hover:bg-slate-100/50 hover:text-slate-800 transition-colors">
                          <div className="flex items-center gap-1">
                            <span>Priority</span>
                            <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                        </th>
                        <th onClick={() => handleSort('status')} className="px-6 py-3.5 hover:bg-slate-100/50 hover:text-slate-800 transition-colors">
                          <div className="flex items-center gap-1">
                            <span>Status</span>
                            <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                        </th>
                        <th onClick={() => handleSort('dueDate')} className="px-6 py-3.5 hover:bg-slate-100/50 hover:text-slate-800 transition-colors">
                          <div className="flex items-center gap-1">
                            <span>Due Date</span>
                            <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                        </th>
                        <th onClick={() => handleSort('comments')} className="px-4 py-3.5 hover:bg-slate-100/50 hover:text-slate-800 transition-colors text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span>Discussion</span>
                            <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {sortedTasksForTable.map((task) => {
                        const assignee = users.find((u) => u.id === task.assigneeId);
                        const isOverdue = task.dueDate && task.dueDate < '2026-06-02' && task.status !== 'done';

                        return (
                          <tr
                            key={task.id}
                            className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                          >
                            {/* Title */}
                            <td onClick={() => onTaskClick(task.id)} className="px-6 py-3.5 min-w-[220px]">
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors leading-tight">
                                  {task.title}
                                </span>
                                {task.labels.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1.5">
                                    {task.labels.map((lbl, idx) => (
                                      <span key={idx} className="text-[9px] font-bold bg-slate-100 border border-slate-150 text-slate-500 px-1 py-0.2 rounded-md uppercase">
                                        {lbl}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Assignee Selection */}
                            <td className="px-6 py-3.5 whitespace-nowrap">
                              <div className="flex items-center gap-2 font-medium">
                                <div className="w-6.5 h-6.5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-extrabold shadow-2xs shrink-0 select-none">
                                  {assignee ? assignee.initials : '—'}
                                </div>
                                <span className="text-xs text-slate-700 truncate max-w-[120px]">
                                  {assignee ? assignee.name : 'Unassigned'}
                                </span>
                              </div>
                            </td>

                            {/* Priority */}
                            <td className="px-6 py-3.5 whitespace-nowrap">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getPriorityStyle(task.priority)}`}>
                                {task.priority}
                              </span>
                            </td>

                            {/* Live Status Inline drop select */}
                            <td className="px-6 py-3.5 whitespace-nowrap">
                              <div className="inline-flex items-center relative">
                                <select
                                  value={task.status}
                                  onChange={(e) => updateTask(task.id, { status: e.target.value as Status })}
                                  className="appearance-none font-semibold text-xs border border-slate-200 rounded-lg px-2.5 pr-6 py-1 bg-white hover:border-slate-350 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                                >
                                  <option value="todo">To Do</option>
                                  <option value="in_progress">In Progress</option>
                                  <option value="in_review">In Review</option>
                                  <option value="done">Done</option>
                                </select>
                                <ChevronDown className="w-3 h-3 absolute right-2 text-slate-400 pointer-events-none" />
                              </div>
                            </td>

                            {/* Due Date */}
                            <td className="px-6 py-3.5 whitespace-nowrap text-xs font-mono font-medium">
                              {task.dueDate ? (
                                <span className={isOverdue ? 'text-red-600 font-bold' : 'text-slate-600'}>
                                  {task.dueDate}
                                </span>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>

                            {/* Comments Count */}
                            <td onClick={() => onTaskClick(task.id)} className="px-4 py-3.5 whitespace-nowrap text-center">
                              {task.commentCount > 0 ? (
                                <div className="flex items-center justify-center gap-1 text-slate-500">
                                  <MessageSquare className="w-3.5 h-3.5 text-slate-400 animate-pulse" />
                                  <span className="text-xs font-bold font-mono text-slate-600">{task.commentCount}</span>
                                </div>
                              ) : (
                                <span className="text-slate-300 font-medium">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-16 text-center max-w-sm mx-auto">
                  <List className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-slate-800">No tasks in list view</h3>
                  <p className="text-xs text-slate-400 max-w-[280px] mx-auto mt-1 leading-normal">
                    There are no items matching active filters in list layout. Adapt search filters or create a task!
                  </p>
                  {isFiltered && (
                    <button
                      onClick={clearAllFilters}
                      className="mt-4 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
