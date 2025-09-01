"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { CheckCircle, Plus, Target, Calendar } from "lucide-react"
import { format } from "date-fns"

interface Goal {
  id: string
  title: string
  description?: string
  target: number
  deadline?: string
  isCompleted: boolean
  habit: {
    id: string
    name: string
    color: string
  }
  createdAt: string
}

interface Habit {
  id: string
  name: string
  color: string
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "completed">("all")

  // Create goal form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [target, setTarget] = useState(7)
  const [deadline, setDeadline] = useState("")
  const [habitId, setHabitId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchGoals()
    fetchHabits()
  }, [])

  const fetchGoals = async () => {
    try {
      const response = await fetch("/api/goals")
      if (response.ok) {
        const data = await response.json()
        setGoals(data)
      }
    } catch (error) {
      console.error("Failed to fetch goals:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchHabits = async () => {
    try {
      const response = await fetch("/api/habits")
      if (response.ok) {
        const data = await response.json()
        setHabits(data)
      }
    } catch (error) {
      console.error("Failed to fetch habits:", error)
    }
  }

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description: description || undefined,
          target,
          deadline: deadline || undefined,
          habitId,
        }),
      })

      if (response.ok) {
        const newGoal = await response.json()
        setGoals([newGoal, ...goals])
        resetForm()
        setShowCreateDialog(false)
      }
    } catch (error) {
      console.error("Failed to create goal:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleGoal = async (goalId: string, isCompleted: boolean) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isCompleted }),
      })

      if (response.ok) {
        const updatedGoal = await response.json()
        setGoals(goals.map(goal => 
          goal.id === goalId ? updatedGoal : goal
        ))
      }
    } catch (error) {
      console.error("Failed to update goal:", error)
    }
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setTarget(7)
    setDeadline("")
    setHabitId("")
  }

  const filteredGoals = goals.filter(goal => {
    if (filterStatus === "active") return !goal.isCompleted
    if (filterStatus === "completed") return goal.isCompleted
    return true
  })

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
        <h1 className="text-3xl font-bold text-gray-900">Goals</h1>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Goal
        </Button>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-lg shadow">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Goals</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
        <span className="ml-4 text-sm text-gray-600">
          Showing {filteredGoals.length} of {goals.length} goals
        </span>
      </div>

      {/* Goals List */}
      {filteredGoals.length === 0 ? (
        <div className="text-center py-12">
          {goals.length === 0 ? (
            <>
              <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No goals yet. Set your first goal to stay motivated!</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Goal
              </Button>
            </>
          ) : (
            <p className="text-gray-500">No goals match your current filter.</p>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredGoals.map((goal) => (
            <div
              key={goal.id}
              className={`bg-white rounded-lg shadow-sm border p-6 ${
                goal.isCompleted ? "opacity-75" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: goal.habit.color }}
                    />
                    <h3 className={`text-lg font-semibold ${
                      goal.isCompleted ? "line-through text-gray-500" : "text-gray-900"
                    }`}>
                      {goal.title}
                    </h3>
                    {goal.isCompleted && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>

                  {goal.description && (
                    <p className="text-sm text-gray-600 mt-2">{goal.description}</p>
                  )}

                  <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Target className="w-4 h-4 mr-1" />
                      Target: {goal.target} days
                    </span>
                    <span>Habit: {goal.habit.name}</span>
                    {goal.deadline && (
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Deadline: {format(new Date(goal.deadline), "MMM d, yyyy")}
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleGoal(goal.id, !goal.isCompleted)}
                  className="ml-4"
                >
                  {goal.isCompleted ? "Mark as Active" : "Mark Complete"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Goal Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Goal</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateGoal} className="space-y-4">
            <div>
              <Label htmlFor="title">Goal Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Exercise for 30 days straight"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-vertical"
              />
            </div>

            <div>
              <Label>Habit *</Label>
              <Select value={habitId} onValueChange={setHabitId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a habit" />
                </SelectTrigger>
                <SelectContent>
                  {habits.map((habit) => (
                    <SelectItem key={habit.id} value={habit.id}>
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: habit.color }}
                        />
                        {habit.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="target">Target (days) *</Label>
                <Input
                  id="target"
                  type="number"
                  value={target}
                  onChange={(e) => setTarget(Number(e.target.value))}
                  min={1}
                  required
                />
              </div>

              <div>
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Goal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}