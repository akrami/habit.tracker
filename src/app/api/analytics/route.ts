import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all habits (active and inactive) with all entries for analytics
    const habits = await prisma.habit.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        entries: {
          orderBy: {
            date: "desc",
          },
          // Get more entries for analytics - last year of data
          take: 365,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Transform the data to ensure dates are serialized as strings
    const transformedHabits = habits.map(habit => ({
      ...habit,
      entries: habit.entries.map(entry => ({
        ...entry,
        date: entry.date.toISOString().split('T')[0] // Convert to YYYY-MM-DD format
      }))
    }))

    return NextResponse.json(transformedHabits)
  } catch (error) {
    console.error("Error fetching analytics data:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}