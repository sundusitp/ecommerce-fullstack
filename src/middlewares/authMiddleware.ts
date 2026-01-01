import { type Request, type Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  // 1. ขอดูบัตรหน่อย (ดึงจาก Header)
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // ตัดคำว่า Bearer ออก

  if (!token) {
     res.status(401).json({ error: 'กรุณา Login ก่อนใช้งาน (ไม่พบ Token)' });
     return; 
  }

  // 2. ตรวจลายเซ็นบนบัตร
  jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
    if (err) {
       res.status(403).json({ error: 'Token ไม่ถูกต้องหรือหมดอายุ' });
       return;
    }

    // 3. ผ่านครับเชิญข้างใน!
    next();
  });
};