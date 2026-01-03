import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import userRoutes from './routes/userRoutes';
import productRoutes from './routes/productRoutes';

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('🚀 Ecommerce API Ready!');
});

// ✅ 1. เพิ่ม Route สร้างสินค้า (POST) ที่รองรับ imageUrl
app.post('/products', async (req, res) => {
  // รับ imageUrl เพิ่มเข้ามา
  const { name, price, stock, imageUrl } = req.body;
  try {
    const product = await prisma.product.create({
      data: { 
        name, 
        price: Number(price), 
        stock: stock || 0,
        // ถ้ามีรูปส่งมาให้ใช้รูปนั้น ถ้าไม่มีให้เป็น undefined (Prisma จะใช้ค่า Default เอง)
        imageUrl: imageUrl || undefined 
      }, 
    });
    res.json(product);
  } catch (error) {
    console.error("Create Error:", error);
    res.status(500).json({ error: "สร้างสินค้าไม่สำเร็จ" });
  }
});

app.use('/users', userRoutes);
app.use('/products', productRoutes);

// ✅ Route ลบสินค้า
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

// ✏️ Route แก้ไขสินค้า (Update) - รองรับ imageUrl
app.put('/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price, imageUrl } = req.body; // รับ imageUrl เพิ่ม

  try {
    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) },
      data: { 
        name: name, 
        price: Number(price),
        imageUrl: imageUrl // อัปเดตข้อมูลรูปภาพ
      },
    });
    res.json(updatedProduct);
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ error: 'แก้ไขสินค้าไม่สำเร็จ' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});