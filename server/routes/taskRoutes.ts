import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient();
const router = Router();

// Helper to format task output to match frontend Task interface
function formatTask(task: any) {
  let labelsList: string[] = [];
  try {
    labelsList = JSON.parse(task.labels || '[]');
  } catch (e) {
    labelsList = [];
  }

  const commentCount = task._count ? task._count.comments : (task.comments ? task.comments.length : 0);

  return {
    id: task.id,
    projectId: task.projectId,
    title: task.title,
    description: task.description || '',
    status: task.status,
    priority: task.priority,
    assigneeId: task.assigneeId,
    dueDate: task.dueDate,
    labels: labelsList,
    commentCount,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

// GET /api/tasks
// Query filters: projectId, assigneeId
router.get('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { projectId, assigneeId } = req.query;

  try {
    const tasks = await prisma.task.findMany({
      where: {
        projectId: projectId ? String(projectId) : undefined,
        assigneeId: assigneeId ? String(assigneeId) : undefined,
      },
      include: {
        _count: {
          select: { comments: true },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const formatted = tasks.map(formatTask);
    return res.status(200).json(formatted);
  } catch (error) {
    console.error('Fetch tasks error:', error);
    return res.status(500).json({ error: 'Internal server error fetching tasks' });
  }
});

// GET /api/tasks/:id
router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  try {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        _count: {
          select: { comments: true },
        },
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    return res.status(200).json(formatTask(task));
  } catch (error) {
    console.error('Fetch task detail error:', error);
    return res.status(500).json({ error: 'Internal server error fetching task details' });
  }
});

// POST /api/tasks
router.post('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { projectId, title, description, assigneeId, priority, status, dueDate, labels } = req.body;

  if (!projectId || !title) {
    return res.status(400).json({ error: 'Project ID and title are required' });
  }

  try {
    // Validate project member access
    const isMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: req.user!.id,
        },
      },
    });

    if (!isMember) {
      return res.status(403).json({ error: 'You are not a member of this project' });
    }

    const labelsString = JSON.stringify(labels || []);

    const task = await prisma.$transaction(async (tx) => {
      const createdTask = await tx.task.create({
        data: {
          projectId,
          title,
          description,
          assigneeId: assigneeId || null,
          priority: priority || 'medium',
          status: status || 'todo',
          dueDate: dueDate || null,
          labels: labelsString,
        },
        include: {
          _count: {
            select: { comments: true },
          },
        },
      });

      // Log creation activity
      await tx.taskActivity.create({
        data: {
          taskId: createdTask.id,
          userId: req.user!.id,
          userName: req.user!.name,
          userInitials: req.user!.initials,
          actionType: 'creation',
          oldValue: null,
          newValue: title,
        },
      });

      // If assignee is assigned, log assignment activity
      if (assigneeId) {
        await tx.taskActivity.create({
          data: {
            taskId: createdTask.id,
            userId: req.user!.id,
            userName: req.user!.name,
            userInitials: req.user!.initials,
            actionType: 'assignment_change',
            oldValue: null,
            newValue: assigneeId,
          },
        });
      }

      return createdTask;
    });

    return res.status(201).json(formatTask(task));
  } catch (error) {
    console.error('Create task error:', error);
    return res.status(500).json({ error: 'Internal server error creating task' });
  }
});

// PUT /api/tasks/:id
router.put('/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { title, description, assigneeId, priority, status, dueDate, labels } = req.body;

  try {
    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Verify member permissions
    const isMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: existingTask.projectId,
          userId: req.user!.id,
        },
      },
    });

    if (!isMember) {
      return res.status(403).json({ error: 'You do not have access to edit this task' });
    }

    const labelsString = labels !== undefined ? JSON.stringify(labels || []) : undefined;

    const updatedTask = await prisma.$transaction(async (tx) => {
      // Check status change
      if (status !== undefined && status !== existingTask.status) {
        await tx.taskActivity.create({
          data: {
            taskId: id,
            userId: req.user!.id,
            userName: req.user!.name,
            userInitials: req.user!.initials,
            actionType: 'status_change',
            oldValue: existingTask.status,
            newValue: status,
          },
        });
      }

      // Check priority change
      if (priority !== undefined && priority !== existingTask.priority) {
        await tx.taskActivity.create({
          data: {
            taskId: id,
            userId: req.user!.id,
            userName: req.user!.name,
            userInitials: req.user!.initials,
            actionType: 'priority_change',
            oldValue: existingTask.priority,
            newValue: priority,
          },
        });
      }

      // Check assignment change
      if (assigneeId !== undefined && assigneeId !== existingTask.assigneeId) {
        await tx.taskActivity.create({
          data: {
            taskId: id,
            userId: req.user!.id,
            userName: req.user!.name,
            userInitials: req.user!.initials,
            actionType: 'assignment_change',
            oldValue: existingTask.assigneeId,
            newValue: assigneeId || null,
          },
        });
      }

      // Check due date change
      if (dueDate !== undefined && dueDate !== existingTask.dueDate) {
        await tx.taskActivity.create({
          data: {
            taskId: id,
            userId: req.user!.id,
            userName: req.user!.name,
            userInitials: req.user!.initials,
            actionType: 'due_date_change',
            oldValue: existingTask.dueDate,
            newValue: dueDate || null,
          },
        });
      }

      return await tx.task.update({
        where: { id },
        data: {
          title: title !== undefined ? title : undefined,
          description: description !== undefined ? description : undefined,
          assigneeId: assigneeId !== undefined ? (assigneeId || null) : undefined,
          priority: priority !== undefined ? priority : undefined,
          status: status !== undefined ? status : undefined,
          dueDate: dueDate !== undefined ? (dueDate || null) : undefined,
          labels: labelsString,
        },
        include: {
          _count: {
            select: { comments: true },
          },
        },
      });
    });

    return res.status(200).json(formatTask(updatedTask));
  } catch (error) {
    console.error('Update task error:', error);
    return res.status(500).json({ error: 'Internal server error updating task' });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  try {
    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const isMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: task.projectId,
          userId: req.user!.id,
        },
      },
    });

    if (!isMember) {
      return res.status(403).json({ error: 'You do not have access to delete this task' });
    }

    await prisma.task.delete({
      where: { id },
    });

    return res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    return res.status(500).json({ error: 'Internal server error deleting task' });
  }
});

// GET /api/tasks/:taskId/comments
router.get('/:taskId/comments', requireAuth, async (req, res) => {
  const { taskId } = req.params;

  try {
    const comments = await prisma.comment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' },
    });

    const formatted = comments.map((c) => ({
      id: c.id,
      taskId: c.taskId,
      authorId: c.authorId,
      body: c.body,
      createdAt: c.createdAt.toISOString(),
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    console.error('Fetch comments error:', error);
    return res.status(500).json({ error: 'Internal server error fetching comments' });
  }
});

// POST /api/tasks/:taskId/comments
router.post('/:taskId/comments', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { taskId } = req.params;
  const { body } = req.body;

  if (!body) {
    return res.status(400).json({ error: 'Comment body is required' });
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        taskId,
        body,
        authorId: req.user!.id,
      },
    });

    return res.status(201).json({
      id: comment.id,
      taskId: comment.taskId,
      authorId: comment.authorId,
      body: comment.body,
      createdAt: comment.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Add comment error:', error);
    return res.status(500).json({ error: 'Internal server error adding comment' });
  }
});

// GET /api/tasks/:taskId/activities
router.get('/:taskId/activities', requireAuth, async (req, res) => {
  const { taskId } = req.params;

  try {
    const activities = await prisma.taskActivity.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = activities.map((act) => ({
      id: act.id,
      taskId: act.taskId,
      userId: act.userId,
      userName: act.userName,
      userInitials: act.userInitials,
      actionType: act.actionType,
      oldValue: act.oldValue,
      newValue: act.newValue,
      createdAt: act.createdAt.toISOString(),
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    console.error('Fetch activities error:', error);
    return res.status(500).json({ error: 'Internal server error fetching task activity log' });
  }
});

// GET /api/activities (All activities for dashboard)
router.get('/activities/global', requireAuth, async (req, res) => {
  try {
    const activities = await prisma.taskActivity.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50, // limit to 50 logs
    });

    const formatted = activities.map((act) => ({
      id: act.id,
      taskId: act.taskId,
      userId: act.userId,
      userName: act.userName,
      userInitials: act.userInitials,
      actionType: act.actionType,
      oldValue: act.oldValue,
      newValue: act.newValue,
      createdAt: act.createdAt.toISOString(),
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    console.error('Fetch global activities error:', error);
    return res.status(500).json({ error: 'Internal server error fetching global activities log' });
  }
});

export default router;
