"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CalendarDays, Users, Clock, Calendar, Bell, Mail } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    totalUsers: 0,
    totalRegistrations: 0,
    userEvents: 0,
    userRegistrations: 0,
  })
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "TEACHER"

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/dashboard")
    }

    // Fetch dashboard stats
    if (status === "authenticated") {
      fetchDashboardStats()
      fetchNotifications()
    }
  }, [status, router])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats")

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard statistics")
      }

      const data = await response.json()

      setStats({
        totalEvents: data.totalEvents,
        upcomingEvents: data.upcomingEvents,
        totalUsers: data.totalUsers,
        totalRegistrations: data.totalRegistrations,
        userEvents: data.userEvents || 0,
        userRegistrations: data.userRegistrations || 0,
      })

      // Format upcoming events
      if (data.recentEvents) {
        const formattedEvents = data.recentEvents.map((event) => ({
          id: event.id,
          title: event.title,
          date: new Date(event.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          location: event.location,
          registrations: event.registrations,
        }))

        setUpcomingEvents(formattedEvents)
      }

      setLoading(false)
    } catch (err) {
      console.error("Error fetching dashboard stats:", err)
      setError("Failed to load dashboard data. Please try again later.")
      setLoading(false)
    }
  }

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications")

      if (!response.ok) {
        throw new Error("Failed to fetch notifications")
      }

      const data = await response.json()
      setNotifications(data)
    } catch (err) {
      console.error("Error fetching notifications:", err)
      // Don't set error state here to avoid blocking the dashboard
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="container py-8 text-center">
        <p>Loading dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Determine which stats to show based on user role
  const isTeacher = session?.user?.role === "TEACHER"

  const displayStats = [
    {
      title: "Total Events",
      value: stats.totalEvents.toString(),
      icon: <CalendarDays className="h-5 w-5" />,
    },
    {
      title: "Upcoming Events",
      value: stats.upcomingEvents.toString(),
      icon: <Clock className="h-5 w-5" />,
    },
  ]

  if (isAdmin) {
    displayStats.push(
      {
        title: "Registered Users",
        value: stats.totalUsers.toString(),
        icon: <Users className="h-5 w-5" />,
      },
      {
        title: "Event Registrations",
        value: stats.totalRegistrations.toString(),
        icon: <Calendar className="h-5 w-5" />,
      },
    )
  } else {
    displayStats.push(
      {
        title: "My Events",
        value: stats.userEvents.toString(),
        icon: <Users className="h-5 w-5" />,
      },
      {
        title: "My Registrations",
        value: stats.userRegistrations.toString(),
        icon: <Calendar className="h-5 w-5" />,
      },
    )
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your school events management dashboard, {session?.user?.name}.
          </p>
        </div>
        {isAdmin && (
          <Button asChild>
            <Link href="/events/create">Create New Event</Link>
          </Button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {displayStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                <h2 className="text-3xl font-bold">{stat.value}</h2>
              </div>
              <div className="p-2 bg-primary/10 rounded-full text-primary">{stat.icon}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isAdmin && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Admin Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Contact Messages</h3>
                <p className="text-sm text-muted-foreground mb-4">View and manage messages from the contact form</p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin/contact-messages">
                    <Mail className="mr-2 h-4 w-4" />
                    View Messages
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">User Management</h3>
                <p className="text-sm text-muted-foreground mb-4">Manage user accounts and permissions</p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin/users">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Event Management</h3>
                <p className="text-sm text-muted-foreground mb-4">Create and manage school events</p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/events/create">
                    <Calendar className="mr-2 h-4 w-4" />
                    Create Event
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Events */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Overview of your next events</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/events">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <h3 className="font-semibold">{event.title}</h3>
                      <div className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3.5 w-3.5"
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
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{event.registrations} Registrations</div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/events/${event.id}`}>Manage</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No upcoming events found.</p>
                <Button asChild>
                  <Link href="/events/create">Create Event</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Recent updates and alerts</CardDescription>
          </CardHeader>
          <CardContent>
            {notifications.length > 0 ? (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className="border-b pb-4 last:border-0 last:pb-0">
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No new notifications</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

