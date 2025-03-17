"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Clock, BookOpen } from 'lucide-react'

// Helper function to get current day index (0 = Monday, 6 = Sunday)
const getCurrentDayIndex = () => {
  const day = new Date().getDay()
  return day === 0 ? 6 : day - 1 // Adjust Sunday to be 6 instead of 0
}

// Days array
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export default function TeacherSchedule() {
  const { toast } = useToast()
  const [schedule, setSchedule] = useState<any[]>([])
  const [filteredSchedule, setFilteredSchedule] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<string>(DAYS[getCurrentDayIndex()])
  
  // Fetch schedule data
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        // In a real app, this would be a fetch call to your API
        // const response = await fetch('/api/teacher/schedule')
        // const data = await response.json()
        // setSchedule(data)

        // Mock data for demonstration
        setTimeout(() => {
          const mockSchedule = [
            {
              id: "1",
              day: "Monday",
              startTime: "08:00",
              endTime: "09:30",
              subject: "Mathematics",
              room: "105",
              class: { id: "1", name: "10A", grade: "10", section: "A" }
            },
            {
              id: "2",
              day: "Monday",
              startTime: "10:00",
              endTime: "11:30",
              subject: "Mathematics",
              room: "203",
              class: { id: "3", name: "9A", grade: "9", section: "A" }
            },
            {
              id: "3",
              day: "Monday",
              startTime: "13:00",
              endTime: "14:30",
              subject: "Mathematics",
              room: "105",
              class: { id: "2", name: "10B", grade: "10", section: "B" }
            },
            {
              id: "4",
              day: "Tuesday",
              startTime: "08:00",
              endTime: "09:30",
              subject: "Mathematics",
              room: "203",
              class: { id: "3", name: "9A", grade: "9", section: "A" }
            },
            {
              id: "5",
              day: "Tuesday",
              startTime: "10:00",
              endTime: "11:30",
              subject: "Mathematics",
              room: "204",
              class: { id: "4", name: "9B", grade: "9", section: "B" }
            },
            {
              id: "6",
              day: "Tuesday",
              startTime: "13:00",
              endTime: "14:30",
              subject: "Advanced Mathematics",
              room: "105",
              class: { id: "5", name: "10Adv", grade: "10", section: "Adv" }
            },
            {
              id: "7",
              day: "Wednesday",
              startTime: "08:00",
              endTime: "09:30",
              subject: "Mathematics",
              room: "105",
              class: { id: "1", name: "10A", grade: "10", section: "A" }
            },
            {
              id: "8",
              day: "Wednesday",
              startTime: "10:00",
              endTime: "11:30",
              subject: "Mathematics",
              room: "203",
              class: { id: "4", name: "9B", grade: "9", section: "B" }
            },
            {
              id: "9",
              day: "Wednesday",
              startTime: "13:00",
              endTime: "14:30",
              subject: "Mathematics",
              room: "105",
              class: { id: "2", name: "10B", grade: "10", section: "B" }
            },
            {
              id: "10",
              day: "Thursday",
              startTime: "08:00",
              endTime: "09:30",
              subject: "Mathematics",
              room: "203",
              class: { id: "3", name: "9A", grade: "9", section: "A" }
            },
            {
              id: "11",
              day: "Thursday",
              startTime: "10:00",
              endTime: "11:30",
              subject: "Faculty Meeting",
              room: "Conference Room",
              class: null
            },
            {
              id: "12",
              day: "Thursday",
              startTime: "13:00",
              endTime: "14:30",
              subject: "Advanced Mathematics",
              room: "105",
              class: { id: "5", name: "10Adv", grade: "10", section: "Adv" }
            },
            {
              id: "13",
              day: "Friday",
              startTime: "08:00",
              endTime: "09:30",
              subject: "Mathematics",
              room: "105",
              class: { id: "1", name: "10A", grade: "10", section: "A" }
            },
            {
              id: "14",
              day: "Friday",
              startTime: "10:00",
              endTime: "11:30",
              subject: "Mathematics",
              room: "203",
              class: { id: "4", name: "9B", grade: "9", section: "B" }
            },
            {
              id: "15",
              day: "Friday",
              startTime: "13:00",
              endTime: "14:30",
              subject: "Mathematics",
              room: "105",
              class: { id: "2", name: "10B", grade: "10", section: "B" }
            }
          ]
          setSchedule(mockSchedule)
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching schedule:", error)
        toast({
          title: "Error",
          description: "Failed to load schedule data. Please try again.",
          variant: "destructive"
        })
        setIsLoading(false)
      }
    }

    fetchSchedule()
  }, [toast])

  // Filter schedule based on selected day
  useEffect(() => {
    if (selectedDay === "All") {
      setFilteredSchedule(schedule)
    } else {
      setFilteredSchedule(schedule.filter(session => session.day === selectedDay))
    }
  }, [selectedDay, schedule])

  // Get today's schedule
  const todaySchedule = schedule.filter(session => 
    session.day === DAYS[getCurrentDayIndex()]
  ).sort((a, b) => a.startTime.localeCompare(b.startTime))

  // Get schedule for the week, organized by time slots
  const weekSchedule = () => {
    const timeSlots = [...new Set(schedule.map(s => `${s.startTime}-${s.endTime}`))].sort()
    
    return timeSlots.map(slot => {
      const [startTime, endTime] = slot.split('-')
      const daySchedules = DAYS.map(day => {
        return schedule.find(s => s.day === day && s.startTime === startTime && s.endTime === endTime) || null
      })
      
      return { timeSlot: `${startTime}-${endTime}`, daySchedules }
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Schedule</h1>
        <p className="text-muted-foreground">
          View your teaching schedule
        </p>
      </div>

      <Tabs defaultValue="daily">
        <TabsList>
          <TabsTrigger value="daily">Daily View</TabsTrigger>
          <TabsTrigger value="weekly">Weekly View</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Daily Schedule</CardTitle>
                  <CardDescription>View your schedule for a specific day</CardDescription>
                </div>
                <Select
                  value={selectedDay}
                  onValueChange={setSelectedDay}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map(day => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border rounded-lg p-4 animate-pulse">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="space-y-2">
                          <div className="h-5 w-40 bg-muted rounded"></div>
                          <div className="h-4 w-64 bg-muted rounded"></div>
                          <div className="h-4 w-32 bg-muted rounded"></div>
                        </div>
                        <div className="h-8 w-24 bg-muted rounded mt-2 md:mt-0"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredSchedule.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No classes scheduled for {selectedDay}.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSchedule
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((session) => (
                      <div 
                        key={session.id} 
                        className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div>
                            <h3 className="font-medium text-lg">
                              {session.subject}
                              {session.class && (
                                <span className="ml-2 text-muted-foreground">
                                  - Class {session.class.name}
                                </span>
                              )}
                            </h3>
                            <div className="flex flex-col md:flex-row gap-2 md:gap-4 mt-2">
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Clock className="mr-1 h-4 w-4" />
                                {session.startTime} - {session.endTime}
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <MapPin className="mr-1 h-4 w-4" />
                                Room {session.room}
                              </div>
                            </div>
                          </div>
                          {session.class && (
                            <Button variant="outline" size="sm">
                              View Class
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>
                Your classes for {DAYS[getCurrentDayIndex()]}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-4 rounded-md border p-3 animate-pulse">
                      <div className="flex-1 space-y-1">
                        <div className="h-5 w-40 bg-muted rounded"></div>
                        <div className="h-4 w-64 bg-muted rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : todaySchedule.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No classes scheduled for today.
                </div>
              ) : (
                <div className="space-y-4">
                  {todaySchedule.map((session) => (
                    <div key={session.id} className="flex items-center space-x-4 rounded-md border p-3">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{session.startTime} - {session.endTime}</p>
                          {session.class && (
                            <Badge variant="outline">Class {session.class.name}</Badge>
                          )}
                        </div>
                        <p className="text-sm">{session.subject}</p>
                        <p className="text-xs text-muted-foreground">Room {session.room}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Schedule</CardTitle>
              <CardDescription>View your complete weekly schedule</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-96 animate-pulse bg-muted rounded-md"></div>
              ) : schedule.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No classes scheduled for this week.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border p-2 bg-muted text-left">Time Slot</th>
                        {DAYS.map(day => (
                          <th key={day} className="border p-2 bg-muted text-left">
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {weekSchedule().map((slot, index) => (
                        <tr key={index}>
                          <td className="border p-2 font-medium">
                            {slot.timeSlot.split('-')[0]} - {slot.timeSlot.split('-')[1]}
                          </td>
                          {slot.daySchedules.map((session, dayIndex) => (
                            <td key={dayIndex} className={`border p-2 ${
                              session && DAYS[getCurrentDayIndex()] === DAYS[dayIndex] 
                                ? 'bg-blue-50' 
                                : ''
                            }`}>
                              {session ? (
                                <div className="min-h-[60px]">
                                  <div className="font-medium">{session.subject}</div>
                                  {session.class && (
                                    <div className="text-sm text-muted-foreground">
                                      Class {session.class.name}
                                    </div>
                                  )}
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Room {session.room}
                                  </div>
                                </div>
                              ) : (
                                <div className="min-h-[60px] flex items-center justify-center text-muted-foreground text-sm">
                                  -
                                </div>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
