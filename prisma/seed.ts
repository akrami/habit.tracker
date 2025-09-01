import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create default categories
  const categories = [
    {
      name: 'Health & Fitness',
      description: 'Physical health and exercise related habits',
      color: '#10b981',
      icon: '💪',
    },
    {
      name: 'Learning',
      description: 'Educational and skill development habits',
      color: '#3b82f6',
      icon: '📚',
    },
    {
      name: 'Productivity',
      description: 'Work and productivity related habits',
      color: '#6366f1',
      icon: '⚡',
    },
    {
      name: 'Wellness',
      description: 'Mental health and wellbeing habits',
      color: '#8b5cf6',
      icon: '🧘',
    },
    {
      name: 'Social',
      description: 'Relationships and social habits',
      color: '#ec4899',
      icon: '👥',
    },
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    })
  }

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })