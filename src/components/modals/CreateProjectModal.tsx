/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Check } from 'lucide-react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ACCENT_COLORS = [
  { value: '#2563EB', name: 'Blue' },
  { value: '#7C3AED', name: 'Purple' },
  { value: '#0891B2', name: 'Cyan' },
  { value: '#16A34A', name: 'Green' },
  { value: '#D97706', name: 'Amber' },
  { value: '#DC2626', name: 'Red' },
  { value: '#EC4899', name: 'Pink' },
];

export default function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const { users, currentUser, createProject } = useApp();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#2563EB');
  const [selectedMembers, setSelectedMembers] = useState<string[]>(
    currentUser ? [currentUser.id] : []
  );
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!name.trim()) {
      setErrors({ name: 'Project name is required' });
      return;
    }

    setIsSubmitting(true);

    // Simulate small latency as per PRD
    setTimeout(() => {
      createProject(name.trim(), description.trim(), color, selectedMembers);
      setIsSubmitting(false);
      // Reset state
      setName('');
      setDescription('');
      setColor('#2563EB');
      setSelectedMembers(currentUser ? [currentUser.id] : []);
      onClose();
    }, 400);
  };

  return (
    <div id="create-project-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Content card */}
      <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-xl font-semibold text-slate-900 font-sans">Create New Project</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col overflow-y-auto p-6 space-y-5">
          {/* Project Name */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Website Redesign, Marketing Campaign"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({});
              }}
              className={`w-full px-4 py-2 text-sm rounded-xl border transition-all ${
                errors.name
                  ? 'border-red-300 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500'
                  : 'border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500'
              }`}
              autoFocus
            />
            {errors.name && (
              <span className="text-xs text-red-500 mt-1">{errors.name}</span>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Description
            </label>
            <textarea
              placeholder="Provide a brief summary of the project goals..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          {/* Theme Color Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Project Color Theme
            </label>
            <div className="flex flex-wrap gap-3">
              {ACCENT_COLORS.map((c) => (
                <button
                  type="button"
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className="relative w-8 h-8 rounded-full border border-black/5 hover:scale-105 transition-transform shrink-0"
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                >
                  {color === c.value && (
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                      <Check className="w-4 h-4 text-white drop-shadow-md" style={{ strokeWidth: 3 }} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Members Assignation */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Assign Team Members
            </label>
            <div className="max-h-40 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-50 p-1 bg-slate-50">
              {users.map((user) => {
                const isSelected = selectedMembers.includes(user.id);
                return (
                  <button
                    type="button"
                    key={user.id}
                    onClick={() => toggleMember(user.id)}
                    className="flex items-center justify-between w-full p-2.5 rounded-lg text-left text-sm transition-colors hover:bg-white"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-semibold text-xs text-slate-700 shrink-0 select-none">
                        {user.initials}
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="font-medium text-slate-800">{user.name}</span>
                        <span className="text-xs text-slate-400">{user.email}</span>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-200 text-transparent bg-white'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" style={{ strokeWidth: 3 }} />
                    </div>
                  </button>
                );
              })}
            </div>
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
                'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
