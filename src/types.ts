/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Status = 'todo' | 'in_progress' | 'in_review' | 'done';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  initials: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  memberIds: string[];
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  assigneeId: string | null;
  dueDate: string | null; // YYYY-MM-DD
  labels: string[];
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  body: string;
  createdAt: string;
}
