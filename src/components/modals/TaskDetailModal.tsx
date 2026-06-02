/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Calendar, User, Tag, Trash2, Edit3, MessageSquare, AlertTriangle, Send, History, Star, Target } from 'lucide-react';
import { Status, Priority, Task } from '../../types';

interface TaskDetailModalProps {
  isOpen: boolean;
  taskId: string | null;
  onClose: () => void;
  onEditClick: (task: Task) => void;
}

export default function TaskDetailModal({ isOpen, taskId, onClose, onEditClick }: TaskDetailModalProps) {
  const {
    tasks,
    projects,
    users,
    comments,
    currentUser,
    updateTask,
    deleteTask,
    addComment,
    addToast,
    activities,
    focusedTaskId,
    setFocusedTaskId,
  } = useApp();

  const [newCommentBody, setNewCommentBody] = useState('');

  if (!isOpen || !taskId) return null;

  const task = tasks.find((t) => t.id === taskId);
  if (!task) return null;

  const project = projects.find((p) => p.id === task.projectId);
  // Get members of this project for assignee selection dropdown
  const allowedAssignees = users.filter((u) => {
    if (!project) return true;
    return project.memberIds.includes(u.id);
  });

  const taskAssignee = users.find((u) => u.id === task.assigneeId);
  const taskComments = comments.filter((c) => c.taskId === task.id);

  // Live status or priority updates in overlay
  const handleStatusChange = (status: Status) => {
    updateTask(task.id, { status });
  };

  const handlePriorityChange = (priority: Priority) => {
    updateTask(task.id, { priority });
  };

  const handleAssigneeChange = (assigneeId: string) => {
    updateTask(task.id, { assigneeId: assigneeId || null });
  };

  const handleDueDateChange = (dueDate: string) => {
    // Validate that date is not in the past relative to 2026-06-02
    if (dueDate) {
      const selectedDate = new Date(dueDate);
      const referenceDate = new Date('2026-06-02');
      selectedDate.setHours(0, 0, 0, 0);
      referenceDate.setHours(0, 0, 0, 0);

      if (selectedDate < referenceDate) {
        addToast('Due date cannot be in the past!', 'error');
        return;
      }
    }
    updateTask(task.id, { dueDate: dueDate || null });
  };

  // Delete handler
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      deleteTask(task.id);
      onClose();
    }
  };

  // Compile comment
  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentBody.trim()) return;

    const success = addComment(task.id, newCommentBody.trim());
    if (success) {
      setNewCommentBody('');
    }
  };

  // Standard visual styling helper for Priority badges
  const getPriorityStyle = (priority: Priority) => {
    switch (priority) {
      case 'low':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'medium':
        return 'bg-blue-100/80 text-blue-800 border-blue-200';
      case 'high':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Filter and sort activities for the active task
  const taskActivities = (activities || [])
    .filter((act) => act.taskId === task.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Render a human-friendly description for any log entry
  const renderActivityMessage = (act: any) => {
    const statusLabel = (s: string) => {
      const names: Record<string, string> = {
        todo: 'To Do',
        in_progress: 'In Progress',
        in_review: 'In Review',
        done: 'Done'
      };
      return names[s] || s;
    };
    
    switch (act.actionType) {
      case 'creation':
        return (
          <span>
            created this task
          </span>
        );
      case 'status_change':
        return (
          <span>
            changed status from <span className="line-through text-slate-400 dark:text-slate-500">{statusLabel(act.oldValue || '')}</span> to <span className="font-semibold text-blue-600 dark:text-blue-400">{statusLabel(act.newValue || '')}</span>
          </span>
        );
      case 'assignment_change': {
        const oldUser = users.find(u => u.id === act.oldValue);
        const newUser = users.find(u => u.id === act.newValue);
        if (!act.oldValue && act.newValue) {
          return (
            <span>
              assigned this task to <span className="font-semibold text-slate-700 dark:text-slate-300">{newUser?.name || 'someone'}</span>
            </span>
          );
        } else if (act.oldValue && !act.newValue) {
          return (
            <span>
              removed assignee (previously <span className="text-slate-500 dark:text-slate-400">{oldUser?.name}</span>)
            </span>
          );
        } else {
          return (
            <span>
              reassigned from <span className="text-slate-500 dark:text-slate-400">{oldUser?.name || 'Unassigned'}</span> to <span className="font-semibold text-slate-700 dark:text-slate-300">{newUser?.name}</span>
            </span>
          );
        }
      }
      case 'priority_change':
        return (
          <span>
            updated priority from <span className="capitalize text-slate-500 dark:text-slate-400">{act.oldValue}</span> to <span className="font-semibold capitalize text-slate-800 dark:text-slate-200">{act.newValue}</span>
          </span>
        );
      case 'due_date_change': {
        const formatD = (d: string | null) => d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'None';
        return (
          <span>
            changed due date from <span className="text-slate-400 dark:text-slate-500">{formatD(act.oldValue)}</span> to <span className="font-medium text-slate-700 dark:text-slate-300">{formatD(act.newValue)}</span>
          </span>
        );
      }
      default:
        return <span>performed an action</span>;
    }
  };

  return (
    <div id="task-detail-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Content drawer/modal */}
      <div className="relative bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col h-[85vh]">
        {/* Header toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-semibold px-2.5 py-0.5 rounded-full text-white uppercase tracking-wider"
              style={{ backgroundColor: project?.color || '#3b82f6' }}
            >
              {project?.name || 'TaskFlow'}
            </span>
            <span className="text-slate-400 text-xs">ID: {task.id}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Focus / Highlight toggle */}
            <button
              onClick={() => {
                const newFocused = focusedTaskId === task.id ? null : task.id;
                setFocusedTaskId(newFocused);
                if (newFocused) {
                  addToast(`"${task.title}" is now set as your active Focus!`, 'success');
                } else {
                  addToast('Focus cleared.', 'success');
                }
              }}
              className={`p-1.5 rounded-lg border transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                focusedTaskId === task.id
                  ? 'bg-amber-50 dark:bg-amber-950/25 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 font-bold shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Set as your active high-priority task focus"
            >
              <Target className={`w-4 h-4 ${focusedTaskId === task.id ? 'text-amber-500 animate-pulse' : 'text-slate-400'}`} />
              <span>{focusedTaskId === task.id ? 'Focused Active' : 'Set Focus'}</span>
            </button>

            {/* Edit */}
            <button
              onClick={() => onEditClick(task)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Edit full task properties"
            >
              <Edit3 className="w-4 h-4" />
              <span className="hidden sm:inline">Edit Form</span>
            </button>

            {/* Delete */}
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Delete task from project"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Delete</span>
            </button>

            <span className="w-px h-5 bg-slate-200 mx-1" />

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content body divided into Two Columns */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* LEFT: Task Fields (Width: 3/5 on big, scrollable) */}
          <div className="flex-1 overflow-y-auto p-6 md:border-r border-slate-100 space-y-6">
            <div>
              <h1 className="text-2xl font-bold font-sans text-slate-900 tracking-tight leading-snug">
                {task.title}
              </h1>
            </div>

            {/* Description card */}
            <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 font-sans">
                Description
              </h3>
              {task.description ? (
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {task.description}
                </p>
              ) : (
                <p className="text-slate-400 text-sm italic">No description provided for this task.</p>
              )}
            </div>

            {/* Editing field grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3">
              {/* Status Select */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  Status
                </span>
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(e.target.value as Status)}
                  className="w-full text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="in_review">In Review</option>
                  <option value="done">Done</option>
                </select>
              </div>

              {/* Priority Select */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  Priority
                </span>
                <select
                  value={task.priority}
                  onChange={(e) => handlePriorityChange(e.target.value as Priority)}
                  className={`w-full text-sm border rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-500 md:${getPriorityStyle(task.priority)}`}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              {/* Assignee Selection */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> Assignee
                </span>
                <select
                  value={task.assigneeId || ''}
                  onChange={(e) => handleAssigneeChange(e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                >
                  <option value="">Unassigned</option>
                  {allowedAssignees.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Due Date field */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Due Date
                </span>
                <input
                  type="date"
                  value={task.dueDate || ''}
                  onChange={(e) => handleDueDateChange(e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Labels section */}
            <div className="pt-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1 mb-2">
                <Tag className="w-3.5 h-3.5" /> Labels
              </span>
              <div className="flex flex-wrap gap-1.5">
                {task.labels.length > 0 ? (
                  task.labels.map((lbl, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-slate-100 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-full font-medium"
                    >
                      {lbl}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No labels assigned</span>
                )}
              </div>
            </div>

            {/* Task Activity Log */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-4">
                <History className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> Task Activity Log
              </span>
              {taskActivities.length > 0 ? (
                <div className="relative pl-6 space-y-4 before:absolute before:top-2 before:bottom-2 before:left-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800/85">
                  {taskActivities.map((act) => {
                    const displayTime = new Date(act.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                    
                    return (
                      <div key={act.id} className="relative flex gap-3 text-xs leading-normal">
                        {/* Bullet circle */}
                        <div className="absolute -left-[22px] top-1 w-2.5 h-2.5 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center z-10 shrink-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
                        </div>
                        
                        {/* Avatar initials badge */}
                        <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[8px] font-bold text-slate-500 dark:text-slate-450 shrink-0 select-none border border-slate-200 dark:border-slate-700">
                          {act.userInitials}
                        </div>
                        
                        {/* Text description */}
                        <div className="flex-1 text-slate-600 dark:text-slate-400 font-sans">
                          <span className="font-bold text-slate-800 dark:text-slate-200 mr-1">{act.userName}</span>
                          {renderActivityMessage(act)}
                          <span className="block text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">{displayTime}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-slate-50/50 dark:bg-slate-900/30 border border-dashed border-slate-150 dark:border-slate-800/50 rounded-2xl p-4 text-center">
                  <History className="w-6 h-6 text-slate-300 dark:text-slate-700 mx-auto mb-1.5" />
                  <p className="text-[11px] text-slate-450 dark:text-slate-550 font-medium">No activity logged yet.</p>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 max-w-[220px] mx-auto mt-0.5 leading-normal">
                    Real-time logs will automatically populate when task properties are updated.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Comments Thread (Width: 2/5 on desktop, fixed layout) */}
          <div className="w-full md:w-96 overflow-hidden flex flex-col bg-slate-50 border-t md:border-t-0 border-slate-100 shrink-0">
            {/* Thread Header */}
            <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-2 shrink-0 bg-white">
              <MessageSquare className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-700">Discussion</span>
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 text-xs rounded-full font-bold">
                {taskComments.length}
              </span>
            </div>

            {/* List of comments */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {taskComments.length > 0 ? (
                taskComments.map((comment) => {
                  const author = users.find((u) => u.id === comment.authorId);
                  const displayDate = new Date(comment.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div key={comment.id} className="flex gap-3 leading-relaxed">
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-slate-200 border border-white shrink-0 flex items-center justify-center font-semibold text-xs text-slate-700 select-none shadow-xs">
                        {author?.initials || comment.authorId.substring(0, 2).toUpperCase()}
                      </div>

                      {/* Bubble */}
                      <div className="flex-1 min-w-0 bg-white rounded-2xl border border-slate-100 p-3 shadow-xs">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-xs font-bold text-slate-800 truncate">
                            {author?.name || 'Unknown User'}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0">{displayDate}</span>
                        </div>
                        <p className="text-slate-700 text-xs font-sans break-words whitespace-pre-wrap">
                          {comment.body}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <MessageSquare className="w-8 h-8 text-slate-300 mb-2" />
                  <span className="text-xs text-slate-400 font-medium">No discussions yet</span>
                  <p className="text-[10px] text-slate-400/80 max-w-[200px] mt-0.5">
                    Ask a question or pin feedback to keep the context right context here!
                  </p>
                </div>
              )}
            </div>

            {/* Comment Composer */}
            <form
              onSubmit={handleSendComment}
              className="p-4 border-t border-slate-100 bg-white shrink-0 flex gap-2 items-center"
            >
              <input
                type="text"
                placeholder="Write a comment..."
                value={newCommentBody}
                onChange={(e) => setNewCommentBody(e.target.value)}
                className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!newCommentBody.trim()}
                className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 text-white disabled:text-slate-400 rounded-xl transition-all active:scale-95 shrink-0"
                title="Send comment"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
