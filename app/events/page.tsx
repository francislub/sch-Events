"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { CalendarDays, Clock, Search, Users } from "lucide-react"
import { useSession } from "next-auth/react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function EventsPage() {
  const { data: session } = useSession()
  const [events, setEvents] = useState([])
  const [pastEvents, setPastEvents] = useState([])
  const [myEvents, setMyEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [category, setCategory] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")

  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "TEACHER"

  useEffect(() => {
    fetchEvents()
  }, [category, dateFilter, searchQuery])

  const fetchEvents = async () => {
    try {
      setLoading(true)

      // Build query parameters
      const params = new URLSearchParams()
      if (category !== "all") params.append("category", category)
      if (searchQuery) params.append("search", searchQuery)

      // Add date filter
      let dateParam = ""
      const today = new Date()

      if (dateFilter === "today") {
        dateParam = today.toISOString().split("T")[0]
      } else if (dateFilter === "this-week") {
        const endOfWeek = new Date(today)
        endOfWeek.setDate(today.getDate() + (7 - today.getDay()))
        params.append("startDate", today.toISOString().split("T")[0])
        params.append("endDate", endOfWeek.toISOString().split("T")[0])
      } else if (dateFilter === "this-month") {
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        params.append("startDate", today.toISOString().split("T")[0])
        params.append("endDate", endOfMonth.toISOString().split("T")[0])
      }

      if (dateParam) params.append("date", dateParam)

      // Fetch events
      const response = await fetch(`/api/events?${params.toString()}`)

      if (!response.ok) {
        throw new Error("Failed to fetch events")
      }

      const data = await response.json()

      // Split events into upcoming and past
      const now = new Date()
      const upcoming = []
      const past = []

      data.forEach((event) => {
        const eventDate = new Date(event.date)
        if (eventDate >= now) {
          upcoming.push(event)
        } else {
          past.push(event)
        }
      })

      setEvents(upcoming)
      setPastEvents(past)

      // Fetch user's events if logged in
      if (session?.user?.id) {
        const myEventsResponse = await fetch(`/api/users/me/events`)

        if (myEventsResponse.ok) {
          const myEventsData = await myEventsResponse.json()
          setMyEvents(myEventsData)
        }
      }

      setLoading(false)
    } catch (err) {
      console.error("Error fetching events:", err)
      setError("Failed to load events. Please try again later.")
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleCategoryChange = (value) => {
    setCategory(value)
  }

  const handleDateFilterChange = (value) => {
    setDateFilter(value)
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">Browse and register for upcoming school events.</p>
        </div>
        {isAdmin && (
          <Button asChild>
            <Link href="/events/create">Create New Event</Link>
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search events..." className="pl-10" value={searchQuery} onChange={handleSearch} />
        </div>
        <div>
          <Select value={category} onValueChange={handleCategoryChange}>
            <SelectTrigger>
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
        </div>
        <div>
          <Select value={dateFilter} onValueChange={handleDateFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="next-month">Next Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Events Tabs */}
      <Tabs defaultValue="upcoming" className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
          <TabsTrigger value="past">Past Events</TabsTrigger>
          <TabsTrigger value="my-events">My Events</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {loading ? (
            <div className="text-center py-12">
              <p>Loading events...</p>
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No upcoming events found.</p>
              <Button asChild>
                <Link href="/events/create">Create New Event</Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {loading ? (
            <div className="text-center py-12">
              <p>Loading events...</p>
            </div>
          ) : pastEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map((event) => (
                <EventCard key={event.id} event={event} isPast />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No past events found.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-events">
          {!session ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">You need to log in to view your events.</p>
              <Button asChild>
                <Link href="/auth/login">Login</Link>
              </Button>
            </div>
          ) : loading ? (
            <div className="text-center py-12">
              <p>Loading your events...</p>
            </div>
          ) : myEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">You haven't created or registered for any events yet.</p>
              <Button asChild>
                <Link href="/events/create">Create New Event</Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function EventCard({ event, isPast = false }) {
  // Format the date
  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Format the time
  const formattedTime = `${event.startTime} - ${event.endTime}`

  return (
    <Card className="overflow-hidden">
      <div className="aspect-video relative">
        <img
          src={event.image || "/placeholder.svg?height=200&width=400"}
          alt={event.title}
          className="object-cover w-full h-full"
        />
        <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded-full">
          {event.category}
        </div>
      </div>
      <CardHeader>
        <CardTitle className="line-clamp-1">{event.title}</CardTitle>
        <CardDescription className="line-clamp-2">{event.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{formattedTime}</span>
        </div>
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-muted-foreground"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span>{event.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{event.registrations} Registrations</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full" variant={isPast ? "outline" : "default"}>
          <Link href={`/events/${event.id}`}>{isPast ? "View Details" : "Register Now"}</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

