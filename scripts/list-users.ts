#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: {
          select: {
            habits: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (users.length === 0) {
      console.log('📭 No users found')
      return
    }

    console.log(`👥 Found ${users.length} user${users.length === 1 ? '' : 's'}:\n`)
    
    users.forEach((user, index) => {
      const createdDate = user.createdAt.toLocaleDateString()
      console.log(`${index + 1}. ${user.name || 'No name'}`)
      console.log(`   📧 Email: ${user.email}`)
      console.log(`   🆔 ID: ${user.id}`)
      console.log(`   📅 Created: ${createdDate}`)
      console.log(`   ✅ Habits: ${user._count.habits}`)
      console.log()
    })
  } catch (error) {
    console.error('❌ Error listing users:', error instanceof Error ? error.message : 'Unknown error')
    process.exit(1)
  }
}

listUsers()
  .catch((e) => {
    console.error('❌ Unexpected error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })