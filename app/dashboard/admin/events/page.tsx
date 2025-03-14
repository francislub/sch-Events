"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Plus, CalendarIcon, Clock, Users } from "lucide-react"

export default function AdminEvents() {
  const router = useRouter()
  const { toast } = useToast()

  const [events, setEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "08:00",
    endTime: "09:00",
    location: "",
    forRole: "ALL",
  })

  // Mock data for events
  useEffect(() => {
    // In a real app, you would fetch this data from your API
    setTimeout(() => {
      const mockEvents = [
        {
          id: "1",
          title: "Parent-Teacher Meeting",
          description: "Discuss student progress and address any concerns.",
          date: "2025-03-20",
          startTime: "14:00",
          endTime: "17:00",
          location: "School Auditorium",
          forRole: "ALL",
        },
        {
          id: "2",
          title: "Staff Development Day",
          description: "Professional development workshops for teachers.",
          date: "2025-03-15",
          startTime: "09:00",
          endTime: "16:00",
          location: "Conference Room",
          forRole: "TEACHER",
        },
        {
          id: "3",
          title: "Science Fair",
          description: "Annual science fair showcasing student projects.",
          date: "2025-04-05",
          startTime: "10:00",
          endTime: "15:00",
          location: "School Gymnasium",
          forRole: "ALL",
        },
        {
          id: "4",
          title: "Board Meeting",
          description: "Quarterly board meeting to discuss school policies and budget.",
          date: "2025-03-25",
          startTime: "18:00",
          endTime: "20:00",
          location: "Board Room",
          forRole: "ADMIN",
        },
        {
          id: "5",
          title: "Sports Day",
          description: "Annual sports competition between classes.",
          date: "2025-04-12",
          startTime: "08:00",
          endTime: "16:00",
          location: "School Grounds",
          forRole: "ALL",
        },
      ]

      setEvents(mockEvents)
      setIsLoading(false)
    }, 500)
  }, [])

  const handleNewEventChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewEvent((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setNewEvent((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddEvent = () => {
    // In a real app, you would call your API to add the event
    const newEventWithId = {
      ...newEvent,
      id: Date.now().toString(),
    }

    setEvents((prev) => [...prev, newEventWithId])

    toast({
      title: "Event Added",
      description: "The event has been added successfully.",
    })

    setIsDialogOpen(false)
    setNewEvent({
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      startTime: "08:00",
      endTime: "09:00",
      location: "",
      forRole: "ALL",
    })
  }

  // Filter events for the selected date
  const filteredEvents = selectedDate
    ? events.filter((event) => {
        const eventDate = new Date(event.date)
        return eventDate.toDateString() === selectedDate.toDateString()
      })
    : []

  // Get dates with events for highlighting in the calendar
  const datesWithEvents = events.map((event) => new Date(event.date))

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">School Events</h1>
          <p className="text-muted-foreground">Manage and schedule school events</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add New Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Add New Event</DialogTitle>
                <DialogDescription>Create a new event for the school calendar</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title</Label>
                  <Input id="title" name="title" value={newEvent.title} onChange={handleNewEventChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={newEvent.description}
                    onChange={handleNewEventChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={newEvent.date}
                      onChange={handleNewEventChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={newEvent.location}
                      onChange={handleNewEventChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      name="startTime"
                      type="time"
                      value={newEvent.startTime}
                      onChange={handleNewEventChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      name="endTime"
                      type="time"
                      value={newEvent.endTime}
                      onChange={handleNewEventChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="forRole">Visible To</Label>
                  <Select value={newEvent.forRole} onValueChange={(value) => handleSelectChange("forRole", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Everyone</SelectItem>
                      <SelectItem value="ADMIN">Administrators Only</SelectItem>
                      <SelectItem value="TEACHER">Teachers Only</SelectItem>
                      <SelectItem value="PARENT">Parents Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddEvent}>Add Event</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>Select a date to view events</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              // Highlight dates with events
              modifiers={{
                event: datesWithEvents,
              }}
              modifiersStyles={{
                event: {
                  fontWeight: "bold",
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  borderRadius: "0",
                  color: "#3b82f6",
                },
              }}
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedDate ? (
                <>
                  Events for{" "}
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </>
              ) : (
                <>All Events</>
              )}
            </CardTitle>
            <CardDescription>
              {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""} scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading events...</div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No events scheduled for this date.</div>
            ) : (
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <div key={event.id} className="border rounded-lg p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="font-medium text-lg">{event.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                        <div className="flex flex-col md:flex-row gap-2 md:gap-4 mt-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="mr-1 h-4 w-4" />
                            {event.startTime} - {event.endTime}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <CalendarIcon className="mr-1 h-4 w-4" />
                            {new Date(event.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Users className="mr-1 h-4 w-4" />
                            {event.forRole === "ALL"
                              ? "Everyone"
                              : event.forRole === "ADMIN"
                                ? "Administrators Only"
                                : event.forRole === "TEACHER"
                                  ? "Teachers Only"
                                  : "Parents Only"}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/admin/events/${event.id}`)}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/admin/events/${event.id}/edit`)}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

