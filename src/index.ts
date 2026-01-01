import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client'; // ✅ ต้อง Import ตัวนี้
import userRoutes from './routes/userRoutes';
import productRoutes from './routes/productRoutes';

const app = express();
const prisma = new PrismaClient(); // ✅ ต้องประกาศตัวแปร prisma ตรงนี้
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('🚀 Ecommerce API Ready!');
});

app.use('/users', userRoutes);
app.use('/products', productRoutes);

// ✅ แก้ไข Route ลบให้เป็นมาตรฐานเดียว
app.delete('/delete-product/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.product.delete({
      where: { id: Number(id) },
    });
    res.json({ message: 'ลบสำเร็จแล้ว!' });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: 'ลบไม่ได้ อาจจะไม่มี ID นี้ในฐานข้อมูล' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});