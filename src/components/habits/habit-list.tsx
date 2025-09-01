"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { MoreHorizontal, Edit, Trash2, CheckCircle, Circle } from "lucide-react"
import EditHabitDialog from "./edit-habit-dialog"

interface Habit {
  id: string
  name: string
  description?: string
  color: string
  icon?: string
  frequency: string
  target: number
  unit?: string
  isActive: boolean
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
  goals: Array<{
    id: string
    title: string
    target: number
    isCompleted: boolean
  }>
}

interface HabitListProps {
  habits: Habit[]
  onHabitUpdated: (habit: Habit) => void
  onHabitDeleted: (habitId: string) => void
}

export default function HabitList({ habits, onHabitUpdated, onHabitDeleted }: HabitListProps) {
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [showDropdown, setShowDropdown] = useState<string | null>(null)

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

  const getTodaysEntry = (habit: Habit) => {
    const today = format(new Date(), "yyyy-MM-dd")
    return habit.entries.find(entry => entry.date === today)
  }

  const handleToggleToday = async (habit: Habit) => {
    const today = format(new Date(), "yyyy-MM-dd")
    const todayEntry = getTodaysEntry(habit)
    const newValue = todayEntry && todayEntry.value > 0 ? 0 : 1

    try {
      const response = await fetch(`/api/habits/${habit.id}/entries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: today,
          value: newValue,
        }),
      })

      if (response.ok) {
        const updatedEntry = await response.json()
        const updatedHabit = {
          ...habit,
          entries: [
            ...habit.entries.filter(e => e.date !== today),
            updatedEntry,
          ],
        }
        onHabitUpdated(updatedHabit)
      }
    } catch (error) {
      console.error("Failed to update habit entry:", error)
    }
  }

  const handleDelete = async (habitId: string) => {
    if (!confirm("Are you sure you want to delete this habit? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/habits/${habitId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        onHabitDeleted(habitId)
      }
    } catch (error) {
      console.error("Failed to delete habit:", error)
    }
  }

  const handleToggleActive = async (habit: Habit) => {
    try {
      const response = await fetch(`/api/habits/${habit.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !habit.isActive,
        }),
      })

      if (response.ok) {
        const updatedHabit = await response.json()
        onHabitUpdated(updatedHabit)
      }
    } catch (error) {
      console.error("Failed to update habit:", error)
    }
  }

  return (
    <div className="space-y-4">
      {habits.map((habit) => {
        const todayEntry = getTodaysEntry(habit)
        const isCompletedToday = todayEntry && todayEntry.value > 0
        const streak = getStreak(habit)
        const completionRate = habit.entries.length > 0 
          ? Math.round((habit.entries.filter(e => e.value > 0).length / habit.entries.length) * 100)
          : 0

        return (
          <div
            key={habit.id}
            className={`bg-white rounded-lg shadow-sm border p-6 ${
              !habit.isActive ? "opacity-60" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl"
                  style={{ backgroundColor: habit.color }}
                >
                  {habit.icon || "📋"}
                </div>

                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {habit.name}
                    </h3>
                    {!habit.isActive && (
                      <span className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                  
                  {habit.description && (
                    <p className="text-sm text-gray-600 mt-1">{habit.description}</p>
                  )}

                  <div className="flex items-center space-x-4 mt-2">
                    {habit.category && (
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: habit.category.color }}
                      >
                        {habit.category.name}
                      </span>
                    )}
                    <span className="text-sm text-gray-500">
                      {habit.frequency} • Target: {habit.target}{habit.unit && ` ${habit.unit}`}
                    </span>
                    {streak > 0 && (
                      <span className="text-sm font-medium text-orange-600">
                        🔥 {streak} day streak
                      </span>
                    )}
                    <span className="text-sm text-gray-500">
                      {completionRate}% completion rate
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {habit.isActive && (
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => handleToggleToday(habit)}
                    className="p-2 hover:bg-gray-100"
                  >
                    {isCompletedToday ? (
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    ) : (
                      <Circle className="h-8 w-8 text-gray-400" />
                    )}
                  </Button>
                )}

                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDropdown(
                      showDropdown === habit.id ? null : habit.id
                    )}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>

                  {showDropdown === habit.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-10">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setEditingHabit(habit)
                            setShowDropdown(null)
                          }}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            handleToggleActive(habit)
                            setShowDropdown(null)
                          }}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          {habit.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => {
                            handleDelete(habit.id)
                            setShowDropdown(null)
                          }}
                          className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {editingHabit && (
        <EditHabitDialog
          habit={editingHabit}
          open={!!editingHabit}
          onOpenChange={(open) => !open && setEditingHabit(null)}
          onSuccess={(updatedHabit) => {
            onHabitUpdated({
              ...updatedHabit,
              isActive: true,
              entries: editingHabit.entries || [],
              goals: editingHabit.goals || [],
            } as Habit)
            setEditingHabit(null)
          }}
        />
      )}
    </div>
  )
}