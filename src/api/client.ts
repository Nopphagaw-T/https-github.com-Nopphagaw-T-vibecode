// src/api/client.ts
/**
 * Simple wrapper around fetch for TaskFlow API calls.
 * All requests are prefixed with "/api" (Vite proxy forwards to the backend).
 * The JWT token (stored in localStorage under "taskflow_token") is automatically added
 * as a Bearer token when present.
 */

const API_BASE = '/api';

/**
 * Perform a fetch request to the TaskFlow backend.
 * @param endpoint   API endpoint beginning with '/' (e.g. '/projects')
 * @param options    Optional fetch init options (method, body, etc.)
 * @returns          Parsed JSON response.
 */
export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Ensure leading slash for consistency
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const token = localStorage.getItem('taskflow_token');
  const headers = new Headers(options.headers ?? {});

  // Attach JSON content type for most requests
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Attach Authorization header if we have a token
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  // Handle error responses uniformly
  if (!response.ok) {
    // Try to read JSON error payload, otherwise fallback to status text
    let errorMsg = response.statusText;
    try {
      const errBody = await response.json();
      if (errBody && typeof errBody.error === 'string') {
        errorMsg = errBody.error;
      }
    } catch (_) {
      // ignore JSON parse errors
    }
    throw new Error(errorMsg);
  }

  // Assume JSON responses for all successful calls
  return response.json();
}

// Helper functions for common resources – these keep the AppContext tidy.
export const api = {
  // Auth
  login: (email: string, password: string) =>
    apiFetch<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  signup: (name: string, email: string, password: string) =>
    apiFetch<{ token: string; user: any }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),
  me: () => apiFetch<any>('/auth/me'),

  // Users (team members)
  users: () => apiFetch<any[]>('/users'),

  // Projects
  projects: () => apiFetch<any[]>('/projects'),
  project: (id: string) => apiFetch<any>(`/projects/${id}`),
  createProject: (data: any) =>
    apiFetch<any>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id: string, data: any) =>
    apiFetch<any>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProject: (id: string) =>
    apiFetch<void>(`/projects/${id}`, { method: 'DELETE' }),

  // Tasks
  tasks: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiFetch<any[]>(`/tasks${query}`);
  },
  task: (id: string) => apiFetch<any>(`/tasks/${id}`),
  createTask: (data: any) =>
    apiFetch<any>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id: string, data: any) =>
    apiFetch<any>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTask: (id: string) => apiFetch<void>(`/tasks/${id}`, { method: 'DELETE' }),
  addComment: (taskId: string, body: string) =>
    apiFetch<any>(`/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    }),
  comments: (taskId: string) => apiFetch<any[]>(`/tasks/${taskId}/comments`),
};
