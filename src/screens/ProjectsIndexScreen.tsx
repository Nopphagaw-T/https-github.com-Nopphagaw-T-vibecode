/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Plus, Briefcase, Calendar, FolderClosed, Users } from 'lucide-react';
import AvatarGroup from '../components/AvatarGroup';

interface ProjectsIndexScreenProps {
  onCreateProjectClick: () => void;
}

export default function ProjectsIndexScreen({ onCreateProjectClick }: ProjectsIndexScreenProps) {
  const { projects, tasks, users } = useApp();
  const navigate = useNavigate();

  // Project progress statistics calculation
  const getProjectStats = (projectId: string) => {
    const projTasks = tasks.filter((t) => t.projectId === projectId);
    const total = projTasks.length;
    const completed = projTasks.filter((t) => t.status === 'done').length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  };

  return (
    <div id="projects-index-screen" className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header operations bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Projects Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse and manage all active team projects and track progress across kanban workflows.
          </p>
        </div>
        <button
          onClick={onCreateProjectClick}
          className="bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/10 text-white text-sm font-semibold rounded-xl px-4 py-2 flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/5 active:scale-97 transition-all cursor-pointer self-start sm:self-center"
        >
          <Plus className="w-4.5 h-4.5" style={{ strokeWidth: 2.5 }} />
          <span>New Project</span>
        </button>
      </div>

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((proj) => {
            const { total, completed, percent } = getProjectStats(proj.id);
            const formattedDate = new Date(proj.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={proj.id}
                onClick={() => navigate(`/projects/${proj.id}`)}
                className="group bg-white border border-slate-100 hover:border-slate-200 hover:shadow-md rounded-2xl p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between h-[230px]"
              >
                {/* Top Section */}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Accent Dot */}
                      <div
                        className="w-4 h-4 rounded-full shrink-0 group-hover:scale-110 transition-transform shadow-inner"
                        style={{ backgroundColor: proj.color }}
                      />
                      <h3 className="text-base font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                        {proj.name}
                      </h3>
                    </div>
                    {/* Render member avatars */}
                    <AvatarGroup userIds={proj.memberIds} allUsers={users} max={3} />
                  </div>

                  <p className="text-xs text-slate-500 mt-3 line-clamp-3 leading-relaxed font-sans">
                    {proj.description || 'No description provided.'}
                  </p>
                </div>

                {/* Bottom Section */}
                <div className="mt-4 pt-4 border-t border-slate-50">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    <span>Progress Tracker</span>
                    <span className="tabular-nums font-mono text-slate-700">{percent}%</span>
                  </div>

                  {/* Horizontal progress bar indicators */}
                  <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: proj.color,
                      }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2.5 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Created {formattedDate}
                    </span>
                    <span>
                      {completed}/{total} Completed
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center shadow-xs max-w-lg mx-auto mt-8">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl w-fit mx-auto mb-4 animate-bounce">
            <Briefcase className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">No active projects</h2>
          <p className="text-xs text-slate-400 max-w-[280px] mx-auto mt-2 leading-relaxed">
            There are currently no projects configured for your workspace profile. Create a new one to begin tracking!
          </p>
          <button
            onClick={onCreateProjectClick}
            className="mt-5 text-xs font-bold bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/10 text-white rounded-xl px-4 py-2 transition-all cursor-pointer active:scale-97"
          >
            Create Your First Project
          </button>
        </div>
      )}
    </div>
  );
}
