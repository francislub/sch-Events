"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"

interface Child {
  id: string
  firstName: string
  lastName: string
  grade: string
  section: string
  classId: string
}

interface ScheduleItem {
  id: string
  day: string
  startTime: string
  endTime: string
  subject: string
  teacher: string
  room: string
}

export default function ParentSchedule() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState("")
  const [schedule, setSchedule] = useState<{ [key: string]: ScheduleItem[] }>({})
  const [isLoading, setIsLoading] = useState(true)

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    async function fetchChildren() {
      try {
        const res = await fetch("/api/students?parentId=current")
        if (!res.ok) throw new Error("Failed to fetch children")
        const data = await res.json()
        setChildren(data)

        // Check if child ID is in URL params
        const childParam = searchParams.get("child")
        if (childParam && data.some((child) => child.id === childParam)) {
          setSelectedChild(childParam)
        } else if (data.length > 0) {
          setSelectedChild(data[0].id)
        }
      } catch (error) {
        console.error("Error fetching children:", error)
        toast({
          title: "Error",
          description: "Failed to load your children's data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (status === "authenticated") {
      fetchChildren()
    }
  }, [status, searchParams, toast])

  useEffect(() => {
    async function fetchSchedule() {
      if (!selectedChild) {
        setSchedule({})
        return
      }

      try {
        setIsLoading(true)

        // Find the selected child to get their class ID
        const child = children.find((c) => c.id === selectedChild)
        if (!child || !child.classId) {
          setSchedule({})
          setIsLoading(false)
          return
        }

        const res = await fetch(`/api/schedule?classId=${child.classId}`)
        if (!res.ok) throw new Error("Failed to fetch schedule")
        const data = await res.json()

        // Organize schedule by day
        const scheduleByDay: { [key: string]: ScheduleItem[] } = {}
        days.forEach((day) => {
          scheduleByDay[day] = data
            .filter((item: ScheduleItem) => item.day === day)
            .sort((a: ScheduleItem, b: ScheduleItem) => {
              return a.startTime.localeCompare(b.startTime)
            })
        })

        setSchedule(scheduleByDay)
      } catch (error) {
        console.error("Error fetching schedule:", error)
        toast({
          title: "Error",
          description: "Failed to load schedule data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (selectedChild && children.length > 0) {
      fetchSchedule()
    }
  }, [selectedChild, children, toast])

  // Format time (e.g., "09:00:00" to "9:00 AM")
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const formattedHour = hour % 12 || 12
    return `${formattedHour}:${minutes} ${ampm}`
  }

  if (isLoading && !children.length) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Class Schedule</h1>
          <p className="text-muted-foreground">Loading schedule data...</p>
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-8">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Class Schedule</h1>
        <p className="text-muted-foreground">View your child's weekly class schedule</p>
      </div>

      <div className="mb-6">
        <Select value={selectedChild} onValueChange={setSelectedChild}>
          <SelectTrigger className="w-full md:w-[250px]">
            <SelectValue placeholder="Select child" />
          </SelectTrigger>
          <SelectContent>
            {children.map((child) => (
              <SelectItem key={child.id} value={child.id}>
                {child.firstName} {child.lastName} - Grade {child.grade}
                {child.section}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedChild ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground">Please select a child to view their schedule.</p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground">Loading schedule...</p>
          </CardContent>
        </Card>
      ) : Object.values(schedule).every((day) => day.length === 0) ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground">No schedule available for this class.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {days.map((day) => (
            <Card key={day} className="md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle>{day}</CardTitle>
              </CardHeader>
              <CardContent>
                {schedule[day]?.length > 0 ? (
                  <div className="space-y-3">
                    {schedule[day].map((item) => (
                      <div key={item.id} className="border rounded-md p-3">
                        <div className="font-medium">{item.subject}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatTime(item.startTime)} - {formatTime(item.endTime)}
                        </div>
                        <div className="text-sm mt-1">Teacher: {item.teacher}</div>
                        <div className="text-sm">Room: {item.room}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">No classes</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

