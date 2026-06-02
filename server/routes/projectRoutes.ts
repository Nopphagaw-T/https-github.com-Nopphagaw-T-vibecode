import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient();
const router = Router();

// Helper to format database project to match frontend Project interface
function formatProject(project: any) {
  const memberIds = project.members ? project.members.map((m: any) => m.userId) : [];
  return {
    id: project.id,
    name: project.name,
    description: project.description || '',
    color: project.color,
    memberIds,
    createdAt: project.createdAt.toISOString(),
  };
}

// GET /api/projects
router.get('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;

  try {
    // Find all projects where user is a member
    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formatted = projects.map(formatProject);
    return res.status(200).json(formatted);
  } catch (error) {
    console.error('Fetch projects error:', error);
    return res.status(500).json({ error: 'Internal server error fetching projects' });
  }
});

// GET /api/projects/:id
router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        members: true,
        tasks: true,
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Verify if user is a member of this project
    const isMember = project.members.some((m) => m.userId === req.user!.id);
    if (!isMember) {
      return res.status(403).json({ error: 'You do not have access to this project' });
    }

    return res.status(200).json(formatProject(project));
  } catch (error) {
    console.error('Fetch project detail error:', error);
    return res.status(500).json({ error: 'Internal server error fetching project details' });
  }
});

// POST /api/projects
router.post('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { name, description, color, memberIds } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Project name is required' });
  }

  try {
    const defaultColor = color || '#2563EB';
    // Ensure current user is in members list
    const uniqueMemberIds = Array.from(new Set([req.user!.id, ...(memberIds || [])]));

    const project = await prisma.project.create({
      data: {
        name,
        description,
        color: defaultColor,
        members: {
          create: uniqueMemberIds.map((userId) => ({
            userId,
            role: userId === req.user!.id ? 'OWNER' : 'MEMBER',
          })),
        },
      },
      include: {
        members: true,
      },
    });

    return res.status(201).json(formatProject(project));
  } catch (error) {
    console.error('Create project error:', error);
    return res.status(500).json({ error: 'Internal server error creating project' });
  }
});

// PUT /api/projects/:id
router.put('/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { name, description, color, memberIds } = req.body;

  try {
    const existingProject = await prisma.project.findUnique({
      where: { id },
      include: { members: true },
    });

    if (!existingProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Verify owner status / access
    const isMember = existingProject.members.some((m) => m.userId === req.user!.id);
    if (!isMember) {
      return res.status(403).json({ error: 'You do not have access to modify this project' });
    }

    // Update fields
    const updated = await prisma.$transaction(async (tx) => {
      // If memberIds are provided, sync them
      if (memberIds) {
        // Delete all old project members
        await tx.projectMember.deleteMany({
          where: { projectId: id },
        });

        // Ensure owner is preserved or included
        const uniqueMemberIds = Array.from(new Set([req.user!.id, ...memberIds]));
        await tx.projectMember.createMany({
          data: uniqueMemberIds.map((userId) => ({
            projectId: id,
            userId,
            role: userId === req.user!.id ? 'OWNER' : 'MEMBER',
          })),
        });
      }

      return await tx.project.update({
        where: { id },
        data: {
          name: name !== undefined ? name : undefined,
          description: description !== undefined ? description : undefined,
          color: color !== undefined ? color : undefined,
        },
        include: {
          members: true,
        },
      });
    });

    return res.status(200).json(formatProject(updated));
  } catch (error) {
    console.error('Update project error:', error);
    return res.status(500).json({ error: 'Internal server error updating project' });
  }
});

// DELETE /api/projects/:id
router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: { members: true },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check permissions
    const isMember = project.members.some((m) => m.userId === req.user!.id);
    if (!isMember) {
      return res.status(403).json({ error: 'You do not have access to delete this project' });
    }

    await prisma.project.delete({
      where: { id },
    });

    return res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    return res.status(500).json({ error: 'Internal server error deleting project' });
  }
});

export default router;
