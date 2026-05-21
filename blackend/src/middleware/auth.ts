import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types/index.js';

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // ເອົາ Token ຫຼັງຄຳວ່າ Bearer

  if (!token) return res.status(401).json({ message: "Access denied: No token provided" });

  jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user; // ເກັບຂໍ້ມູນ User ໄວ້ໃນ Request ເພື່ອໃຊ້ຕໍ່
    next();
  });
};