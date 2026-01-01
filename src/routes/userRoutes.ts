import { Router } from 'express';
import { getUsers, createUser, login } from '../controllers/userController';

const router = Router();

router.get('/', getUsers);      // ดูรายชื่อ
router.post('/', createUser);   // สมัครสมาชิก
router.post('/login', login);   // <--- เพิ่มบรรทัดนี้: เข้าสู่ระบบ

export default router;