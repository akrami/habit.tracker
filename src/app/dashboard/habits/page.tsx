"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import HabitList from "@/components/habits/habit-list"
import CreateHabitDialog from "@/components/habits/create-habit-dialog"
import { Search, Plus } from "lucide-react"

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

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [filteredHabits, setFilteredHabits] = useState<Habit[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all")
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  useEffect(() => {
    fetchHabits()
  }, [])

  useEffect(() => {
    filterHabits()
  }, [habits, searchQuery, filterStatus])

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

  const filterHabits = () => {
    let filtered = habits

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(habit =>
        habit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        habit.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        habit.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(habit =>
        filterStatus === "active" ? habit.isActive : !habit.isActive
      )
    }

    setFilteredHabits(filtered)
  }

  const handleHabitCreated = (newHabit: Habit) => {
    setHabits([newHabit, ...habits])
    setShowCreateDialog(false)
  }

  const handleHabitUpdated = (updatedHabit: Habit) => {
    setHabits(habits.map(habit =>
      habit.id === updatedHabit.id ? updatedHabit : habit
    ))
  }

  const handleHabitDeleted = (habitId: string) => {
    setHabits(habits.filter(habit => habit.id !== habitId))
  }

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
        <h1 className="text-3xl font-bold text-gray-900">My Habits</h1>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Habit
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search habits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Habits</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>
            Showing {filteredHabits.length} of {habits.length} habits
          </span>
          {filterStatus !== "all" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilterStatus("all")}
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Habits List */}
      {filteredHabits.length === 0 ? (
        <div className="text-center py-12">
          {habits.length === 0 ? (
            <>
              <p className="text-gray-500 mb-4">No habits yet. Create your first habit to get started!</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Habit
              </Button>
            </>
          ) : (
            <p className="text-gray-500">No habits match your current filters.</p>
          )}
        </div>
      ) : (
        <HabitList
          habits={filteredHabits}
          onHabitUpdated={handleHabitUpdated}
          onHabitDeleted={handleHabitDeleted}
        />
      )}

      <CreateHabitDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleHabitCreated}
      />
    </div>
  )
}