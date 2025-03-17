"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, CalendarIcon, Users } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

export default function ParentEvents() {
  const { toast } = useToast()
  const [events, setEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  // Fetch events data
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // In a real implementation, this would be a fetch call to your API
        // const response = await fetch('/api/events?role=PARENT')
        // const data = await response.json()
        // setEvents(data)

        // Mock data for demonstration
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
              forRole: "ALL"
            },
            {
              id: "3",
              title: "Science Fair",
              description: "Annual science fair showcasing student projects.",
              date: "2025-04-05",
              startTime: "10:00",
              endTime: "15:00",
              location: "School Gymnasium",
              forRole: "ALL"
            },
            {
              id: "5",
              title: "Sports Day",
              description: "Annual sports competition between classes.",
              date: "2025-04-12",
              startTime: "08:00",
              endTime: "16:00",
              location: "School Grounds",
              forRole: "ALL"
            },
            {
              id: "6",
              title: "Career Guidance Session",
              description: "Career counseling for high school students and their parents.",
              date: "2025-03-25",
              startTime: "16:00",
              endTime: "18:00",
              location: "School Library",
              forRole: "PARENT"
            },
            {
              id: "7",
              title: "End of Term Exams",
              description: "Final examinations for the current term.",
              date: "2025-03-28",
              startTime: "08:00",
              endTime: "16:00",
              location: "All Classrooms",
              forRole: "ALL"
            }
          ]
          setEvents(mockEvents)
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching events:", error)
        toast({
          title: "Error",
          description: "Failed to load events data. Please try again.",
          variant: "destructive"
        })
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [toast])

  // Filter events for the selected date
  const filteredEvents = selectedDate 
    ? events.filter(event => {
        const eventDate = new Date(event.date)
        return eventDate.toDateString() === selectedDate.toDateString()
      })
    : []

  // Get dates with events for highlighting in the calendar
  const datesWithEvents = events.map(event => new Date(event.date))

  // Format time function
  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':').map(Number)
    return new Date(0, 0, 0, hour, minute).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">School Events</h1>
        <p className="text-muted-foreground">
          View upcoming school events and activities
        </p>
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
                event: datesWithEvents
              }}
              modifiersStyles={{
                event: { 
                  fontWeight: 'bold',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: '0',
                  color: '#3b82f6'
                }
              }}
            />
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedDate ? (
                <>Events for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</>
              ) : (
                <>All Events</>
              )}
            </CardTitle>
            <CardDescription>
              {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border rounded-lg p-4 animate-pulse">
                    <div className="h-5 w-3/4 bg-muted rounded mb-2"></div>
                    <div className="h-4 w-1/2 bg-muted rounded mb-4"></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-4 w-full bg-muted rounded"></div>
                      <div className="h-4 w-full bg-muted rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No events scheduled for this date.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <div key={event.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <h3 className="font-medium text-lg">{event.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                        <div className="flex flex-col md:flex-row gap-2 md:gap-4 mt-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="mr-1 h-4 w-4" />
                            {formatTime(event.startTime)} - {formatTime(event.endTime)}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="mr-1 h-4 w-4" />
                            {event.location}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 md:mt-0">
                        <Button variant="outline" size="sm">Add to Calendar</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
          <CardDescription>The next few scheduled school events</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex items-start gap-4">
                  <div className="rounded-md bg-muted h-12 w-12 flex-shrink-0"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No upcoming events found.
            </div>
          ) : (
            <div className="space-y-4">
              {events
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 3)
                .map((event) => (
                  <div key={event.id} className="flex items-start gap-4">
                    <div className="rounded-md bg-blue-50 h-12 w-12 flex-shrink-0 flex flex-col items-center justify-center text-blue-800">
                      <span className="text-xs font-medium">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                      <span className="text-lg font-bold leading-none">{new Date(event.date).getDate()}</span>
                    </div>
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long' })}, {formatTime(event.startTime)} - {formatTime(event.endTime)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
