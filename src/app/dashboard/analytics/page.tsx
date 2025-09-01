"use client"

import { useEffect, useState } from "react"
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import CalendarHeatmap from "react-calendar-heatmap"
import "react-calendar-heatmap/dist/styles.css"

interface Habit {
  id: string
  name: string
  color: string
  entries: Array<{
    date: string
    value: number
  }>
}

export default function AnalyticsPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [selectedHabit, setSelectedHabit] = useState<string>("")
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchHabits()
  }, [])

  const fetchHabits = async () => {
    try {
      const response = await fetch("/api/habits")
      if (response.ok) {
        const data = await response.json()
        setHabits(data)
        if (data.length > 0) {
          setSelectedHabit(data[0].id)
        }
      }
    } catch (error) {
      console.error("Failed to fetch habits:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getDateRange = () => {
    const now = new Date()
    switch (timeRange) {
      case "week":
        return { start: startOfWeek(now), end: endOfWeek(now) }
      case "month":
        return { start: startOfMonth(now), end: endOfMonth(now) }
      case "year":
        return { start: subDays(now, 365), end: now }
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) }
    }
  }

  const getCompletionData = () => {
    const { start, end } = getDateRange()
    const days: { date: string; completed: number; total: number }[] = []
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = format(d, "yyyy-MM-dd")
      const completed = habits.filter(habit => 
        habit.entries.some(entry => entry.date === dateStr && entry.value > 0)
      ).length
      
      days.push({
        date: format(d, "MM/dd"),
        completed,
        total: habits.length,
      })
    }
    
    return days
  }

  const getStreakData = () => {
    return habits.map(habit => {
      let currentStreak = 0
      let maxStreak = 0
      let tempStreak = 0
      
      const sortedEntries = habit.entries
        .filter(entry => entry.value > 0)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      const today = format(new Date(), "yyyy-MM-dd")
      let lastDate = new Date()
      lastDate.setDate(lastDate.getDate() - 1)

      // Calculate current streak
      for (let i = 0; i < 30; i++) {
        const checkDate = format(lastDate, "yyyy-MM-dd")
        const hasEntry = habit.entries.some(entry => entry.date === checkDate && entry.value > 0)
        
        if (hasEntry) {
          currentStreak++
        } else {
          break
        }
        
        lastDate.setDate(lastDate.getDate() - 1)
      }

      // Calculate max streak
      for (let i = 0; i < sortedEntries.length; i++) {
        if (i === 0) {
          tempStreak = 1
        } else {
          const prevDate = new Date(sortedEntries[i - 1].date)
          const currDate = new Date(sortedEntries[i].date)
          const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))
          
          if (diffDays === 1) {
            tempStreak++
          } else {
            maxStreak = Math.max(maxStreak, tempStreak)
            tempStreak = 1
          }
        }
      }
      maxStreak = Math.max(maxStreak, tempStreak)

      return {
        name: habit.name,
        currentStreak,
        maxStreak,
        color: habit.color,
      }
    })
  }

  const getHeatmapData = () => {
    const selectedHabitData = habits.find(h => h.id === selectedHabit)
    if (!selectedHabitData) return []

    const startDate = subDays(new Date(), 365)
    const data: { date: string; count: number }[] = []

    for (let d = new Date(startDate); d <= new Date(); d.setDate(d.getDate() + 1)) {
      const dateStr = format(d, "yyyy-MM-dd")
      const entry = selectedHabitData.entries.find(e => e.date === dateStr)
      
      data.push({
        date: dateStr,
        count: entry?.value || 0,
      })
    }

    return data
  }

  const completionData = getCompletionData()
  const streakData = getStreakData()
  const heatmapData = getHeatmapData()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (habits.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No habits to analyze yet.</p>
        <p className="text-sm text-gray-400">Create some habits and start tracking to see your analytics!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <div className="flex space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Total Habits</h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">{habits.length}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Today's Completion</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {completionData.length > 0 ? 
              `${Math.round((completionData[completionData.length - 1]?.completed || 0) / (completionData[completionData.length - 1]?.total || 1) * 100)}%` 
              : "0%"
            }
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Best Streak</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {Math.max(...streakData.map(s => s.maxStreak), 0)} days
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Active Streaks</h3>
          <p className="text-3xl font-bold text-orange-600 mt-2">
            {streakData.filter(s => s.currentStreak > 0).length}
          </p>
        </div>
      </div>

      {/* Completion Trends */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Completion Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={completionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="completed"
              stroke="#6366f1"
              strokeWidth={2}
              name="Completed Habits"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Streak Analysis */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Streak Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={streakData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="currentStreak" fill="#10b981" name="Current Streak" />
            <Bar dataKey="maxStreak" fill="#6366f1" name="Max Streak" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Habit Heatmap */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Year Overview</h3>
          <select
            value={selectedHabit}
            onChange={(e) => setSelectedHabit(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            {habits.map(habit => (
              <option key={habit.id} value={habit.id}>{habit.name}</option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <CalendarHeatmap
            startDate={subDays(new Date(), 365)}
            endDate={new Date()}
            values={heatmapData}
            classForValue={(value) => {
              if (!value || value.count === 0) {
                return 'color-empty'
              }
              return `color-github-${Math.min(value.count, 4)}`
            }}
            titleForValue={(value) => {
              if (!value) return ''
              return `${value.date}: ${value.count || 0} completed`
            }}
            showWeekdayLabels={true}
          />
        </div>
      </div>
    </div>
  )
}