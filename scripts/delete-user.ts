#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const emailSchema = z.string().email('Invalid email address')

async function deleteUser() {
  const args = process.argv.slice(2)
  
  if (args.length < 1) {
    console.error('❌ Usage: npm run user:delete <email>')
    console.error('   Example: npm run user:delete john@example.com')
    process.exit(1)
  }

  const [email] = args

  try {
    // Validate email
    const validatedEmail = emailSchema.parse(email)

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedEmail }
    })

    if (!existingUser) {
      console.error(`❌ User with email ${validatedEmail} does not exist`)
      process.exit(1)
    }

    // Delete user (this will cascade delete related data due to Prisma schema)
    await prisma.user.delete({
      where: { email: validatedEmail }
    })

    console.log('✅ User deleted successfully!')
    console.log(`   Email: ${validatedEmail}`)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid email address')
    } else {
      console.error('❌ Error deleting user:', error instanceof Error ? error.message : 'Unknown error')
    }
    process.exit(1)
  }
}

deleteUser()
  .catch((e) => {
    console.error('❌ Unexpected error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })