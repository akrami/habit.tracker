"use client"

import { useEffect, useState } from "react"
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns"
import dynamic from "next/dynamic"
import CalendarHeatmap from "react-calendar-heatmap"
import "react-calendar-heatmap/dist/styles.css"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface Habit {
  id: string
  name: string
  color: string
  isActive: boolean
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
      const response = await fetch("/api/analytics")
      if (response.ok) {
        const data = await response.json()
        setHabits(data)
        const activeHabits = data.filter((h: Habit) => h.isActive)
        if (activeHabits.length > 0) {
          setSelectedHabit(activeHabits[0].id)
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
    const activeHabits = habits.filter(habit => habit.isActive)
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = format(d, "yyyy-MM-dd")
      const completed = activeHabits.filter(habit => 
        habit.entries.some(entry => entry.date === dateStr && entry.value > 0)
      ).length
      
      days.push({
        date: format(d, "MM/dd"),
        completed,
        total: activeHabits.length,
      })
    }
    
    return days
  }

  const getStreakData = () => {
    return habits.filter(habit => habit.isActive).map(habit => {
      let currentStreak = 0
      let maxStreak = 0
      
      // Get all completed entries sorted by date
      const completedEntries = habit.entries
        .filter(entry => entry.value > 0)
        .map(entry => entry.date)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()) // Sort desc for current streak
      
      const today = format(new Date(), "yyyy-MM-dd")
      
      // Calculate current streak (going backwards from today)
      let currentDate = today
      let dayIndex = 0
      
      while (dayIndex < 365) { // Limit to prevent infinite loops
        const hasEntry = completedEntries.includes(currentDate)
        
        if (hasEntry) {
          currentStreak++
        } else {
          // If we haven't found any entries yet, check previous day
          // Otherwise, break the streak
          if (currentStreak > 0) {
            break
          }
        }
        
        // Move to previous day
        const date = new Date(currentDate)
        date.setDate(date.getDate() - 1)
        currentDate = format(date, "yyyy-MM-dd")
        dayIndex++
        
        // If we haven't found any entries in the first 30 days, stop
        if (currentStreak === 0 && dayIndex > 30) {
          break
        }
      }

      // Calculate max streak
      if (completedEntries.length === 0) {
        maxStreak = 0
      } else {
        // Sort entries chronologically for max streak calculation
        const chronologicalEntries = [...completedEntries].sort((a, b) => 
          new Date(a).getTime() - new Date(b).getTime()
        )
        
        let tempStreak = 1
        maxStreak = 1
        
        for (let i = 1; i < chronologicalEntries.length; i++) {
          const prevDate = new Date(chronologicalEntries[i - 1])
          const currDate = new Date(chronologicalEntries[i])
          const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))
          
          if (diffDays === 1) {
            // Consecutive day
            tempStreak++
            maxStreak = Math.max(maxStreak, tempStreak)
          } else {
            // Streak broken
            tempStreak = 1
          }
        }
      }

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

  if (habits.filter(h => h.isActive).length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No active habits to analyze yet.</p>
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
          <h3 className="text-lg font-medium text-gray-900">Active Habits</h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">{habits.filter(h => h.isActive).length}</p>
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
        <Chart
          options={{
            chart: {
              height: 300,
              type: 'line',
              toolbar: { show: false },
              zoom: { enabled: false }
            },
            dataLabels: { enabled: false },
            stroke: { 
              curve: 'smooth', 
              width: 3
            },
            colors: ['#6366f1'],
            xaxis: {
              categories: completionData.map(d => d.date),
              labels: {
                style: {
                  colors: '#6b7280'
                }
              }
            },
            yaxis: {
              min: 0,
              labels: {
                style: {
                  colors: '#6b7280'
                }
              }
            },
            grid: {
              strokeDashArray: 3,
              borderColor: '#e5e7eb'
            },
            tooltip: {
              y: {
                formatter: (val: number) => `${val} habits completed`
              }
            },
            noData: {
              text: 'No completion data available',
              align: 'center',
              verticalAlign: 'middle',
              style: {
                color: '#6b7280'
              }
            }
          }}
          series={[{
            name: 'Completed Habits',
            data: completionData.map(d => d.completed)
          }]}
          type="line"
          height={300}
        />
      </div>

      {/* Streak Analysis */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Streak Analysis</h3>
        <Chart
          options={{
            chart: {
              height: 300,
              type: 'bar',
              toolbar: { show: false }
            },
            plotOptions: {
              bar: {
                horizontal: false,
                columnWidth: '55%',
                borderRadius: 4
              }
            },
            dataLabels: { enabled: false },
            colors: ['#10b981', '#6366f1'],
            xaxis: {
              categories: streakData.map(d => d.name),
              labels: {
                style: {
                  colors: '#6b7280'
                }
              }
            },
            yaxis: {
              min: 0,
              labels: {
                style: {
                  colors: '#6b7280'
                }
              }
            },
            grid: {
              strokeDashArray: 3,
              borderColor: '#e5e7eb'
            },
            legend: {
              position: 'top',
              horizontalAlign: 'left'
            },
            tooltip: {
              y: {
                formatter: (val: number) => `${val} days`
              }
            },
            noData: {
              text: 'No streak data available',
              align: 'center',
              verticalAlign: 'middle',
              style: {
                color: '#6b7280'
              }
            }
          }}
          series={[
            {
              name: 'Current Streak',
              data: streakData.map(d => d.currentStreak)
            },
            {
              name: 'Max Streak',
              data: streakData.map(d => d.maxStreak)
            }
          ]}
          type="bar"
          height={300}
        />
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
            {habits.filter(h => h.isActive).map(habit => (
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