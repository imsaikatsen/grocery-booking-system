import { PrismaClient, Role } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL!,
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // ─── Clean existing data ──────────────────────────
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.groceryItem.deleteMany()
  await prisma.user.deleteMany()

  console.log('🧹 Cleaned existing data')

  // ─── Create Admin User ────────────────────────────
  const hashedAdminPassword = await bcrypt.hash('admin123', 12)

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@gmail.com',
      password: hashedAdminPassword,
      role: Role.ADMIN,
    },
  })

  console.log(`✅ Admin created: ${admin.email}`)

  // ─── Create Regular User ──────────────────────────
  const hashedUserPassword = await bcrypt.hash('user123', 12)

  const user = await prisma.user.create({
    data: {
      name: 'Saikat Sen',
      email: 'saikat@gmail.com',
      password: hashedUserPassword,
      role: Role.USER,
    },
  })

  console.log(`✅ User created: ${user.email}`)

  // ─── Create Grocery Items ─────────────────────────
  const groceryItems = [
    {
      name: 'Basmati Rice',
      description: 'Premium quality basmati rice, aged 2 years',
      price: 5.99,
      inventory: 100,
    },
    {
      name: 'Whole Milk',
      description: 'Fresh full-cream whole milk, 1 litre',
      price: 1.49,
      inventory: 50,
    },
    {
      name: 'Free Range Eggs',
      description: 'Farm fresh free range eggs, pack of 12',
      price: 3.99,
      inventory: 75,
    },
    {
      name: 'Sourdough Bread',
      description: 'Freshly baked sourdough bread loaf',
      price: 2.99,
      inventory: 30,
    },
    {
      name: 'Olive Oil',
      description: 'Extra virgin cold pressed olive oil, 500ml',
      price: 7.99,
      inventory: 40,
    },
    {
      name: 'Cheddar Cheese',
      description: 'Mature cheddar cheese, 400g block',
      price: 4.49,
      inventory: 60,
    },
    {
      name: 'Chicken Breast',
      description: 'Fresh boneless skinless chicken breast, 500g',
      price: 6.99,
      inventory: 45,
    },
    {
      name: 'Organic Bananas',
      description: 'Organic fair trade bananas, bunch of 6',
      price: 1.29,
      inventory: 80,
    },
    {
      name: 'Greek Yogurt',
      description: 'Thick and creamy full fat Greek yogurt, 500g',
      price: 2.49,
      inventory: 55,
    },
    {
      name: 'Orange Juice',
      description: 'Freshly squeezed orange juice, no added sugar, 1 litre',
      price: 3.49,
      inventory: 0, // ← intentionally out of stock
    },
  ]

  await prisma.groceryItem.createMany({
    data: groceryItems,
  })

  console.log(`✅ ${groceryItems.length} grocery items created`)
  console.log('   (1 item intentionally out of stock for testing)')

  // ─── Summary ──────────────────────────────────────
  console.log('\n🎉 Seed completed successfully!')
  console.log('\n📋 Test Credentials:')
  console.log('   Admin  → email: admin@grocery.com  | password: admin123')
  console.log('   User   → email: user@grocery.com   | password: user123')
  console.log('\n📦 Grocery Items: 10 created (9 in stock, 1 out of stock)')
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })