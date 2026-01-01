import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes'; // นำเข้า Route ที่เราเพิ่งสร้าง
import productRoutes from './routes/productRoutes';

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('🚀 Ecommerce API Ready!');
});

// ใช้งาน User Routes (อะไรที่ขึ้นต้นด้วย /users จะวิ่งไปที่ไฟล์นั้น)
app.use('/users', userRoutes);
app.use('/products', productRoutes);

app.delete('/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.product.delete({
      where: { id: Number(id) },
    });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

// เพิ่ม Route สำหรับลบสินค้า
app.delete('/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.product.delete({
      where: { id: Number(id) }
    });
    res.json({ message: 'ลบสินค้าสำเร็จ' });
  } catch (error) {
    res.status(500).json({ error: 'ไม่สามารถลบสินค้าได้' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});