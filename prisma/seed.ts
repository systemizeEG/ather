import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

const prisma = new PrismaClient()

async function main() {
  const existingAdmin = await prisma.adminUser.findUnique({
    where: { username: 'admin' }
  })

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10)
    await prisma.adminUser.create({
      data: {
        username: 'admin',
        email: 'admin@example.com',
        passwordHash: hashedPassword,
        role: 'SUPERADMIN'
      }
    })
    console.log('✅ Default admin created. (admin / admin123)')
  } else {
    console.log('ℹ️ Admin user already exists.')
  }

  const existingSettings = await prisma.settings.findFirst()
  if (!existingSettings) {
    await prisma.settings.create({
      data: {
        instapayReceiverName: 'Store Owner',
        instapayAccount: 'owner@instapay',
        whatsappNumber: '+201000000000',
        storeName: 'أثر | Ather',
        supportText: 'Contact us for any issues 24/7'
      }
    })
    console.log('✅ Default settings created.')
  } else {
    console.log('ℹ️ Settings already exist.')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
