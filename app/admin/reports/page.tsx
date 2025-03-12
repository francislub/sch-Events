"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { CalendarDays, Users, Calendar } from "lucide-react"

export default function AdminReportsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [period, setPeriod] = useState("all")

  useEffect(() => {
    // Redirect if not admin
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/admin/reports")
      return
    }

    if (status === "authenticated") {
      if (session.user.role !== "ADMIN" && session.user.role !== "TEACHER") {
        router.push("/dashboard")
        return
      }

      fetchStats()
    }
  }, [status, session, router, period])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/stats?period=${period}`)

      if (!response.ok) {
        throw new Error("Failed to fetch statistics")
      }

      const data = await response.json()
      setStats(data)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching statistics:", err)
      setError("Failed to load statistics. Please try again later.")
      setLoading(false)
    }
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

  if (loading && !stats) {
    return (
      <div className="container py-8 text-center">
        <p>Loading statistics...</p>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Statistics</h1>
          <p className="text-muted-foreground">Analyze event data and user activity</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="year">Past Year</SelectItem>
            <SelectItem value="month">Past Month</SelectItem>
            <SelectItem value="week">Past Week</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {stats && (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Users</p>
                  <h2 className="text-3xl font-bold">{stats.totalUsers}</h2>
                </div>
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                  <Users className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Events</p>
                  <h2 className="text-3xl font-bold">{stats.totalEvents}</h2>
                </div>
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                  <CalendarDays className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Registrations</p>
                  <h2 className="text-3xl font-bold">{stats.totalRegistrations}</h2>
                </div>
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                  <Calendar className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Avg. Attendance</p>
                  <h2 className="text-3xl font-bold">
                    {stats.totalEvents > 0 ? Math.round((stats.totalRegistrations / stats.totalEvents) * 10) / 10 : 0}
                  </h2>
                </div>
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                  <Users className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="events" className="mb-8">
            <TabsList className="mb-6">
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="registrations">Registrations</TabsTrigger>
            </TabsList>

            <TabsContent value="events">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Events by Category</CardTitle>
                    <CardDescription>Distribution of events across categories</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    {stats.eventsByCategory && stats.eventsByCategory.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.eventsByCategory}
                            dataKey="count"
                            nameKey="category"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            label={({ category, count }) => `${category}: ${count}`}
                          >
                            {stats.eventsByCategory.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-muted-foreground">No data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Events</CardTitle>
                    <CardDescription>Number of events per month</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    {stats.monthlyEvents && stats.monthlyEvents.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.monthlyEvents}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-muted-foreground">No data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Top Events by Registration</CardTitle>
                    <CardDescription>Events with the highest number of registrations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stats.topEvents && stats.topEvents.length > 0 ? (
                      <div className="rounded-md border overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-muted">
                            <tr>
                              <th className="text-left p-3 font-medium">Event</th>
                              <th className="text-left p-3 font-medium">Date</th>
                              <th className="text-left p-3 font-medium">Category</th>
                              <th className="text-right p-3 font-medium">Registrations</th>
                            </tr>
                          </thead>
                          <tbody>
                            {stats.topEvents.map((event) => (
                              <tr key={event.id} className="border-t">
                                <td className="p-3 font-medium">{event.title}</td>
                                <td className="p-3">{new Date(event.date).toLocaleDateString()}</td>
                                <td className="p-3">{event.category}</td>
                                <td className="p-3 text-right">{event.registrations}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground">No events found</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Users by Role</CardTitle>
                    <CardDescription>Distribution of users across roles</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    {stats.usersByRole && stats.usersByRole.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.usersByRole}
                            dataKey="count"
                            nameKey="role"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            label={({ role, count }) => `${role}: ${count}`}
                          >
                            {stats.usersByRole.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-muted-foreground">No data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>User Activity</CardTitle>
                    <CardDescription>User registration and participation trends</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-6">
                      <p className="text-muted-foreground">Coming soon</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="registrations">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Registration Status</CardTitle>
                    <CardDescription>Distribution of registration statuses</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    {stats.registrationsByStatus && stats.registrationsByStatus.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.registrationsByStatus}
                            dataKey="count"
                            nameKey="status"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            label={({ status, count }) => `${status}: ${count}`}
                          >
                            {stats.registrationsByStatus.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-muted-foreground">No data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Registration Trends</CardTitle>
                    <CardDescription>Registration activity over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-6">
                      <p className="text-muted-foreground">Coming soon</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}

