import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // ຢ່າລືມ npm install cors @types/cors
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';
import { OAuth2Client } from 'google-auth-library';
import { AuthRequest } from './types/index.js'; // ໃຫ້ແນ່ໃຈວ່າ Path ນີ້ຖືກຕ້ອງ
import { authenticateToken } from './middleware/auth.js';

dotenv.config();

const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'GOOGLE_CLIENT_ID'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: Environment variable ${envVar} is missing.`);
    process.exit(1);
  }
}

console.log("DEBUG: GOOGLE_CLIENT_ID loaded:", process.env.GOOGLE_CLIENT_ID ? "YES" : "NO");
if (process.env.GOOGLE_CLIENT_ID) {
  console.log("DEBUG: First 10 chars of Client ID:", process.env.GOOGLE_CLIENT_ID.substring(0, 10));
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const resend = new Resend(process.env.RESEND_API_KEY);
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const app = express();
const PORT = process.env.PORT || 5001;

// --- MIDDLEWARE ---
app.use(cors({
  origin: true, // ອະນຸຍາດ Origin ທີ່ຮ້ອງຂໍມາ (ຈຳເປັນເມື່ອໃຊ້ credentials: true)
  credentials: true
}));
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// --- AUTH API ---
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: "Please provide email, password, and name" });
    }

    // 1. ກວດສອບຊື່ຊໍ້າ
    const existingName = await prisma.user.findFirst({ where: { name } });
    if (existingName) {
      return res.status(400).json({ message: "This name is already taken" });
    }

    // 2. ກວດສອບອີເມວຊໍ້າ
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // 3. ກວດສອບຄວາມປອດໄພຂອງລະຫັດຜ່ານ
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        message: "Password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters (!@#$%^&*)." 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // ສ້າງ User ແບບ Verified ທັນທີ (ບໍ່ໃຊ້ OTP)
    const user = await prisma.user.create({
      data: { 
        email, 
        name, 
        password: hashedPassword,
        isVerified: true // ໃຫ້ເປັນ True ເລີຍ
      }
    });

    res.status(201).json({ 
      message: "User registered successfully!", 
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
});

// ເອົາ Verify OTP Endpoint ອອກ ຫຼື ປ່ຽນເປັນແຈ້ງເຕືອນວ່າບໍ່ໃຊ້ແລ້ວ
app.post('/api/auth/verify-otp', (req, res) => {
  res.status(410).json({ message: "OTP verification is no longer required." });
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email first" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

// --- GOOGLE LOGIN API ---
app.post('/api/auth/google-login', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    if (!payload) return res.status(400).json({ message: "Invalid Google token" });

    const { email, name } = payload;

    // ກວດສອບວ່າວ່າມີ User ນີ້ແລ້ວບໍ
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // ຖ້າຍັງບໍ່ມີ ໃຫ້ສ້າງ User ໃໝ່ (Google Verified ແລ້ວ)
      user = await prisma.user.create({
        data: {
          email: email!,
          name: name || 'Google User',
          password: await bcrypt.hash(Math.random().toString(36), 10), // Random password ເພາະໃຊ້ Google
          isVerified: true // Google ຢືນຢັນມາແລ້ວ
        }
      });
    } else if (!user.isVerified) {
      // ຖ້າມີແລ້ວແຕ່ຍັງບໍ່ Verified ໃຫ້ປ່ຽນເປັນ Verified
      user = await prisma.user.update({
        where: { email },
        data: { isVerified: true }
      });
    }

    const appToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '1d' });
    res.json({ token: appToken, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error: any) {
    console.error("Google Login error:", error);
    res.status(500).json({ message: "Google Login failed", error: error.message });
  }
});

// --- FORGOT PASSWORD API ---
app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    
    // For security, always return success even if user not found
    if (!user) {
      return res.json({ message: "If an account exists, a reset link has been sent." });
    }

    // In a real app, you would generate a token and send an email
    // For now, we'll just log it and return success
    console.log(`Password reset requested for: ${email}`);
    
    // If you have Resend configured:
    // await resend.emails.send({
    //   from: 'onboarding@resend.dev',
    //   to: email,
    //   subject: 'Password Reset',
    //   html: '<p>Click here to reset your password (link placeholder)</p>'
    // });

    res.json({ message: "If an account exists, a reset link has been sent." });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Failed to process request" });
  }
});

// --- TASK API (CRUD) ---
app.post('/api/tasks', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, status } = req.body;
    const userId = req.user?.userId;
    const newTask = await prisma.task.create({
      data: { 
        title, 
        description, 
        status: status || 'DRAFT',
        userId: userId! 
      }
    });
    res.status(201).json(newTask);
  } catch (error: any) {
    console.error("Create task error:", error);
    res.status(500).json({ message: "Failed to create task", error: error.message });
  }
});

app.get('/api/tasks', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const tasks = await prisma.task.findMany({ 
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

// Update Task
app.patch('/api/tasks/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;
    const userId = req.user?.userId;

    const task = await prisma.task.findFirst({
      where: { id: Number(id), userId }
    });

    if (!task) return res.status(404).json({ message: "Task not found" });

    const updatedTask = await prisma.task.update({
      where: { id: Number(id) },
      data: { 
        title: title ?? task.title,
        description: description ?? task.description,
        status: status ?? task.status
      }
    });

    res.json(updatedTask);
  } catch (error: any) {
    console.error("Update task error:", error);
    res.status(500).json({ message: "Failed to update task", error: error.message });
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
    if (!task) return res.status(404).json({ message: "Task not found" });
    await prisma.task.delete({ where: { id: Number(id) } });
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete task" });
  }
});

// --- USER PROFILE API ---
app.get('/api/auth/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, createdAt: true }
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

app.patch('/api/auth/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { name } = req.body;
    
    if (!name) return res.status(400).json({ message: "Name is required" });

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name },
      select: { id: true, email: true, name: true, createdAt: true }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// --- ERROR HANDLING MIDDLEWARE ---
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!", error: err.message });
});

app.listen(PORT, () => {
  console.log(`⚡ [server]: Server is running at http://localhost:${PORT}`);
});
