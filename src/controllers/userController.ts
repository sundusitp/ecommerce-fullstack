import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ✅ ฟังก์ชัน Register
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // เช็คว่ามี User นี้อยู่แล้วไหม
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email นี้มีผู้ใช้งานแล้ว' });
    }

    // สร้าง User ใหม่
    const newUser = await prisma.user.create({
      data: {
        email,
        password, // (ของจริงควร Hash ก่อนเก็บ แต่ตอนนี้เอาแบบนี้ไปก่อนเพื่อให้รันผ่าน)
        name: name || 'User',
      },
    });

    res.status(201).json({ message: 'สมัครสมาชิกสำเร็จ!', user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'สมัครสมาชิกไม่สำเร็จ' });
  }
};

// ✅ ฟังก์ชัน Login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // ค้นหา User จาก Email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // ถ้าไม่เจอ User หรือรหัสผ่านไม่ตรง
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Email หรือรหัสผ่านไม่ถูกต้อง' });
    }

    // Login สำเร็จ (ส่ง Token ปลอมๆ กลับไปก่อนเพื่อให้ Frontend ทำงานได้)
    res.json({ 
      message: 'Login สำเร็จ!', 
      token: 'fake-jwt-token-123456',
      user: { id: user.id, email: user.email, name: user.name }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login ไม่สำเร็จ' });
  }
};