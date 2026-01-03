import { Router } from 'express';
import { register, login } from '../controllers/userController';

const router = Router();

// ⚠️ สังเกตตรงนี้: ต้องเป็น '/' หรือ '/register' เฉยๆ
// ห้ามใส่ '/users/register' เพราะใน index.ts เราบอกว่า '/users' แล้ว
router.post('/register', register); 
router.post('/login', login);

export default router;