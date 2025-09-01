import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createHabitSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  color: z.string().default("#6366f1"),
  icon: z.string().optional(),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "CUSTOM"]).default("DAILY"),
  target: z.number().min(1).default(1),
  unit: z.string().optional(),
  reminderTime: z.string().optional(),
  categoryId: z.string().optional(),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const habits = await prisma.habit.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
        entries: {
          orderBy: {
            date: "desc",
          },
          take: 30,
        },
        goals: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(habits)
  } catch (error) {
    console.error("Error fetching habits:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const data = createHabitSchema.parse(body)

    const habit = await prisma.habit.create({
      data: {
        ...data,
        reminderTime: data.reminderTime ? new Date(data.reminderTime) : null,
        userId: session.user.id,
      },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    })

    return NextResponse.json(habit)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating habit:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}