"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { format } from "date-fns"

interface HabitNotesDialogProps {
  habitId: string
  habitName: string
  date: string
  initialNotes?: string
  initialValue?: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function HabitNotesDialog({
  habitId,
  habitName,
  date,
  initialNotes = "",
  initialValue = 1,
  open,
  onOpenChange,
  onSuccess
}: HabitNotesDialogProps) {
  const [notes, setNotes] = useState(initialNotes)
  const [value, setValue] = useState(initialValue)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setNotes(initialNotes)
      setValue(initialValue)
    }
  }, [open, initialNotes, initialValue])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/habits/${habitId}/entries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date,
          value,
          notes: notes.trim() || undefined,
        }),
      })

      if (response.ok) {
        onSuccess()
        onOpenChange(false)
      }
    } catch (error) {
      console.error("Failed to update habit entry:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{habitName}</DialogTitle>
          <p className="text-sm text-gray-600">
            {format(new Date(date), "EEEE, MMMM d, yyyy")}
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="value">Progress</Label>
            <Input
              id="value"
              type="number"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              min={0}
              step="0.1"
              placeholder="Enter your progress"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did it go? Any thoughts or reflections..."
              className="w-full min-h-[120px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-vertical"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}