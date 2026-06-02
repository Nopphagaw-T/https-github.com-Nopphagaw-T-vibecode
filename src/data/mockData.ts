/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Project, Task, Comment } from '../types';

export const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'Anira Wong',    email: 'anira@taskflow.app',  avatarUrl: null, initials: 'AW' },
  { id: 'u2', name: 'Marcus Reed',   email: 'marcus@taskflow.app', avatarUrl: null, initials: 'MR' },
  { id: 'u3', name: 'Priya Nair',    email: 'priya@taskflow.app',  avatarUrl: null, initials: 'PN' },
  { id: 'u4', name: 'Tom Belanger',  email: 'tom@taskflow.app',    avatarUrl: null, initials: 'TB' },
  { id: 'u5', name: 'Sara Okafor',   email: 'sara@taskflow.app',   avatarUrl: null, initials: 'SO' }
];

export const INITIAL_CURRENT_USER_ID = 'u1';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Website Redesign',
    description: 'Marketing site refresh for Q3 launch.',
    color: '#2563EB', // Blue
    memberIds: ['u1', 'u2', 'u3'],
    createdAt: '2026-05-01T09:00:00Z'
  },
  {
    id: 'p2',
    name: 'Mobile App v2',
    description: 'Native app rebuild and feature parity.',
    color: '#7C3AED', // Violet
    memberIds: ['u1', 'u4', 'u5'],
    createdAt: '2026-04-12T13:30:00Z'
  },
  {
    id: 'p3',
    name: 'Q3 Marketing Campaign',
    description: 'Multi-channel campaign for product launch.',
    color: '#0891B2', // Cyan
    memberIds: ['u2', 'u3', 'u5'],
    createdAt: '2026-05-20T08:15:00Z'
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    projectId: 'p1',
    title: 'Design new homepage hero',
    description: 'Above-the-fold layout with new value prop and CTA.',
    status: 'in_progress',
    priority: 'high',
    assigneeId: 'u3',
    dueDate: '2026-06-10',
    labels: ['design'],
    commentCount: 2,
    createdAt: '2026-05-22T10:00:00Z',
    updatedAt: '2026-06-01T16:20:00Z'
  },
  {
    id: 't2',
    projectId: 'p1',
    title: 'Audit current site for broken links',
    description: 'Crawl all pages and log 404s.',
    status: 'todo',
    priority: 'medium',
    assigneeId: 'u2',
    dueDate: '2026-06-15',
    labels: ['qa'],
    commentCount: 0,
    createdAt: '2026-05-23T09:30:00Z',
    updatedAt: '2026-05-23T09:30:00Z'
  },
  {
    id: 't3',
    projectId: 'p1',
    title: 'Write launch announcement copy',
    description: 'Blog post + social snippets.',
    status: 'in_review',
    priority: 'medium',
    assigneeId: 'u1',
    dueDate: '2026-06-08',
    labels: ['content'],
    commentCount: 1,
    createdAt: '2026-05-25T11:00:00Z',
    updatedAt: '2026-06-02T08:45:00Z'
  },
  {
    id: 't4',
    projectId: 'p2',
    title: 'Set up navigation stack',
    description: 'Tab + stack navigation skeleton.',
    status: 'done',
    priority: 'high',
    assigneeId: 'u4',
    dueDate: '2026-05-28',
    labels: ['frontend'],
    commentCount: 3,
    createdAt: '2026-05-10T14:00:00Z',
    updatedAt: '2026-05-28T17:10:00Z'
  },
  {
    id: 't5',
    projectId: 'p2',
    title: 'Implement offline caching',
    description: 'Cache last-viewed tasks for offline read.',
    status: 'todo',
    priority: 'urgent',
    assigneeId: 'u5',
    dueDate: '2026-05-30',
    labels: ['frontend', 'performance'],
    commentCount: 0,
    createdAt: '2026-05-18T12:00:00Z',
    updatedAt: '2026-05-18T12:00:00Z'
  },
  {
    id: 't6',
    projectId: 'p2',
    title: 'Design empty states',
    description: 'Illustrations + copy for empty lists.',
    status: 'in_progress',
    priority: 'low',
    assigneeId: 'u1',
    dueDate: '2026-06-20',
    labels: ['design'],
    commentCount: 0,
    createdAt: '2026-05-26T09:00:00Z',
    updatedAt: '2026-06-01T10:00:00Z'
  },
  {
    id: 't7',
    projectId: 'p3',
    title: 'Draft email sequence',
    description: '3-part nurture sequence for leads.',
    status: 'todo',
    priority: 'medium',
    assigneeId: 'u5',
    dueDate: '2026-06-12',
    labels: ['content'],
    commentCount: 1,
    createdAt: '2026-05-27T15:00:00Z',
    updatedAt: '2026-05-29T09:00:00Z'
  },
  {
    id: 't8',
    projectId: 'p3',
    title: 'Book ad placements',
    description: 'Reserve social + display inventory.',
    status: 'in_progress',
    priority: 'high',
    assigneeId: 'u2',
    dueDate: '2026-06-05',
    labels: ['ops'],
    commentCount: 4,
    createdAt: '2026-05-21T13:00:00Z',
    updatedAt: '2026-06-02T07:30:00Z'
  }
];

export const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'c1',
    taskId: 't1',
    authorId: 'u1',
    body: 'Can we try a darker background for contrast?',
    createdAt: '2026-05-30T10:15:00Z'
  },
  {
    id: 'c2',
    taskId: 't1',
    authorId: 'u3',
    body: 'Good call — pushing a new version now.',
    createdAt: '2026-06-01T16:20:00Z'
  },
  {
    id: 'c3',
    taskId: 't3',
    authorId: 'u2',
    body: 'Reviewed — small tweak to the headline suggested.',
    createdAt: '2026-06-02T08:45:00Z'
  },
  {
    id: 'c4',
    taskId: 't8',
    authorId: 'u5',
    body: 'Inventory confirmed for two of three channels.',
    createdAt: '2026-06-02T07:30:00Z'
  }
];

export const INITIAL_ACTIVITIES = [
  {
    id: 'act1',
    taskId: 't1',
    userId: 'u1',
    userName: 'Anira Wong',
    userInitials: 'AW',
    actionType: 'creation',
    oldValue: null,
    newValue: 'Design new homepage hero',
    createdAt: '2026-05-22T10:00:00Z'
  },
  {
    id: 'act2',
    taskId: 't1',
    userId: 'u1',
    userName: 'Anira Wong',
    userInitials: 'AW',
    actionType: 'assignment_change',
    oldValue: null,
    newValue: 'u3', // Priya Nair
    createdAt: '2026-05-22T10:05:00Z'
  },
  {
    id: 'act3',
    taskId: 't1',
    userId: 'u3',
    userName: 'Priya Nair',
    userInitials: 'PN',
    actionType: 'status_change',
    oldValue: 'todo',
    newValue: 'in_progress',
    createdAt: '2026-06-01T16:20:00Z'
  },
  {
    id: 'act4',
    taskId: 't3',
    userId: 'u1',
    userName: 'Anira Wong',
    userInitials: 'AW',
    actionType: 'creation',
    oldValue: null,
    newValue: 'Write launch announcement copy',
    createdAt: '2026-05-25T11:00:00Z'
  },
  {
    id: 'act5',
    taskId: 't3',
    userId: 'u1',
    userName: 'Anira Wong',
    userInitials: 'AW',
    actionType: 'assignment_change',
    oldValue: null,
    newValue: 'u1',
    createdAt: '2026-05-25T11:00:00Z'
  },
  {
    id: 'act6',
    taskId: 't3',
    userId: 'u1',
    userName: 'Anira Wong',
    userInitials: 'AW',
    actionType: 'status_change',
    oldValue: 'in_progress',
    newValue: 'in_review',
    createdAt: '2026-06-02T08:45:00Z'
  },
  {
    id: 'act7',
    taskId: 't4',
    userId: 'u4',
    userName: 'Tom Belanger',
    userInitials: 'TB',
    actionType: 'creation',
    oldValue: null,
    newValue: 'Set up navigation stack',
    createdAt: '2026-05-10T14:00:00Z'
  },
  {
    id: 'act8',
    taskId: 't4',
    userId: 'u4',
    userName: 'Tom Belanger',
    userInitials: 'TB',
    actionType: 'status_change',
    oldValue: 'in_progress',
    newValue: 'done',
    createdAt: '2026-05-28T17:10:00Z'
  },
  {
    id: 'act9',
    taskId: 't8',
    userId: 'u2',
    userName: 'Marcus Reed',
    userInitials: 'MR',
    actionType: 'creation',
    oldValue: null,
    newValue: 'Book ad placements',
    createdAt: '2026-05-21T13:00:00Z'
  },
  {
    id: 'act10',
    taskId: 't8',
    userId: 'u2',
    userName: 'Marcus Reed',
    userInitials: 'MR',
    actionType: 'status_change',
    oldValue: 'todo',
    newValue: 'in_progress',
    createdAt: '2026-06-02T07:30:00Z'
  }
];

