#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const prisma = new PrismaClient()

const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

async function createUser() {
  const args = process.argv.slice(2)
  
  if (args.length < 3) {
    console.error('❌ Usage: npm run user:create <name> <email> <password>')
    console.error('   Example: npm run user:create "John Doe" john@example.com mypassword123')
    process.exit(1)
  }

  const [name, email, password] = args

  try {
    // Validate input
    const validatedData = userSchema.parse({ name, email, password })

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      console.error(`❌ User with email ${validatedData.email} already exists`)
      process.exit(1)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
      }
    })

    console.log('✅ User created successfully!')
    console.log(`   Name: ${user.name}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   ID: ${user.id}`)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Validation errors:')
      error.errors.forEach(err => {
        console.error(`   - ${err.path.join('.')}: ${err.message}`)
      })
    } else {
      console.error('❌ Error creating user:', error instanceof Error ? error.message : 'Unknown error')
    }
    process.exit(1)
  }
}

createUser()
  .catch((e) => {
    console.error('❌ Unexpected error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })