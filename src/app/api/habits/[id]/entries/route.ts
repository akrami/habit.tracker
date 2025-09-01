import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createEntrySchema = z.object({
  date: z.string(),
  value: z.number().min(1).default(1),
  notes: z.string().optional(),
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

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("start")
    const endDate = searchParams.get("end")
    const { id } = await params

    const habit = await prisma.habit.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 })
    }

    const entries = await prisma.habitEntry.findMany({
      where: {
        habitId: id,
        ...(startDate && endDate ? {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        } : {}),
      },
      orderBy: {
        date: "desc",
      },
    })

    return NextResponse.json(entries)
  } catch (error) {
    console.error("Error fetching entries:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const data = createEntrySchema.parse(body)
    const { id } = await params

    const habit = await prisma.habit.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 })
    }

    const entry = await prisma.habitEntry.upsert({
      where: {
        habitId_date: {
          habitId: id,
          date: new Date(data.date),
        },
      },
      update: {
        value: data.value,
        notes: data.notes,
      },
      create: {
        habitId: id,
        date: new Date(data.date),
        value: data.value,
        notes: data.notes,
      },
    })

    return NextResponse.json(entry)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating entry:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}