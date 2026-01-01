import { type Request, type Response } from 'express';
import prisma from '../prisma'; // เรียกใช้ตัวเชื่อมที่เราทำไว้เมื่อกี้
import jwt from 'jsonwebtoken';

// ฟังก์ชันดึง User ทั้งหมด
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'ดึงข้อมูลไม่สำเร็จ' });
  }
};

// ฟังก์ชันสร้าง User ใหม่
export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, name, password } = req.body;
    const newUser = await prisma.user.create({
      data: { email, name, password }
    });
    res.json(newUser);
  } catch (error) {
    res.status(400).json({ error: 'สร้าง User ไม่ได้ (Email อาจจะซ้ำ)' });
  }
};
// ฟังก์ชันเข้าสู่ระบบ (Login)
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || user.password !== password) {
       res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
       return;
    }

    // --- จุดที่เพิ่มมาใหม่ (สร้างบัตรผ่าน) ---
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' } // บัตรหมดอายุใน 1 ชม.
    );
    // ------------------------------------

    res.json({ message: 'Login สำเร็จ!', token }); // ส่ง token กลับไป
  } catch (error) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการ Login' });
  }
};