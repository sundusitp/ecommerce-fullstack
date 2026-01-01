import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // สร้าง User Admin
  const admin = await prisma.user.upsert({
    where: { email: 'test@gmail.com' },
    update: {},
    create: {
      email: 'test@gmail.com',
      password: 'password',
      name: 'Admin Sundusit',
    },
  })

  // สร้างสินค้าเริ่มต้น
  await prisma.product.createMany({
    data: [
      { name: 'iPhone 15 Pro', price: 42900, stock: 10 },
      { name: 'MacBook Air M2', price: 39900, stock: 5 },
      { name: 'AirPods Pro', price: 8900, stock: 20 },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Seeding finished: User "test@gmail.com" created!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
