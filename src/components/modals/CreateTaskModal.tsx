/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X } from 'lucide-react';
import { Task, Status, Priority } from '../../types';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Optional prefilled project. Useful when triggered from a project page directly.
  defaultProjectId?: string;
  // Optional prefilled status if triggered from Kanban column
  defaultStatus?: Status;
  // If editing an existing task
  editTask?: Task | null;
}

export default function CreateTaskModal({
  isOpen,
  onClose,
  defaultProjectId = '',
  defaultStatus = 'todo',
  editTask = null,
}: CreateTaskModalProps) {
  const { projects, users, createTask, updateTask, addToast } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<Status>('todo');
  const [dueDate, setDueDate] = useState('');
  const [labelsText, setLabelsText] = useState('');
  const [errors, setErrors] = useState<{ title?: string; projectId?: string; dueDate?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Re-run initialization state whenever editTask or preselected options change
  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title);
      setDescription(editTask.description);
      setProjectId(editTask.projectId);
      setAssigneeId(editTask.assigneeId || '');
      setPriority(editTask.priority);
      setStatus(editTask.status);
      setDueDate(editTask.dueDate || '');
      setLabelsText(editTask.labels.join(', '));
    } else {
      setTitle('');
      setDescription('');
      setProjectId(defaultProjectId || (projects[0]?.id || ''));
      setAssigneeId('');
      setPriority('medium');
      setStatus(defaultStatus);
      setDueDate('');
      setLabelsText('');
    }
    setErrors({});
  }, [editTask, defaultProjectId, defaultStatus, isOpen, projects]);

  // Handle setting active project change -> reset or update assignee list
  const activeProject = projects.find((p) => p.id === projectId);
  // Filter allowable members for picker
  const allowableUsers = users.filter((u) => {
    if (!activeProject) return true;
    return activeProject.memberIds.includes(u.id);
  });

  // Keep assignee selected only if still in project members, else reset
  useEffect(() => {
    if (activeProject && assigneeId) {
      const isStillMember = activeProject.memberIds.includes(assigneeId);
      if (!isStillMember) {
        setAssigneeId('');
      }
    }
  }, [projectId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const activeErrors: typeof errors = {};

    if (!title.trim()) {
      activeErrors.title = 'Task title is required';
    } else if (title.trim().length > 120) {
      activeErrors.title = 'Title must be 120 characters or less';
    }

    if (!projectId) {
      activeErrors.projectId = 'Please select a project';
    }

    // Due Date validation: must not be in the past (Current reference date: 2026-06-02)
    if (dueDate) {
      const selectedDate = new Date(dueDate);
      const referenceDate = new Date('2026-06-02');
      // Normalize to midnight
      selectedDate.setHours(0, 0, 0, 0);
      referenceDate.setHours(0, 0, 0, 0);

      if (selectedDate < referenceDate) {
        activeErrors.dueDate = 'Due date cannot be in the past';
      }
    }

    if (Object.keys(activeErrors).length > 0) {
      setErrors(activeErrors);
      // Force focus to first invalid element
      return;
    }

    setIsSubmitting(true);

    const labels = labelsText
      .split(',')
      .map((l) => l.trim().toLowerCase())
      .filter((l) => l.length > 0);

    setTimeout(() => {
      const taskPayload = {
        projectId,
        title: title.trim(),
        description: description.trim(),
        assigneeId: assigneeId || null,
        priority,
        status,
        dueDate: dueDate || null,
        labels,
      };

      if (editTask) {
        updateTask(editTask.id, taskPayload);
      } else {
        createTask(taskPayload);
      }

      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div id="create-task-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Content Form Card */}
      <div className="relative bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-xl font-semibold text-slate-900 font-sans">
            {editTask ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col overflow-y-auto p-6 space-y-4">
          {/* Title */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Design homepage wireframe, Draft launch proposal"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              maxLength={120}
              className={`w-full px-4 py-2 text-sm rounded-xl border transition-all ${
                errors.title
                  ? 'border-red-300 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500'
                  : 'border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500'
              }`}
              autoFocus
            />
            {errors.title && (
              <span className="text-xs text-red-500 mt-1">{errors.title}</span>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Description
            </label>
            <textarea
              placeholder="Provide context, links, or core checklist of requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Project */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Project <span className="text-red-500">*</span>
              </label>
              <select
                value={projectId}
                onChange={(e) => {
                  setProjectId(e.target.value);
                  if (errors.projectId) setErrors((prev) => ({ ...prev, projectId: undefined }));
                }}
                disabled={!!editTask} // project shouldn't be mutable after creation for board consistency
                className={`w-full px-3 py-2 text-sm rounded-xl border bg-white ${
                  errors.projectId ? 'border-red-300' : 'border-slate-200'
                }`}
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {errors.projectId && (
                <span className="text-xs text-red-500 mt-1">{errors.projectId}</span>
              )}
            </div>

            {/* Assignee */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Assignee
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border bg-white border-slate-200"
              >
                <option value="">Unassigned</option>
                {allowableUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.initials})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Priority */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 text-sm rounded-xl border bg-white border-slate-200 text-slate-700 font-sans"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className="w-full px-3 py-2 text-sm rounded-xl border bg-white border-slate-200 text-slate-700 font-sans"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            {/* Due Date */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  if (errors.dueDate) setErrors((prev) => ({ ...prev, dueDate: undefined }));
                }}
                className={`w-full px-3 py-1.5 text-sm rounded-xl border bg-white ${
                  errors.dueDate ? 'border-red-300' : 'border-slate-200'
                }`}
              />
              {errors.dueDate && (
                <span className="text-xs text-red-500 mt-1">{errors.dueDate}</span>
              )}
            </div>
          </div>

          {/* Labels / Tags */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Labels / Tags (comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. design, qa, frontend, ops"
              value={labelsText}
              onChange={(e) => setLabelsText(e.target.value)}
              className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
            />
            <span className="text-[11px] text-slate-400 mt-0.5">
              Enter descriptors separated by commas (e.g. content, copywriting)
            </span>
          </div>

          {/* Buttons Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-98 transition-all flex items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                editTask ? 'Save Changes' : 'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
