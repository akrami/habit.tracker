"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import HabitCard from "@/components/habits/habit-card"
import CreateHabitDialog from "@/components/habits/create-habit-dialog"
import { format } from "date-fns"

interface Habit {
  id: string
  name: string
  description?: string
  color: string
  icon?: string
  frequency: string
  target: number
  unit?: string
  category?: {
    id: string
    name: string
    color: string
  }
  entries: Array<{
    id: string
    date: string
    value: number
    notes?: string
  }>
}

export default function DashboardPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  useEffect(() => {
    fetchHabits()
  }, [])

  const fetchHabits = async () => {
    try {
      const response = await fetch("/api/habits")
      if (response.ok) {
        const data = await response.json()
        setHabits(data)
      }
    } catch (error) {
      console.error("Failed to fetch habits:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleHabitCreated = (newHabit: Habit) => {
    setHabits([newHabit, ...habits])
    setShowCreateDialog(false)
  }

  const handleHabitToggle = async (habitId: string, date: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/habits/${habitId}/entries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date,
          value: completed ? 1 : 0,
        }),
      })

      if (response.ok) {
        fetchHabits()
      }
    } catch (error) {
      console.error("Failed to update habit:", error)
    }
  }

  const getTodaysStats = () => {
    const today = format(new Date(), "yyyy-MM-dd")
    const todayEntries = habits.flatMap(habit => 
      habit.entries.filter(entry => entry.date === today)
    )
    const completed = todayEntries.filter(entry => entry.value > 0).length
    const total = habits.length

    return { completed, total }
  }

  const getStreak = (habit: Habit) => {
    let streak = 0
    const sortedEntries = habit.entries
      .filter(entry => entry.value > 0)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date)
      const expectedDate = new Date()
      expectedDate.setDate(expectedDate.getDate() - i)

      if (format(entryDate, "yyyy-MM-dd") === format(expectedDate, "yyyy-MM-dd")) {
        streak++
      } else {
        break
      }
    }

    return streak
  }

  const stats = getTodaysStats()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Dashboard</h1>
        <Button onClick={() => setShowCreateDialog(true)}>
          Add Habit
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Today's Progress</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2 dark:text-blue-500">
            {stats.completed}/{stats.total}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">habits completed</p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Active Habits</h3>
          <p className="text-3xl font-bold text-green-600 mt-2 dark:text-green-500">{habits.length}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">total habits</p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Completion Rate</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2 dark:text-purple-500">
            {habits.length > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">today</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Today's Habits</h2>
        {habits.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4 dark:text-gray-400">No habits yet. Create your first habit to get started!</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              Create Your First Habit
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {habits.map((habit) => {
              const today = format(new Date(), "yyyy-MM-dd")
              const todayEntry = habit.entries.find(entry => entry.date === today)
              const isCompleted = todayEntry && todayEntry.value > 0

              return (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  isCompleted={!!isCompleted}
                  streak={getStreak(habit)}
                  onToggle={(completed) => handleHabitToggle(habit.id, today, completed)}
                  onRefresh={fetchHabits}
                />
              )
            })}
          </div>
        )}
      </div>

      <CreateHabitDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleHabitCreated}
      />
    </div>
  )
}