import { Router } from 'express';
import { getProducts, createProduct } from '../controllers/productController';
import { authenticateToken } from '../middlewares/authMiddleware'; // <--- 1. เรียกยามมา

const router = Router();

// ดูสินค้า: ใครๆ ก็ดูได้ (ไม่ต้องมียาม)
router.get('/', getProducts);

// สร้างสินค้า: ต้องผ่านยามก่อน!
router.post('/', authenticateToken, createProduct); // <--- 2. ยามยืนเฝ้าตรงนี้

export default router;