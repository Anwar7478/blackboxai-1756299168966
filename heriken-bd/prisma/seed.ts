import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('Anwar147@', 12)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'anwar@khapsu.com' },
    update: {
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
      emailVerified: new Date(),
    },
    create: {
      email: 'anwar@khapsu.com',
      phone: '01700000000',
      name: 'Anwar Admin',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
      emailVerified: new Date(),
      phoneVerified: new Date(),
    },
  })

  console.log('✅ Admin user created:', adminUser.email)

  // Create some sample categories
  const categories = [
    {
      name: 'ইলেকট্রনিক্স',
      nameEn: 'Electronics',
      slug: 'electronics',
      description: 'সকল ইলেকট্রনিক পণ্য',
    },
    {
      name: 'ফ্যাশন',
      nameEn: 'Fashion',
      slug: 'fashion',
      description: 'পোশাক ও ফ্যাশন আইটেম',
    },
    {
      name: 'হোম অ্যান্ড গার্ডেন',
      nameEn: 'Home & Garden',
      slug: 'home-garden',
      description: 'ঘর ও বাগানের জিনিসপত্র',
    },
    {
      name: 'স্পোর্টস',
      nameEn: 'Sports',
      slug: 'sports',
      description: 'খেলাধুলার সামগ্রী',
    },
    {
      name: 'বই',
      nameEn: 'Books',
      slug: 'books',
      description: 'সকল ধরনের বই',
    },
    {
      name: 'বিউটি',
      nameEn: 'Beauty',
      slug: 'beauty',
      description: 'সৌন্দর্য পণ্য',
    },
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    })
  }

  console.log('✅ Categories created')

  // Create some sample brands
  const brands = [
    { name: 'Samsung', slug: 'samsung', description: 'Samsung Electronics' },
    { name: 'Apple', slug: 'apple', description: 'Apple Inc.' },
    { name: 'Nike', slug: 'nike', description: 'Nike Sports' },
    { name: 'Adidas', slug: 'adidas', description: 'Adidas Sports' },
    { name: 'Unilever', slug: 'unilever', description: 'Unilever Products' },
  ]

  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: brand,
      create: brand,
    })
  }

  console.log('✅ Brands created')

  // Create some sample products
  const electronicsCategory = await prisma.category.findUnique({
    where: { slug: 'electronics' }
  })

  const fashionCategory = await prisma.category.findUnique({
    where: { slug: 'fashion' }
  })

  const samsungBrand = await prisma.brand.findUnique({
    where: { slug: 'samsung' }
  })

  const nikeBrand = await prisma.brand.findUnique({
    where: { slug: 'nike' }
  })

  if (electronicsCategory && samsungBrand) {
    await prisma.product.upsert({
      where: { slug: 'samsung-galaxy-s21' },
      update: {},
      create: {
        name: 'Samsung Galaxy S21',
        nameEn: 'Samsung Galaxy S21',
        slug: 'samsung-galaxy-s21',
        description: 'সর্বশেষ Samsung Galaxy S21 স্মার্টফোন',
        descriptionEn: 'Latest Samsung Galaxy S21 smartphone',
        shortDescription: 'প্রিমিয়াম স্মার্টফোন',
        price: 45000,
        originalPrice: 50000,
        sku: 'SAM-GAL-S21',
        stock: 50,
        categoryId: electronicsCategory.id,
        brandId: samsungBrand.id,
        isActive: true,
        isFeatured: true,
        isNew: true,
        images: JSON.stringify(['/products/samsung-s21.jpg']),
        metaTitle: 'Samsung Galaxy S21 - Best Price in Bangladesh',
        metaDescription: 'Buy Samsung Galaxy S21 at best price in Bangladesh',
      },
    })
  }

  if (fashionCategory && nikeBrand) {
    await prisma.product.upsert({
      where: { slug: 'nike-air-max-270' },
      update: {},
      create: {
        name: 'Nike Air Max 270',
        nameEn: 'Nike Air Max 270',
        slug: 'nike-air-max-270',
        description: 'আরামদায়ক Nike Air Max 270 জুতা',
        descriptionEn: 'Comfortable Nike Air Max 270 shoes',
        shortDescription: 'স্পোর্টস জুতা',
        price: 8500,
        originalPrice: 10000,
        sku: 'NIKE-AM-270',
        stock: 30,
        categoryId: fashionCategory.id,
        brandId: nikeBrand.id,
        isActive: true,
        isFeatured: true,
        images: JSON.stringify(['/products/nike-air-max.jpg']),
        metaTitle: 'Nike Air Max 270 - Best Sports Shoes',
        metaDescription: 'Buy Nike Air Max 270 sports shoes in Bangladesh',
      },
    })
  }

  console.log('✅ Sample products created')

  // Create some sample orders
  const sampleCustomer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      phone: '01712345678',
      name: 'রহিম উদ্দিন',
      role: 'USER',
      isActive: true,
      emailVerified: new Date(),
      phoneVerified: new Date(),
    },
  })

  const sampleProduct = await prisma.product.findFirst({
    where: { slug: 'samsung-galaxy-s21' }
  })

  if (sampleProduct && sampleCustomer) {
    const sampleOrder = await prisma.order.create({
      data: {
        orderNumber: 'ORD-2024-001',
        userId: sampleCustomer.id,
        status: 'PENDING',
        paymentStatus: 'PARTIAL_PAID',
        fulfillmentStatus: 'UNFULFILLED',
        subtotal: 45000,
        totalAmount: 45000,
        prepaidAmount: 20000,
        codAmount: 25000,
        shippingName: 'রহিম উদ্দিন',
        shippingPhone: '01712345678',
        shippingAddress: JSON.stringify({
          name: 'রহিম উদ্দিন',
          phone: '01712345678',
          region: 'ঢাকা',
          city: 'ঢাকা',
          area: 'ধানমন্ডি',
          addressLine: 'রোড ২৭, বাড়ি ১২',
          postcode: '1205'
        }),
        items: {
          create: {
            productId: sampleProduct.id,
            quantity: 1,
            unitPrice: 45000,
            totalPrice: 45000,
            depositRequired: 20000,
            productSnapshot: JSON.stringify({
              name: sampleProduct.name,
              price: sampleProduct.price,
              images: sampleProduct.images
            })
          }
        }
      }
    })

    console.log('✅ Sample order created:', sampleOrder.orderNumber)
  }

  // Create some system settings
  const settings = [
    {
      key: 'site_name',
      value: 'Heriken',
      type: 'STRING',
      group: 'general',
      description: 'Site name'
    },
    {
      key: 'site_description',
      value: 'Bangladesh\'s Premier E-commerce Platform',
      type: 'STRING',
      group: 'general',
      description: 'Site description'
    },
    {
      key: 'currency',
      value: 'BDT',
      type: 'STRING',
      group: 'general',
      description: 'Default currency'
    },
    {
      key: 'free_shipping_threshold',
      value: '1000',
      type: 'NUMBER',
      group: 'shipping',
      description: 'Free shipping threshold amount'
    },
    {
      key: 'default_shipping_charge',
      value: '60',
      type: 'NUMBER',
      group: 'shipping',
      description: 'Default shipping charge'
    }
  ]

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting as any,
    })
  }

  console.log('✅ System settings created')

  console.log('🎉 Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
