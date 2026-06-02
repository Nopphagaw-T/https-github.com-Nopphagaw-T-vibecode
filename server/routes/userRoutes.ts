// server/routes/userRoutes.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { requireAuth } from '../middleware/auth';

const prisma = new PrismaClient();
const router = Router();

// GET all users (list) - protected
router.get('/', requireAuth, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        initials: true,
      },
    });
    return res.status(200).json(users);
  } catch (error) {
    console.error('Fetch users error:', error);
    return res.status(500).json({ error: 'Internal server error fetching users' });
  }
});

// POST create a new user (signup style, no auth required)
router.post('/', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) || 'US';
    const user = await prisma.user.create({
      data: { name, email, password: hashed, initials },
      select: { id: true, name: true, email: true, avatarUrl: true, initials: true },
    });
    return res.status(201).json(user);
  } catch (error) {
    console.error('Create user error:', error);
    return res.status(500).json({ error: 'Internal server error creating user' });
  }
});

// GET single user by ID - protected
router.get('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, avatarUrl: true, initials: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.status(200).json(user);
  } catch (error) {
    console.error('Fetch user error:', error);
    return res.status(500).json({ error: 'Internal server error fetching user' });
  }
});

// PUT update user - protected (allow updating name, email, password, avatarUrl)
router.put('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { name, email, password, avatarUrl } = req.body;
  try {
    const data: any = {};
    if (name) data.name = name;
    if (email) data.email = email;
    if (avatarUrl) data.avatarUrl = avatarUrl;
    if (password) data.password = await bcrypt.hash(password, 10);
    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, avatarUrl: true, initials: true },
    });
    return res.status(200).json(user);
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({ error: 'Internal server error updating user' });
  }
});

// DELETE user - protected
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ error: 'Internal server error deleting user' });
  }
});

export default router;
