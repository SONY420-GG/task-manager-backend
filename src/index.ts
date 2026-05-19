import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthRequest } from './types/index.js';
import { authenticateToken } from './middleware/auth.js';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());

// --- AUTH API ---
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Please provide email, password, and name" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, name, password: hashedPassword }
    });
    res.status(201).json({ message: "User registered!", user: { id: user.id, email: user.email, name: user.name } });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

// --- TASK API (CRUD) ---

// 1. ສ້າງ Task
app.post('/api/tasks', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });
    
    const userId = req.user?.userId;
    const newTask = await prisma.task.create({
      data: { title, userId: userId! }
    });
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: "Failed to create task" });
  }
});

// 2. ດຶງຂໍ້ມູນ Task ທັງໝົດຂອງ User ທີ່ Login ຢູ່
app.get('/api/tasks', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const tasks = await prisma.task.findMany({ 
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// 3. ດຶງຂໍ້ມູນ Task ດຽວຕາມ ID
app.get('/api/tasks/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const task = await prisma.task.findFirst({
      where: { id: Number(id), userId }
    });
    
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch task" });
  }
});

// 4. ແກ້ໄຂ Task (Update title ຫຼື status)
app.put('/api/tasks/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, status } = req.body;
    const userId = req.user?.userId;

    const task = await prisma.task.findFirst({
      where: { id: Number(id), userId }
    });

    if (!task) return res.status(404).json({ error: "Task not found or unauthorized" });

    const updatedTask = await prisma.task.update({
      where: { id: Number(id) },
      data: { title, status }
    });

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: "Failed to update task" });
  }
});

// 5. ລຶບ Task
app.delete('/api/tasks/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const task = await prisma.task.findFirst({
      where: { id: Number(id), userId }
    });

    if (!task) return res.status(404).json({ error: "Task not found or unauthorized" });

    await prisma.task.delete({
      where: { id: Number(id) }
    });

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete task" });
  }
});

app.listen(PORT, () => {
  console.log(`⚡ [server]: Server is running at http://localhost:${PORT}`);
});