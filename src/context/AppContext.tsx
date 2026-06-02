// src/context/AppContext.tsx
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Project, Task, Comment, Status, Priority, TaskActivity } from '../types';
import { api } from '../api/client';

/** Toast definition */
interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

/** Context shape */
interface AppContextType {
  currentUser: User | null;
  users: User[];
  projects: Project[];
  tasks: Task[];
  comments: Comment[];
  activities: TaskActivity[];
  searchQuery: string;
  toasts: Toast[];
  isLoading: boolean;
  setSearchQuery: (query: string) => void;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (name: string, email: string, password: string) => Promise<boolean>;
  signOut: () => void;
  createProject: (name: string, description: string, color: string, memberIds: string[]) => Promise<Project>;
  createTask: (task: Omit<Task, 'id' | 'commentCount' | 'createdAt' | 'updatedAt'>) => Promise<Task>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  moveTask: (taskId: string, status: Status) => Promise<boolean>;
  addComment: (taskId: string, body: string) => Promise<boolean>;
  addToast: (message: string, type?: 'success' | 'error') => void;
  removeToast: (id: string) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  focusedTaskId: string | null;
  setFocusedTaskId: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // UI‑only state stored in localStorage
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('taskflow_theme');
    return saved === 'dark' || saved === 'light' ? saved : 'light';
  });

  // Core data – start empty, will be populated from backend
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activities, setActivities] = useState<TaskActivity[]>([]);

  const [focusedTaskId, setFocusedTaskId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Persist theme & focused task ID to localStorage (UI prefs only)
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('taskflow_theme', theme);
  }, [theme]);

  useEffect(() => {
    if (focusedTaskId) {
      localStorage.setItem('taskflow_focused_task_id', focusedTaskId);
    } else {
      localStorage.removeItem('taskflow_focused_task_id');
    }
  }, [focusedTaskId]);

  // Initial data load – runs once on mount
  useEffect(() => {
    const token = localStorage.getItem('taskflow_token');
    if (!token) {
      setIsLoading(false);
      return;
    }
    (async () => {
      try {
        const [me, usersData, projectsData, tasksData, commentsData, activitiesData] = await Promise.all([
          api.me(),
          api.users(),
          api.projects(),
          api.tasks(),
          api.comments(), // helper that fetches all comments
          api.activities(), // helper that fetches all activities
        ]);
        setCurrentUser(me);
        setUsers(usersData);
        setProjects(projectsData);
        setTasks(tasksData);
        setComments(commentsData);
        setActivities(activitiesData);
      } catch (e) {
        clearToken();
        addToast((e as Error).message, 'error');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Toast helpers
  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Helper to clear JWT token from storage
  const clearToken = () => {
    localStorage.removeItem('taskflow_token');
    setCurrentUser(null);
  };

  // Authentication ----------------------------------------------------------
  const signIn = async (email: string, password: string) => {
    try {
      const { token, user } = await api.login(email, password);
      localStorage.setItem('taskflow_token', token);
      setCurrentUser(user);
      addToast(`Welcome back, ${user.name}!`, 'success');
      // Pre‑load supporting data after sign‑in
      const [usersData, projectsData, tasksData, commentsData, activitiesData] = await Promise.all([
        api.users(),
        api.projects(),
        api.tasks(),
        api.comments(),
        api.activities(),
      ]);
      setUsers(usersData);
      setProjects(projectsData);
      setTasks(tasksData);
      setComments(commentsData);
      setActivities(activitiesData);
      return true;
    } catch (e) {
      addToast((e as Error).message, 'error');
      return false;
    }
  };

  // Helper to refresh user list from backend
  const refreshUsers = async () => {
    try {
      const usersData = await api.users();
      setUsers(usersData);
    } catch (e) {
      addToast((e as Error).message, 'error');
    }
  };

  // User CRUD ----------------------------------------------------------
  const createUser = async (name: string, email: string, password: string) => {
    try {
      await api.createUser(name, email, password);
      await refreshUsers();
      addToast(`User ${name} created.`, 'success');
      return true;
    } catch (e) {
      addToast((e as Error).message, 'error');
      return false;
    }
  };

  const updateUser = async (id: string, data: Partial<any>) => {
    try {
      await api.updateUser(id, data);
      await refreshUsers();
      addToast(`User updated.`, 'success');
      return true;
    } catch (e) {
      addToast((e as Error).message, 'error');
      return false;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await api.deleteUser(id);
      await refreshUsers();
      addToast('User deleted.', 'success');
      return true;
    } catch (e) {
      addToast((e as Error).message, 'error');
      return false;
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    try {
      const { token, user } = await api.signup(name, email, password);
      localStorage.setItem('taskflow_token', token);
      setCurrentUser(user);
      addToast(`Account created! Welcome, ${name}.`, 'success');
      // Load initial data for the new user
      const [usersData, projectsData, tasksData, commentsData, activitiesData] = await Promise.all([
        api.users(),
        api.projects(),
        api.tasks(),
        api.comments(),
        api.activities(),
      ]);
      setUsers(usersData);
      setProjects(projectsData);
      setTasks(tasksData);
      setComments(commentsData);
      setActivities(activitiesData);
      return true;
    } catch (e) {
      addToast((e as Error).message, 'error');
      return false;
    }
  };

  const signOut = () => {
    clearToken();
    addToast('You have signed out.', 'success');
  };

  // Project CRUD -----------------------------------------------------------
  const createProject = async (name: string, description: string, color: string, memberIds: string[]) => {
    const proj = await api.createProject({ name, description, color, memberIds });
    setProjects(prev => [...prev, proj]);
    addToast(`Project "${name}" created.`, 'success');
    return proj;
  };

  // Task CRUD ---------------------------------------------------------------
  const createTask = async (taskData: Omit<Task, 'id' | 'commentCount' | 'createdAt' | 'updatedAt'>) => {
    const task = await api.createTask(taskData);
    setTasks(prev => [...prev, task]);
    addToast(`Task "${task.title}" created.`, 'success');
    return task;
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    await api.updateTask(taskId, updates);
    setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t)));
    addToast('Task updated.', 'success');
  };

  const deleteTask = async (taskId: string) => {
    await api.deleteTask(taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setComments(prev => prev.filter(c => c.taskId !== taskId));
    setActivities(prev => prev.filter(a => a.taskId !== taskId));
    addToast('Task deleted.', 'success');
  };

  const moveTask = async (taskId: string, status: Status) => {
    try {
      await api.updateTask(taskId, { status });
      setTasks(prev =>
        prev.map(t => (t.id === taskId ? { ...t, status, updatedAt: new Date().toISOString() } : t))
      );
      addToast(`Moved task to ${status.replace('_', ' ')}`, 'success');
      return true;
    } catch {
      addToast('Failed to move task.', 'error');
      return false;
    }
  };

  // Comments ----------------------------------------------------------------
  const addComment = async (taskId: string, body: string) => {
    if (!body.trim()) return false;
    if (!currentUser) {
      addToast('You must be signed in to comment.', 'error');
      return false;
    }
    const comment = await api.addComment(taskId, body);
    setComments(prev => [...prev, comment]);
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, commentCount: t.commentCount + 1, updatedAt: new Date().toISOString() } : t))
    );
    addToast('Comment added.', 'success');
    return true;
  };

  // Activity logging – just mirrors backend activity list (no client‑side log)
  const logActivity = (taskId: string, actionType: TaskActivity['actionType'], oldValue: string | null, newValue: string | null) => {
    // No‑op on client side; backend creates activities automatically.
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        refreshUsers,
        projects,
        tasks,
        comments,
        activities,
        searchQuery,
        toasts,
        isLoading,
        setSearchQuery,
        signIn,
        signUp,
        signOut,
        createProject,
        createTask,
        updateTask,
        deleteTask,
        moveTask,
        addComment,
        addToast,
        removeToast,
        theme,
        setTheme,
        focusedTaskId,
        setFocusedTaskId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

