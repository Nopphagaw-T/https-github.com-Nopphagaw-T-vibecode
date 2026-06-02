import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  await prisma.taskActivity.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.projectMember.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Seeding users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = [
    { id: 'u1', name: 'Anira Wong', email: 'anira@taskflow.app', password: hashedPassword, initials: 'AW' },
    { id: 'u2', name: 'Marcus Reed', email: 'marcus@taskflow.app', password: hashedPassword, initials: 'MR' },
    { id: 'u3', name: 'Priya Nair', email: 'priya@taskflow.app', password: hashedPassword, initials: 'PN' },
    { id: 'u4', name: 'Tom Belanger', email: 'tom@taskflow.app', password: hashedPassword, initials: 'TB' },
    { id: 'u5', name: 'Sara Okafor', email: 'sara@taskflow.app', password: hashedPassword, initials: 'SO' },
    { id: 'u6', name: 'New User', email: 'new@taskflow.app', password: hashedPassword, initials: 'NU' },
  ];

  for (const user of users) {
    await prisma.user.create({ data: user });
  }

  console.log('Seeding projects...');
  const projects = [
    {
      id: 'p1',
      name: 'Website Redesign',
      description: 'Marketing site refresh for Q3 launch.',
      color: '#2563EB',
      createdAt: new Date('2026-05-01T09:00:00Z'),
    },
    {
      id: 'p2',
      name: 'Mobile App v2',
      description: 'Native app rebuild and feature parity.',
      color: '#7C3AED',
      createdAt: new Date('2026-04-12T13:30:00Z'),
    },
    {
      id: 'p3',
      name: 'Q3 Marketing Campaign',
      description: 'Multi-channel campaign for product launch.',
      color: '#0891B2',
      createdAt: new Date('2026-05-20T08:15:00Z'),
    },
  ];

  for (const project of projects) {
    await prisma.project.create({ data: project });
  }

  console.log('Seeding project members...');
  const projectMembers = [
    // Website Redesign (p1): Anira, Marcus, Priya
    { projectId: 'p1', userId: 'u1', role: 'OWNER' },
    { projectId: 'p1', userId: 'u2', role: 'MEMBER' },
    { projectId: 'p1', userId: 'u3', role: 'MEMBER' },
    // Mobile App v2 (p2): Anira, Tom, Sara
    { projectId: 'p2', userId: 'u1', role: 'OWNER' },
    { projectId: 'p2', userId: 'u4', role: 'MEMBER' },
    { projectId: 'p2', userId: 'u5', role: 'MEMBER' },
    // Q3 Marketing Campaign (p3): Marcus, Priya, Sara
    { projectId: 'p3', userId: 'u2', role: 'OWNER' },
    { projectId: 'p3', userId: 'u3', role: 'MEMBER' },
    { projectId: 'p3', userId: 'u5', role: 'MEMBER' },
  ];

  for (const member of projectMembers) {
    await prisma.projectMember.create({ data: member });
  }

  console.log('Seeding tasks...');
  const tasks = [
    {
      id: 't1',
      projectId: 'p1',
      title: 'Design new homepage hero',
      description: 'Above-the-fold layout with new value prop and CTA.',
      status: 'in_progress',
      priority: 'high',
      assigneeId: 'u3',
      dueDate: '2026-06-10',
      labels: JSON.stringify(['design']),
      createdAt: new Date('2026-05-22T10:00:00Z'),
      updatedAt: new Date('2026-06-01T16:20:00Z'),
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
      labels: JSON.stringify(['qa']),
      createdAt: new Date('2026-05-23T09:30:00Z'),
      updatedAt: new Date('2026-05-23T09:30:00Z'),
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
      labels: JSON.stringify(['content']),
      createdAt: new Date('2026-05-25T11:00:00Z'),
      updatedAt: new Date('2026-06-02T08:45:00Z'),
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
      labels: JSON.stringify(['frontend']),
      createdAt: new Date('2026-05-10T14:00:00Z'),
      updatedAt: new Date('2026-05-28T17:10:00Z'),
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
      labels: JSON.stringify(['frontend', 'performance']),
      createdAt: new Date('2026-05-18T12:00:00Z'),
      updatedAt: new Date('2026-05-18T12:00:00Z'),
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
      labels: JSON.stringify(['design']),
      createdAt: new Date('2026-05-26T09:00:00Z'),
      updatedAt: new Date('2026-06-01T10:00:00Z'),
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
      labels: JSON.stringify(['content']),
      createdAt: new Date('2026-05-27T15:00:00Z'),
      updatedAt: new Date('2026-05-29T09:00:00Z'),
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
      labels: JSON.stringify(['ops']),
      createdAt: new Date('2026-05-21T13:00:00Z'),
      updatedAt: new Date('2026-06-02T07:30:00Z'),
    },
  ];

  for (const task of tasks) {
    await prisma.task.create({ data: task });
  }

  console.log('Seeding comments...');
  const comments = [
    { id: 'c1', taskId: 't1', authorId: 'u1', body: 'Can we try a darker background for contrast?', createdAt: new Date('2026-05-30T10:15:00Z') },
    { id: 'c2', taskId: 't1', authorId: 'u3', body: 'Good call — pushing a new version now.', createdAt: new Date('2026-06-01T16:20:00Z') },
    { id: 'c3', taskId: 't3', authorId: 'u2', body: 'Reviewed — small tweak to the headline suggested.', createdAt: new Date('2026-06-02T08:45:00Z') },
    { id: 'c4', taskId: 't8', authorId: 'u5', body: 'Inventory confirmed for two of three channels.', createdAt: new Date('2026-06-02T07:30:00Z') },
  ];

  for (const comment of comments) {
    await prisma.comment.create({ data: comment });
  }

  console.log('Seeding activities...');
  const activities = [
    { id: 'act1', taskId: 't1', userId: 'u1', userName: 'Anira Wong', userInitials: 'AW', actionType: 'creation', oldValue: null, newValue: 'Design new homepage hero', createdAt: new Date('2026-05-22T10:00:00Z') },
    { id: 'act2', taskId: 't1', userId: 'u1', userName: 'Anira Wong', userInitials: 'AW', actionType: 'assignment_change', oldValue: null, newValue: 'u3', createdAt: new Date('2026-05-22T10:05:00Z') },
    { id: 'act3', taskId: 't1', userId: 'u3', userName: 'Priya Nair', userInitials: 'PN', actionType: 'status_change', oldValue: 'todo', newValue: 'in_progress', createdAt: new Date('2026-06-01T16:20:00Z') },
    { id: 'act4', taskId: 't3', userId: 'u1', userName: 'Anira Wong', userInitials: 'AW', actionType: 'creation', oldValue: null, newValue: 'Write launch announcement copy', createdAt: new Date('2026-05-25T11:00:00Z') },
    { id: 'act5', taskId: 't3', userId: 'u1', userName: 'Anira Wong', userInitials: 'AW', actionType: 'assignment_change', oldValue: null, newValue: 'u1', createdAt: new Date('2026-05-25T11:00:00Z') },
    { id: 'act6', taskId: 't3', userId: 'u1', userName: 'Anira Wong', userInitials: 'AW', actionType: 'status_change', oldValue: 'in_progress', newValue: 'in_review', createdAt: new Date('2026-06-02T08:45:00Z') },
    { id: 'act7', taskId: 't4', userId: 'u4', userName: 'Tom Belanger', userInitials: 'TB', actionType: 'creation', oldValue: null, newValue: 'Set up navigation stack', createdAt: new Date('2026-05-10T14:00:00Z') },
    { id: 'act8', taskId: 't4', userId: 'u4', userName: 'Tom Belanger', userInitials: 'TB', actionType: 'status_change', oldValue: 'in_progress', newValue: 'done', createdAt: new Date('2026-05-28T17:10:00Z') },
    { id: 'act9', taskId: 't8', userId: 'u2', userName: 'Marcus Reed', userInitials: 'MR', actionType: 'creation', oldValue: null, newValue: 'Book ad placements', createdAt: new Date('2026-05-21T13:00:00Z') },
    { id: 'act10', taskId: 't8', userId: 'u2', userName: 'Marcus Reed', userInitials: 'MR', actionType: 'status_change', oldValue: 'todo', newValue: 'in_progress', createdAt: new Date('2026-06-02T07:30:00Z') },
  ];

  for (const act of activities) {
    await prisma.taskActivity.create({ data: act });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
