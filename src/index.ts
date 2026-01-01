import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client'; // ต้องมีอันนี้!
import userRoutes from './routes/userRoutes';
import productRoutes from './routes/productRoutes';

const app = express();
const prisma = new PrismaClient(); // ต้องสร้างตัวแปร prisma ตรงนี้!
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('🚀 Ecommerce API Ready!');
});

// เชื่อมต่อ Routes
app.use('/users', userRoutes);
app.use('/products', productRoutes);

// 🗑️ ประตูสำหรับการลบสินค้า (เขียนครั้งเดียวพอ)
app.delete('/delete-product/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.product.delete({
      where: { id: Number(id) },
    });
    res.json({ message: 'ลบสำเร็จแล้ว!' });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: 'ลบไม่ได้ อาจจะไม่มี ID นี้ หรือระบบขัดข้อง' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});