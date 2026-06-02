/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Calendar, AlertTriangle, CheckCircle2, Circle, Clock, ArrowRight, KanbanSquare, CheckSquare, ListTodo, Star, Target, Check, Flame, X } from 'lucide-react';
import AvatarGroup from '../components/AvatarGroup';
import { Priority, Task } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface DashboardScreenProps {
  onTaskClick: (taskId: string) => void;
}

export default function DashboardScreen({ onTaskClick }: DashboardScreenProps) {
  const { tasks, projects, users, currentUser, theme, focusedTaskId, setFocusedTaskId, updateTask, addToast } = useApp();
  const navigate = useNavigate();

  // If no current user, default fallback (or login screen handled in App)
  const currentUserId = currentUser?.id || 'u1';

  // Filter projects current user belongs to
  const myProjects = projects.filter((p) => p.memberIds.includes(currentUserId));
  const myProjectIds = myProjects.map((p) => p.id);

  // Filter tasks assigned to current user
  const myTasks = tasks.filter((t) => t.assigneeId === currentUserId);

  // Summary counts across *my projects*
  const myProjectsTasks = tasks.filter((t) => myProjectIds.includes(t.projectId));
  const todoCount = myProjectsTasks.filter((t) => t.status === 'todo').length;
  const inProgressCount = myProjectsTasks.filter((t) => t.status === 'in_progress').length;
  const inReviewCount = myProjectsTasks.filter((t) => t.status === 'in_review').length;
  const doneCount = myProjectsTasks.filter((t) => t.status === 'done').length;

  // Overdue calculation (Date is before '2026-06-02' and status is not done)
  const todayStr = '2026-06-02';
  const overdueTasks = myTasks.filter((task) => {
    if (!task.dueDate) return false;
    if (task.status === 'done') return false;
    return task.dueDate < todayStr;
  });

  // Sort upcoming tasks by deadline
  const sortedTasks = [...myTasks]
    .filter((t) => t.status !== 'done')
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });

  // Calculate project statistics (Progress bar completed / total tasks)
  const getProjectStats = (projectId: string) => {
    const projTasks = tasks.filter((t) => t.projectId === projectId);
    const total = projTasks.length;
    const completed = projTasks.filter((t) => t.status === 'done').length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  };

  // Helper for badging priorities
  const getPriorityBadgeAndStyle = (priority: Priority) => {
    switch (priority) {
      case 'low':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
      case 'medium':
        return 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-150 dark:border-blue-900/50';
      case 'high':
        return 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-250 dark:border-amber-900/50';
      case 'urgent':
        return 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50 animate-pulse';
    }
  };

  // Radar data calculations for the selected user
  const totalMyTasks = myTasks.length;
  const completedMyTasks = myTasks.filter((t) => t.status === 'done').length;
  const inProgressMyTasks = myTasks.filter((t) => t.status === 'in_progress').length;

  const overdueMyTasksCount = overdueTasks.length;
  const nonOverdueCount = Math.max(0, totalMyTasks - overdueMyTasksCount);

  // 1. Task Completion rate (Volume of completed/total)
  const completionRate = totalMyTasks > 0 ? Math.round((completedMyTasks / totalMyTasks) * 100) : 60;

  // 2. Workload Focus (Ratio of active/in_progress + done vs todo)
  const focusIndex = totalMyTasks > 0 ? Math.round(((inProgressMyTasks + completedMyTasks) / totalMyTasks) * 100) : 45;

  // 3. On-time Rate (Fewer overdues = higher score)
  const timelinessIndex = totalMyTasks > 0 ? Math.round((nonOverdueCount / totalMyTasks) * 100) : 85;

  // 4. Team Synergy (Participation across team projects)
  const teamIntegration = projects.length > 0 ? Math.round((myProjects.length / projects.length) * 100) : 65;

  // 5. Task Velocity (Distribution of high/urgent tasks)
  const highUrgentCount = myTasks.filter((t) => t.priority === 'high' || t.priority === 'urgent').length;
  const complexityWeight = totalMyTasks > 0 ? Math.min(100, Math.round((highUrgentCount / totalMyTasks) * 100) + 20) : 40;

  const radarData = [
    { subject: 'Completion', value: Math.max(30, completionRate), fullMark: 100 },
    { subject: 'Workload Focus', value: Math.max(30, focusIndex), fullMark: 100 },
    { subject: 'On-time Rate', value: Math.max(25, timelinessIndex), fullMark: 100 },
    { subject: 'Team Synergy', value: Math.max(30, teamIntegration), fullMark: 100 },
    { subject: 'Task Velocity', value: Math.max(20, complexityWeight), fullMark: 100 },
  ];

  const focusedTask = tasks.find((t) => t.id === focusedTaskId);
  const focusedTaskProject = focusedTask ? projects.find((p) => p.id === focusedTask.projectId) : null;

  return (
    <div id="dashboard-screen" className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Hi, {currentUser?.name || 'there'}!
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Here's what is happening across your projects today. Current Date: June 2, 2026.
          </p>
        </div>
        <button
          onClick={() => navigate('/projects')}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1.5 transition-colors self-start sm:self-center"
        >
          <span>View all projects</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ACTIVE FOCUS WORKSPACE WIDGET */}
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/5 dark:from-amber-950/20 dark:to-orange-950/10 border border-amber-500/20 dark:border-amber-500/30 rounded-3xl p-5 shadow-xs relative overflow-hidden">
        {/* Ambient background decoration */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-500 dark:bg-amber-600 text-white rounded-2xl shrink-0 shadow-lg shadow-amber-500/20 animate-pulse">
              <Target className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-500 fill-orange-500" /> Active Focus Workspace
              </span>
              {focusedTask && focusedTask.status !== 'done' ? (
                <>
                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
                      {focusedTask.title}
                    </h3>
                    {focusedTaskProject && (
                      <span
                        className="text-[9px] font-bold uppercase tracking-wider text-white px-2 py-0.5 rounded-md"
                        style={{ backgroundColor: focusedTaskProject.color }}
                      >
                        {focusedTaskProject.name}
                      </span>
                    )}
                    <span className={`text-[9px] border px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${getPriorityBadgeAndStyle(focusedTask.priority)}`}>
                      {focusedTask.priority}
                    </span>
                  </div>
                  {focusedTask.description ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 max-w-2xl leading-relaxed">
                      {focusedTask.description}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 italic">
                      No description provided.
                    </p>
                  )}
                </>
              ) : focusedTask && focusedTask.status === 'done' ? (
                <>
                  <h3 className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 tracking-tight leading-snug mt-1 flex items-center gap-1.5">
                    🎉 Task Completed! Excellent work!
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    You've crushed your target goal. Ready for your next challenge? Focus space is now cleared for new selections.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 tracking-tight leading-snug mt-1.5">
                    No active focus target selected today
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed max-w-xl">
                    Highlight an important task to focus your progress. Open any task in your project boards and click the <strong className="text-amber-600 dark:text-amber-400 font-bold">🎯 Set Focus</strong> button to see it pinned here.
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0 self-start sm:self-center md:self-auto pl-14 md:pl-0">
            {focusedTask && focusedTask.status !== 'done' ? (
              <>
                <button
                  onClick={() => {
                    updateTask(focusedTask.id, { status: 'done' });
                    setFocusedTaskId(null);
                    addToast(`Completed "${focusedTask.title}"! Celebration incoming! 🎯🎉`, 'success');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-md shadow-emerald-500/10 border border-emerald-500/20 hover:scale-102 cursor-pointer transition-all active:scale-97"
                >
                  <Check className="w-4 h-4" style={{ strokeWidth: 2.5 }} />
                  <span>Mark Completed</span>
                </button>
                <button
                  onClick={() => onTaskClick(focusedTask.id)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl px-4 py-2.5 flex items-center gap-2 hover:scale-102 cursor-pointer transition-all active:scale-97"
                >
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <span>View Details</span>
                </button>
                <button
                  onClick={() => {
                    setFocusedTaskId(null);
                    addToast('Focus cleared.', 'success');
                  }}
                  className="text-slate-400 hover:text-rose-500 p-2.5 rounded-xl transition-colors hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer"
                  title="Remove focus target"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </>
            ) : focusedTask && focusedTask.status === 'done' ? (
              <button
                onClick={() => setFocusedTaskId(null)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl px-4 py-2.5 flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Clear Status</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Summary strip counts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'To Do', count: todoCount, color: 'text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800' },
          { label: 'In Progress', count: inProgressCount, color: 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30' },
          { label: 'In Review', count: inReviewCount, color: 'text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20' },
          { label: 'Completed', count: doneCount, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20' },
        ].map((card, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4.5 shadow-2xs flex flex-col justify-between min-h-[100px]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {card.label}
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-sans tabular-nums">
                {card.count}
              </span>
              <div className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${card.color}`}>
                Active
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Overdue highlight notification */}
      {overdueTasks.length > 0 && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-150 dark:border-red-900/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 shadow-2xs animate-in slide-in-from-top-4 duration-200">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl shrink-0">
            <AlertTriangle className="w-5.5 h-5.5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              You have {overdueTasks.length} overdue {overdueTasks.length === 1 ? 'task' : 'tasks'}!
            </h4>
            <p className="text-xs text-red-600 dark:text-red-400 mt-0.5 leading-snug">
              These tasks are assigned to you and their due dates have passed. Prioritize completing them.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 pt-2 sm:pt-0 shrink-0">
            {overdueTasks.slice(0, 2).map((task) => (
              <button
                key={task.id}
                onClick={() => onTaskClick(task.id)}
                className="text-[11px] bg-white dark:bg-slate-900 border border-red-200/60 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-700 dark:text-red-400 font-bold px-3 py-1.5 rounded-xl transition-colors active:scale-95 shadow-2xs truncate max-w-[150px]"
              >
                {task.title}
              </button>
            ))}
            {overdueTasks.length > 2 && (
              <span className="text-xs text-red-600/80 font-semibold self-center sm:ml-1">
                +{overdueTasks.length - 2} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Dynamic Productivity cockpit with radar chart */}
      <div id="spider-radar-cockpit" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar area (5 cols on desktop) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-50 dark:border-slate-800/60">
              <div>
                <h3 className="text-sm font-extrabold text-slate-850 dark:text-white uppercase tracking-wider font-sans">
                  Work Style Radar
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Dynamic analysis of your workspace actions
                </p>
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
            </div>

            {/* Radar Canvas container */}
            <div className="h-64 w-full mt-4 flex items-center justify-center select-none">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke={theme === 'dark' ? '#334155' : '#E2E8F0'} />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{
                      fill: theme === 'dark' ? '#94A3B8' : '#475569',
                      fontSize: 9,
                      fontWeight: 700,
                      fontFamily: 'Inter, sans-serif'
                    }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fill: theme === 'dark' ? '#475569' : '#CBD5E1', fontSize: 8 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Radar
                    name={currentUser?.name || 'Member'}
                    dataKey="value"
                    stroke={theme === 'dark' ? '#60A5FA' : '#2563EB'}
                    fill={theme === 'dark' ? '#3B82F6' : '#2563EB'}
                    fillOpacity={theme === 'dark' ? 0.25 : 0.15}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 italic mt-2 leading-relaxed">
            Note: Every task completion or status change updates your radar profile instantly.
          </p>
        </div>

        {/* Dynamic Performance insights (7 cols on desktop) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-850 dark:text-white uppercase tracking-wider font-sans mb-4">
              Real-time Work Performance Insights
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Stat 1: Completion */}
              <div className="p-3 bg-slate-50/50 dark:bg-slate-850/40 rounded-2xl border border-slate-100/50 dark:border-slate-800/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-slate-450 dark:text-slate-550 uppercase tracking-wide">
                    Task Completion
                  </span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {completionRate}%
                  </span>
                </div>
                <div className="w-full bg-slate-200/60 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: `${completionRate}%` }} />
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 leading-relaxed">
                  Percentage of completed status items assigned to you. Move items to 'Done' to maximize.
                </p>
              </div>

              {/* Stat 2: Workload Focus */}
              <div className="p-3 bg-slate-50/50 dark:bg-slate-850/40 rounded-2xl border border-slate-100/50 dark:border-slate-800/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-slate-450 dark:text-slate-550 uppercase tracking-wide">
                    Workload Focus
                  </span>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono">
                    {focusIndex}%
                  </span>
                </div>
                <div className="w-full bg-slate-200/60 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full transition-all duration-300" style={{ width: `${focusIndex}%` }} />
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 leading-relaxed">
                  Proportion of active vs backlogged tasks. A higher focus score means greater active speed.
                </p>
              </div>

              {/* Stat 3: On-time Delivery */}
              <div className="p-3 bg-slate-50/50 dark:bg-slate-850/40 rounded-2xl border border-slate-100/50 dark:border-slate-800/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-slate-450 dark:text-slate-550 uppercase tracking-wide">
                    On-time Rate
                  </span>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">
                    {timelinessIndex}%
                  </span>
                </div>
                <div className="w-full bg-slate-200/60 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full transition-all duration-300" style={{ width: `${timelinessIndex}%` }} />
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 leading-relaxed">
                  Ratio of non-overdue tasks. Keeping deadlines on track avoids project blockages.
                </p>
              </div>

              {/* Stat 4: Task Velocity */}
              <div className="p-3 bg-slate-50/50 dark:bg-slate-850/40 rounded-2xl border border-slate-100/50 dark:border-slate-800/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-slate-450 dark:text-slate-550 uppercase tracking-wide">
                    Workload Velocity
                  </span>
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400 font-mono">
                    {complexityWeight}%
                  </span>
                </div>
                <div className="w-full bg-slate-200/60 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full transition-all duration-300" style={{ width: `${complexityWeight}%` }} />
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 leading-relaxed">
                  Measures density of high-impact or urgent tasks. Shows delivery stress capacity.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-lg shrink-0">
              💡
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              {completionRate >= 70
                ? `Fantastic job, ${currentUser?.name}! Your productivity fingerprint indicates high execution accuracy.`
                : "Tip: Clear overdue action items or delegate status changes to maintain an optimal balance."}
            </span>
          </div>
        </div>
      </div>

      {/* Two-Column split layout: My Tasks Feed | Project list */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Live My Tasks Stream (8 columns) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">My Action Items</h2>
            </div>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded-full font-bold">
              {sortedTasks.length} Pending
            </span>
          </div>

          {sortedTasks.length > 0 ? (
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {sortedTasks.map((task) => {
                const projectOfTask = projects.find((p) => p.id === task.projectId);
                const isOverdue = task.dueDate && task.dueDate < todayStr;

                return (
                  <div
                    key={task.id}
                    onClick={() => onTaskClick(task.id)}
                    className={`group border hover:border-slate-205 dark:hover:border-slate-700 hover:shadow-xs rounded-xl p-4 transition-all duration-150 cursor-pointer flex items-start gap-3.5 ${
                      task.id === focusedTaskId
                        ? 'bg-amber-500/5 border-amber-400 dark:border-amber-500 ring-1 ring-amber-400/40 dark:ring-amber-500/40 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
                    }`}
                  >
                    {/* Status circle check indicator */}
                    <div className={`mt-0.5 shrink-0 transition-colors ${
                      task.id === focusedTaskId ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600 group-hover:text-blue-500'
                    }`}>
                      <Circle className="w-4.5 h-4.5" />
                    </div>

                    {/* Task Copy */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {projectOfTask && (
                          <span
                            className="text-[9px] font-bold uppercase tracking-wider text-white px-1.5 py-0.5 rounded-md"
                            style={{ backgroundColor: projectOfTask.color }}
                          >
                            {projectOfTask.name}
                          </span>
                        )}
                        <span className={`text-xs border px-2 py-0.2 rounded-full font-semibold uppercase tracking-wider ${getPriorityBadgeAndStyle(task.priority)}`}>
                          {task.priority}
                        </span>
                        {task.id === focusedTaskId && (
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-500 text-white px-2 py-0.5 rounded-md flex items-center gap-0.5 shadow-xs animate-pulse">
                            <Target className="w-2.5 h-2.5" /> Active Focus
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 truncate max-w-lg">
                          {task.description}
                        </p>
                      )}
                    </div>

                    {/* Due Date Indicator */}
                    {task.dueDate && (
                      <div className={`flex items-center gap-1 shrink-0 text-[11px] font-medium p-1.5 rounded-lg ${
                        isOverdue ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}>
                        <Clock className="w-3.5 h-3.5" />
                        <span className="tabular-nums">
                          {task.dueDate.replace('2026-', '')}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-2xs">
              <CheckCircle2 className="w-12 h-12 text-blue-500 mb-3" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-150">You are all caught up!</h3>
              <p className="text-xs text-slate-400 dark:text-slate-550 max-w-[280px] mt-1 leading-normal">
                There are no open tasks assigned to you at the moment. Good job!
              </p>
            </div>
          )}
        </div>

        {/* RIGHT: Active Projects Overview (5 columns) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <KanbanSquare className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white font-sans">Starred Projects</h2>
            </div>
            <span className="text-xs text-slate-405 dark:text-slate-509 font-semibold">{myProjects.length} Active</span>
          </div>

          <div className="space-y-4">
            {myProjects.map((proj) => {
              const { total, completed, percent } = getProjectStats(proj.id);
              return (
                <div
                  key={proj.id}
                  onClick={() => navigate(`/projects/${proj.id}`)}
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-xs rounded-2xl p-4 transition-all duration-150 cursor-pointer"
                >
                  {/* Color stripe name indicator */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: proj.color }} />
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-sans">
                        {proj.name}
                      </h3>
                    </div>
                    {/* Render stack of member initials */}
                    <AvatarGroup userIds={proj.memberIds} allUsers={users} max={3} />
                  </div>

                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-2.5 truncate max-w-xs font-medium">
                    {proj.description || 'Marketing refresh and targets.'}
                  </p>

                  {/* Progress tracker metrics */}
                  <div className="mt-4 pt-3 border-t border-slate-50 dark:border-slate-800">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-505 dark:text-slate-400 uppercase tracking-wide">
                      <span>Progress</span>
                      <span className="tabular-nums font-mono text-slate-700 dark:text-slate-300">{percent}%</span>
                    </div>
                    {/* Slate indicator */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 bg-linear-to-r"
                        style={{
                          width: `${percent}%`,
                          backgroundImage: `linear-gradient(to right, ${proj.color}, ${proj.color}CC)`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-medium">
                      <span>{completed} tasks completed</span>
                      <span>{total} total items</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
