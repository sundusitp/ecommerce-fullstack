import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import multer from 'multer'; // 1. นำเข้า Multer
import path from 'path';
import fs from 'fs';

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;
const SECRET_KEY = "supersecret"; 

app.use(express.json());
app.use(cors());

// 2. ตั้งค่าการเก็บไฟล์ (Save ลงโฟลเดอร์ 'uploads')
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir); // ถ้าไม่มีโฟลเดอร์ ให้สร้างเองเลย
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // ตั้งชื่อไฟล์ใหม่ป้องกันชื่อซ้ำ: เวลาปัจจุบัน + นามสกุลเดิม (เช่น 123456.jpg)
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// 3. เปิดให้คนเข้าถึงรูปภาพในโฟลเดอร์ uploads ได้ผ่าน URL
app.use('/uploads', express.static('uploads'));

// Middleware เช็ค Token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, SECRET_KEY, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.get('/', (req, res) => { res.send('🚀 Ecommerce API Ready!'); });

// ==========================
// 🛒 Product Routes (อัปเกรดให้รับรูปได้)
// ==========================

// ดึงสินค้า
app.get('/products', async (req, res) => {
  const products = await prisma.product.findMany();
  
  // แปลง path รูปให้เป็น Full URL (เพื่อให้ Frontend แสดงผลง่ายๆ)
  const productsWithUrl = products.map(p => ({
    ...p,
    // ถ้ามีรูป ให้เติม http://localhost:3000/ เข้าไปข้างหน้า
    imageUrl: p.imageUrl ? `http://localhost:${port}/uploads/${p.imageUrl}` : null
  }));
  
  res.json(productsWithUrl);
});

// สร้างสินค้า (รองรับการอัปโหลดรูป)
// upload.single('image') คือบอกว่ารับไฟล์จาก field ชื่อ 'image'
app.post('/products', authenticateToken, upload.single('image'), async (req: any, res: any) => {
  const { name, price, stock } = req.body;
  // ถ้ามีการอัปโหลดไฟล์ ให้เอาชื่อไฟล์มาใช้
  const filename = req.file ? req.file.filename : null;

  try {
    const product = await prisma.product.create({
      data: { 
        name, 
        price: Number(price), 
        stock: Number(stock) || 0,
        imageUrl: filename // เก็บแค่ชื่อไฟล์ลง Database (เช่น 17654321.jpg)
      }, 
    });
    res.json(product);
  } catch (error) { res.status(500).json({ error: "Create failed" }); }
});

// แก้ไขสินค้า (รองรับเปลี่ยนรูป)
app.put('/products/:id', authenticateToken, upload.single('image'), async (req: any, res: any) => {
  const { id } = req.params;
  const { name, price } = req.body;
  const filename = req.file ? req.file.filename : undefined; // ถ้าไม่ส่งรูปใหม่มา ก็ให้เป็น undefined

  try {
    const updated = await prisma.product.update({
      where: { id: Number(id) },
      data: { 
        name, 
        price: Number(price), 
        ...(filename && { imageUrl: filename }) // อัปเดตเฉพาะถ้ามีรูปใหม่
      },
    });
    res.json(updated);
  } catch (error) { res.status(500).json({ error: "Update failed" }); }
});

app.delete('/delete-product/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.product.delete({ where: { id: Number(id) } });
    res.json({ message: 'Deleted' });
  } catch (error) { res.status(500).json({ error: "Delete failed" }); }
});

// ==========================
// 👤 User & Order Routes (เหมือนเดิม)
// ==========================
app.post('/users/register', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const user = await prisma.user.create({ data: { email, password, name, role: 'USER' } });
    res.json(user);
  } catch (error) { res.status(400).json({ error: 'User exists' }); }
});

app.post('/users/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.password !== password) return res.status(401).json({ error: 'Invalid' });
  const token = jwt.sign({ userId: user.id, role: user.role }, SECRET_KEY);
  res.json({ token, user: { email: user.email, role: user.role } });
});

app.post('/orders', authenticateToken, async (req: any, res: any) => {
  const { items } = req.body;
  const userId = req.user.userId;
  if (!items || items.length === 0) return res.status(400).json({ error: "Empty cart" });
  const totalPrice = items.reduce((sum: number, item: any) => sum + (item.price * 1), 0);
  try {
    const order = await prisma.order.create({
      data: {
        userId, totalPrice, status: "PAID",
        items: { create: items.map((item: any) => ({ productId: item.id, price: item.price, quantity: 1 })) }
      },
      include: { items: true }
    });
    res.json({ message: "Success", order });
  } catch (error) { res.status(500).json({ error: "Order failed" }); }
});

app.get('/my-orders', authenticateToken, async (req: any, res: any) => {
  const userId = req.user.userId;
  const orders = await prisma.order.findMany({
    where: { userId }, include: { items: { include: { product: true } } }, orderBy: { createdAt: 'desc' }
  });
  res.json(orders);
});

app.get('/admin/orders', async (req, res) => {
  const orders = await prisma.order.findMany({ include: { user: true, items: true }, orderBy: { createdAt: 'desc' } });
  res.json(orders);
});

app.listen(port, () => { console.log(`Server is running at port ${port}`); });