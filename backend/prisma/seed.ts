import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample users
  const users = [
    {
      email: 'admin@gmail.com',
      username: 'admin',
      password: 'admin', // In production, this should be hashed
      role: 'ADMIN' as const,
      firstName: 'System',
      lastName: 'Administrator',
    },
    {
      email: 'manager@gmail.com',
      username: 'manager',
      password: 'manager', // In production, this should be hashed
      role: 'MANAGER' as const,
      firstName: 'Jane',
      lastName: 'Manager',
    },
    {
      email: 'cashier@gmail.com',
      username: 'cashier',
      password: 'cashier', // In production, this should be hashed
      role: 'CASHIER' as const,
      firstName: 'John',
      lastName: 'Cashier',
    },
  ];

  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData,
    });
    console.log(`✅ Created user: ${user.email} (${user.role})`);
  }

  // Create sample products
  const products = [
    {
      barcode: '1234567890123',
      name: 'Premium Coffee Beans',
      description: 'High-quality arabica coffee beans',
      price: 15.99,
      cost: 8.50,
      stockQuantity: 50,
      minStockLevel: 10,
    },
    {
      barcode: '9876543210987',
      name: 'Organic Milk',
      description: 'Fresh organic whole milk',
      price: 4.99,
      cost: 2.50,
      stockQuantity: 30,
      minStockLevel: 5,
    },
    {
      barcode: '5555555555555',
      name: 'Fresh Bread',
      description: 'Daily baked whole wheat bread',
      price: 3.49,
      cost: 1.20,
      stockQuantity: 25,
      minStockLevel: 5,
    },
    {
      barcode: '1111111111111',
      name: 'Energy Drink',
      description: 'Refreshing energy drink',
      price: 2.99,
      cost: 1.50,
      stockQuantity: 100,
      minStockLevel: 20,
    },
  ];

  for (const productData of products) {
    const product = await prisma.product.upsert({
      where: { barcode: productData.barcode },
      update: {},
      create: productData,
    });
    console.log(`✅ Created product: ${product.name} (${product.barcode})`);
  }

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
