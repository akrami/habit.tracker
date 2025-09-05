import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateHabitSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "CUSTOM"]).optional(),
  target: z.number().min(1).optional(),
  unit: z.string().optional(),
  reminderTime: z.string().optional(),
  categoryId: z.string().optional(),
  isActive: z.boolean().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const habit = await prisma.habit.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        category: true,
        entries: {
          orderBy: {
            date: "desc",
          },
        },
      },
    })

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 })
    }

    return NextResponse.json(habit)
  } catch (error) {
    console.error("Error fetching habit:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const data = updateHabitSchema.parse(body)
    const { id } = await params

    const existingHabit = await prisma.habit.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingHabit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 })
    }

    const habit = await prisma.habit.update({
      where: {
        id,
      },
      data: {
        ...data,
        reminderTime: data.reminderTime ? new Date(data.reminderTime) : undefined,
      },
      include: {
        category: true,
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

    console.error("Error updating habit:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const existingHabit = await prisma.habit.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingHabit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 })
    }

    await prisma.habit.update({
      where: {
        id,
      },
      data: {
        isActive: false,
      },
    })

    return NextResponse.json({ message: "Habit deleted successfully" })
  } catch (error) {
    console.error("Error deleting habit:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}