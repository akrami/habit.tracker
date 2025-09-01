"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle, Circle, Edit3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import HabitNotesDialog from "./habit-notes-dialog"
import { format } from "date-fns"

interface HabitCardProps {
  habit: {
    id: string
    name: string
    description?: string
    color: string
    icon?: string
    target: number
    unit?: string
    category?: {
      name: string
      color: string
    }
    entries?: Array<{
      date: string
      value: number
      notes?: string
    }>
  }
  isCompleted: boolean
  streak: number
  onToggle: (completed: boolean) => void
  onRefresh?: () => void
}

export default function HabitCard({ habit, isCompleted, streak, onToggle, onRefresh }: HabitCardProps) {
  const [showNotesDialog, setShowNotesDialog] = useState(false)
  
  const today = format(new Date(), "yyyy-MM-dd")
  const todayEntry = habit.entries?.find(entry => entry.date === today)

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl"
            style={{ backgroundColor: habit.color }}
          >
            {habit.icon || "📋"}
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{habit.name}</h3>
            {habit.description && (
              <p className="text-sm text-gray-600 mt-1 dark:text-gray-400">{habit.description}</p>
            )}
            {todayEntry?.notes && (
              <p className="text-sm text-blue-600 mt-1 italic dark:text-blue-400">&quot;{todayEntry.notes}&quot;</p>
            )}
            <div className="flex items-center space-x-4 mt-2">
              {habit.category && (
                <span 
                  className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: habit.category.color }}
                >
                  {habit.category.name}
                </span>
              )}
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Target: {habit.target}{habit.unit && ` ${habit.unit}`}
              </span>
              {streak > 0 && (
                <span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-800/30 dark:text-orange-500">
                  🔥 {streak} day streak
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotesDialog(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Edit3 className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onClick={() => onToggle(!isCompleted)}
            className={cn(
              "p-2 hover:bg-gray-100 dark:hover:bg-gray-700",
              isCompleted && "text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400"
            )}
          >
            {isCompleted ? (
              <CheckCircle className="h-8 w-8" />
            ) : (
              <Circle className="h-8 w-8" />
            )}
          </Button>
        </div>
      </div>

      <HabitNotesDialog
        habitId={habit.id}
        habitName={habit.name}
        date={today}
        initialNotes={todayEntry?.notes || ""}
        initialValue={todayEntry?.value || 1}
        open={showNotesDialog}
        onOpenChange={setShowNotesDialog}
        onSuccess={() => onRefresh?.()}
      />
    </div>
  )
}