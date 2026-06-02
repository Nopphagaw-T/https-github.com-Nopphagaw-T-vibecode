/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Task, Status } from './types';

// Screens
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import DashboardScreen from './screens/DashboardScreen';
import ProjectsIndexScreen from './screens/ProjectsIndexScreen';
import ProjectDetailScreen from './screens/ProjectDetailScreen';
import SearchScreen from './screens/SearchScreen';
import SettingsScreen from './screens/SettingsScreen';

// Layout & Global Components
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import ToastContainer from './components/ToastContainer';

// Modals
import CreateProjectModal from './components/modals/CreateProjectModal';
import CreateTaskModal from './components/modals/CreateTaskModal';
import TaskDetailModal from './components/modals/TaskDetailModal';

// Authentication Guard component
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { currentUser } = useApp();
  const location = useLocation();

  if (!currentUser) {
    // Redirect to login if unauthenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// Redirect if already logged in
function GuestGuard({ children }: { children: React.ReactNode }) {
  const { currentUser } = useApp();
  const location = useLocation();

  if (currentUser) {
    // Redirect to home if already authenticated
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Layout wrapper for authenticated workspace view
function WorkspaceLayout({
  onAddTaskClick,
  onTaskClick,
}: {
  onAddTaskClick: (projectId?: string, status?: Status) => void;
  onTaskClick: (taskId: string) => void;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 relative font-sans">
      {/* Collapsible and Mobile Drawer Sidebar */}
      <Sidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header bar */}
        <TopBar
          onMenuToggle={() => setMobileMenuOpen((prev) => !prev)}
          onAddTaskClick={() => onAddTaskClick()}
        />

        {/* Dynamic Scrollable Work Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-2 sm:p-4.5">
          <Routes>
            <Route index element={<DashboardScreen onTaskClick={onTaskClick} />} />
            <Route
              path="/projects"
              element={
                <ProjectsIndexScreen
                  onCreateProjectClick={() => {
                    // Trigger custom project modal
                    (window as any)._openCreateProjectModal?.();
                  }}
                />
              }
            />
            <Route
              path="/projects/:projectId"
              element={
                <ProjectDetailScreen
                  onAddTaskClick={onAddTaskClick}
                  onTaskClick={onTaskClick}
                />
              }
            />
            <Route path="/search" element={<SearchScreen onTaskClick={onTaskClick} />} />
            <Route path="/settings" element={<SettingsScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

// Root workspace with Modals State controller
function RootApp() {
  // Modal states
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [activeTaskDetailId, setActiveTaskDetailId] = useState<string | null>(null);

  // Task form props caching
  const [defaultProjectId, setDefaultProjectId] = useState('');
  const [defaultStatus, setDefaultStatus] = useState<Status>('todo');
  const [editTaskData, setEditTaskData] = useState<Task | null>(null);

  // Bind register project toggle for access by screens
  React.useEffect(() => {
    (window as any)._openCreateProjectModal = () => setIsCreateProjectOpen(true);
    return () => {
      delete (window as any)._openCreateProjectModal;
    };
  }, []);

  const handleOpenAddTask = (projectId?: string, status?: Status) => {
    setEditTaskData(null);
    setDefaultProjectId(projectId || '');
    setDefaultStatus(status || 'todo');
    setIsCreateTaskOpen(true);
  };

  const handleOpenEditTask = (task: Task) => {
    setEditTaskData(task);
    setIsCreateTaskOpen(true);
  };

  const handleOpenTaskDetail = (taskId: string) => {
    setActiveTaskDetailId(taskId);
  };

  return (
    <>
      <Routes>
        {/* Guest routes */}
        <Route
          path="/login"
          element={
            <GuestGuard>
              <LoginScreen />
            </GuestGuard>
          }
        />
        <Route
          path="/signup"
          element={
            <GuestGuard>
              <SignupScreen />
            </GuestGuard>
          }
        />

        {/* Authenticated workspace wrapper */}
        <Route
          path="/*"
          element={
            <AuthGuard>
              <WorkspaceLayout
                onAddTaskClick={handleOpenAddTask}
                onTaskClick={handleOpenTaskDetail}
              />
            </AuthGuard>
          }
        />
      </Routes>

      {/* Global Modals overlay stack */}
      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
      />

      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => {
          setIsCreateTaskOpen(false);
          setEditTaskData(null);
        }}
        defaultProjectId={defaultProjectId}
        defaultStatus={defaultStatus}
        editTask={editTaskData}
      />

      <TaskDetailModal
        isOpen={activeTaskDetailId !== null}
        taskId={activeTaskDetailId}
        onClose={() => setActiveTaskDetailId(null)}
        onEditClick={(task) => {
          // Close detail modal, open edit task
          setActiveTaskDetailId(null);
          handleOpenEditTask(task);
        }}
      />

      {/* Persistent global toast notification wrapper */}
      <ToastContainer />
    </>
  );
}

export default function App() {
  return (
    <React.StrictMode>
      <AppProvider>
        <Router>
          <RootApp />
        </Router>
      </AppProvider>
    </React.StrictMode>
  );
}
