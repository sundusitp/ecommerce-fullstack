import { type Request, type Response } from 'express';
import prisma from '../prisma';

// ดึงสินค้าทั้งหมด
export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'ดึงข้อมูลสินค้าไม่สำเร็จ' });
  }
};

// สร้างสินค้าใหม่
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, price, stock, description } = req.body;
    const newProduct = await prisma.product.create({
      data: {
        name,
        price,
        stock,
      }
    });
    res.json(newProduct);
  } catch (error) {
    res.status(400).json({ error: 'สร้างสินค้าไม่ได้' });
  }
};