"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react"
import Link from "next/link"

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [view, setView] = useState<"month" | "day" | "week">("month")
  const [category, setCategory] = useState<string>("all")

  // Mock events data - would come from your database
  const events = [
    {
      id: "1",
      title: "Annual Sports Day",
      date: new Date(2025, 2, 15), // March 15, 2025
      time: "9:00 AM - 4:00 PM",
      location: "School Grounds",
      category: "Sports",
    },
    {
      id: "2",
      title: "Science Exhibition",
      date: new Date(2025, 3, 5), // April 5, 2025
      time: "10:00 AM - 2:00 PM",
      location: "Main Hall",
      category: "Academic",
    },
    {
      id: "3",
      title: "Cultural Festival",
      date: new Date(2025, 4, 10), // May 10, 2025
      time: "1:00 PM - 6:00 PM",
      location: "Auditorium",
      category: "Cultural",
    },
    {
      id: "4",
      title: "Career Day",
      date: new Date(2025, 5, 20), // June 20, 2025
      time: "9:00 AM - 3:00 PM",
      location: "School Hall",
      category: "Career",
    },
  ]

  // Filter events based on selected date and category
  const filteredEvents = events.filter((event) => {
    const isSameDay =
      date &&
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()

    const matchesCategory = category === "all" || event.category.toLowerCase() === category

    return isSameDay && matchesCategory
  })

  // Get dates with events for highlighting in the calendar
  const datesWithEvents = events.map((event) => event.date)

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Event Calendar</h1>
          <p className="text-muted-foreground">View and manage all scheduled school events.</p>
        </div>
        <div className="flex gap-2">
          <Select value={view} onValueChange={(value: "month" | "day" | "week") => setView(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="day">Day</SelectItem>
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="academic">Academic</SelectItem>
              <SelectItem value="sports">Sports</SelectItem>
              <SelectItem value="cultural">Cultural</SelectItem>
              <SelectItem value="career">Career</SelectItem>
              <SelectItem value="meeting">Meeting</SelectItem>
            </SelectContent>
          </Select>
          <Button asChild>
            <Link href="/events/create">Add Event</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>
              {date ? date.toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "Select a date"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
                modifiers={{
                  hasEvent: datesWithEvents,
                }}
                modifiersStyles={{
                  hasEvent: {
                    fontWeight: "bold",
                    backgroundColor: "hsl(var(--primary) / 0.1)",
                    color: "hsl(var(--primary))",
                  },
                }}
                components={{
                  IconLeft: () => <ChevronLeft className="h-4 w-4" />,
                  IconRight: () => <ChevronRight className="h-4 w-4" />,
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Events for selected date */}
        <Card>
          <CardHeader>
            <CardTitle>
              {date
                ? date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
                : "No date selected"}
            </CardTitle>
            <CardDescription>{filteredEvents.length} events scheduled</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredEvents.length > 0 ? (
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <div key={event.id} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">{event.title}</h3>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Button asChild variant="outline" size="sm" className="w-full">
                        <Link href={`/events/${event.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No events scheduled for this date.</p>
                <Button asChild>
                  <Link href="/events/create">Create Event</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

