/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Project, Task, Comment, Status, Priority, TaskActivity } from '../types';
import {
  INITIAL_USERS,
  INITIAL_CURRENT_USER_ID,
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_COMMENTS,
  INITIAL_ACTIVITIES,
} from '../data/mockData';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

interface AppContextType {
  currentUser: User | null;
  users: User[];
  projects: Project[];
  tasks: Task[];
  comments: Comment[];
  searchQuery: string;
  toasts: Toast[];
  setSearchQuery: (query: string) => void;
  signIn: (email: string) => boolean;
  signUp: (name: string, email: string) => boolean;
  signOut: () => void;
  createProject: (name: string, description: string, color: string, memberIds: string[]) => Project;
  createTask: (task: Omit<Task, 'id' | 'commentCount' | 'createdAt' | 'updatedAt'>) => Task;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, status: Status) => boolean;
  addComment: (taskId: string, body: string) => boolean;
  addToast: (message: string, type?: 'success' | 'error') => void;
  removeToast: (id: string) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  activities: TaskActivity[];
  logActivity: (taskId: string, actionType: TaskActivity['actionType'], oldValue: string | null, newValue: string | null) => void;
  focusedTaskId: string | null;
  setFocusedTaskId: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Load initial state or localStorage
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('taskflow_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedId = localStorage.getItem('taskflow_current_user_id');
    if (savedId) {
      const savedUsersList = localStorage.getItem('taskflow_users');
      const currentUsers: User[] = savedUsersList ? JSON.parse(savedUsersList) : INITIAL_USERS;
      const found = currentUsers.find(u => u.id === savedId);
      if (found) return found;
    }
    // Default to u1 as mock fallback but can be null for login screen demonstration
    const foundDefault = INITIAL_USERS.find(u => u.id === INITIAL_CURRENT_USER_ID);
    return foundDefault || null;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('taskflow_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('taskflow_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [comments, setComments] = useState<Comment[]>(() => {
    const saved = localStorage.getItem('taskflow_comments');
    return saved ? JSON.parse(saved) : INITIAL_COMMENTS;
  });

  const [activities, setActivities] = useState<TaskActivity[]>(() => {
    const saved = localStorage.getItem('taskflow_activities');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
  });

  const [focusedTaskId, setFocusedTaskId] = useState<string | null>(() => {
    return localStorage.getItem('taskflow_focused_task_id');
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('taskflow_theme');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('taskflow_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('taskflow_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('taskflow_current_user_id', currentUser.id);
    } else {
      localStorage.removeItem('taskflow_current_user_id');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('taskflow_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('taskflow_comments', JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    localStorage.setItem('taskflow_activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    if (focusedTaskId) {
      localStorage.setItem('taskflow_focused_task_id', focusedTaskId);
    } else {
      localStorage.removeItem('taskflow_focused_task_id');
    }
  }, [focusedTaskId]);

  // Toast helpers
  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sign in
  const signIn = (email: string) => {
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setCurrentUser(user);
      addToast(`Welcome back, ${user.name}!`, 'success');
      return true;
    }
    addToast('User not found. Try anira@taskflow.app or create an account.', 'error');
    return false;
  };

  // Sign up
  const signUp = (name: string, email: string) => {
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      addToast('An account with this email already exists.', 'error');
      return false;
    }

    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || 'US';

    const newUser: User = {
      id: 'u_' + Math.random().toString(36).substring(2, 9),
      name,
      email,
      avatarUrl: null,
      initials,
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    addToast(`Account created successfully! Welcome, ${name}!`, 'success');
    return true;
  };

  // Sign out
  const signOut = () => {
    setCurrentUser(null);
    addToast('You have signed out.', 'success');
  };

  // Create Project
  const createProject = (name: string, description: string, color: string, memberIds: string[]) => {
    const newProject: Project = {
      id: 'p_' + Math.random().toString(36).substring(2, 9),
      name,
      description,
      color,
      memberIds: memberIds.length > 0 ? memberIds : ['u1'],
      createdAt: new Date().toISOString(),
    };
    setProjects((prev) => [...prev, newProject]);
    addToast(`Project "${name}" created successfully.`, 'success');
    return newProject;
  };

  // Log Task Actions helper
  const logActivity = (
    taskId: string,
    actionType: TaskActivity['actionType'],
    oldValue: string | null,
    newValue: string | null
  ) => {
    const activeUser = currentUser || { id: 'u1', name: 'Anira Wong', initials: 'AW' };
    const newActivity: TaskActivity = {
      id: 'act_' + Math.random().toString(36).substring(2, 9),
      taskId,
      userId: activeUser.id,
      userName: activeUser.name,
      userInitials: activeUser.initials,
      actionType,
      oldValue,
      newValue,
      createdAt: new Date().toISOString(),
    };
    setActivities((prev) => [newActivity, ...prev]);
  };

  // Create Task
  const createTask = (taskData: Omit<Task, 'id' | 'commentCount' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: 't_' + Math.random().toString(36).substring(2, 9),
      commentCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, newTask]);
    addToast(`Task "${newTask.title}" created.`, 'success');
    
    // Log creation
    logActivity(newTask.id, 'creation', null, newTask.title);
    if (newTask.assigneeId) {
      logActivity(newTask.id, 'assignment_change', null, newTask.assigneeId);
    }
    
    return newTask;
  };

  // Update Task
  const updateTask = (taskId: string, updates: Partial<Task>) => {
    const existingTask = tasks.find((t) => t.id === taskId);
    if (existingTask) {
      if (updates.status !== undefined && updates.status !== existingTask.status) {
        logActivity(taskId, 'status_change', existingTask.status, updates.status);
      }
      if (updates.priority !== undefined && updates.priority !== existingTask.priority) {
        logActivity(taskId, 'priority_change', existingTask.priority, updates.priority);
      }
      if (updates.assigneeId !== undefined && updates.assigneeId !== existingTask.assigneeId) {
        logActivity(taskId, 'assignment_change', existingTask.assigneeId, updates.assigneeId);
      }
      if (updates.dueDate !== undefined && updates.dueDate !== existingTask.dueDate) {
        logActivity(taskId, 'due_date_change', existingTask.dueDate, updates.dueDate || null);
      }
    }

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, ...updates, updatedAt: new Date().toISOString() }
          : t
      )
    );
    addToast(`Task updated successfully.`, 'success');
  };

  // Delete Task
  const deleteTask = (taskId: string) => {
    const taskToDelete = tasks.find((t) => t.id === taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setComments((prev) => prev.filter((c) => c.taskId !== taskId));
    setActivities((prev) => prev.filter((act) => act.taskId !== taskId));
    addToast(`Task "${taskToDelete?.title || ''}" deleted.`, 'success');
  };

  // Move Task (Drag-and-Drop)
  const moveTask = (taskId: string, status: Status): boolean => {
    try {
      const existingTask = tasks.find((t) => t.id === taskId);
      if (existingTask && existingTask.status !== status) {
        logActivity(taskId, 'status_change', existingTask.status, status);
      }
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, status, updatedAt: new Date().toISOString() }
            : t
        )
      );
      const niceStatus = status.replace('_', ' ').toUpperCase();
      addToast(`Moved task to ${niceStatus}.`, 'success');
      return true;
    } catch {
      addToast('Failed to move task.', 'error');
      return false;
    }
  };

  // Add Comment
  const addComment = (taskId: string, body: string) => {
    if (!body.trim()) return false;
    if (!currentUser) {
      addToast('You must be signed in to comment.', 'error');
      return false;
    }

    const newComment: Comment = {
      id: 'c_' + Math.random().toString(36).substring(2, 9),
      taskId,
      authorId: currentUser.id,
      body,
      createdAt: new Date().toISOString(),
    };

    setComments((prev) => [...prev, newComment]);

    // Update denormalized comment count on task
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, commentCount: t.commentCount + 1, updatedAt: new Date().toISOString() }
          : t
      )
    );

    addToast('Comment added.', 'success');
    return true;
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        projects,
        tasks,
        comments,
        searchQuery,
        toasts,
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
        activities,
        logActivity,
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
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
