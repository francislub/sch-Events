"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Bell, Plus } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function TeacherDashboard() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<any>({
    totalClasses: 0,
    totalStudents: 0,
    pendingGrades: 0,
    upcomingClasses: 0,
    todaySchedule: [],
    recentActivities: [],
    classes: [],
    announcements: [],
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      try {
        // Fetch teacher dashboard data
        const response = await fetch("/api/dashboard/teacher")
        if (!response.ok) throw new Error("Failed to fetch dashboard data")

        const data = await response.json()
        setDashboardData(data)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [toast])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h1>
          <p className="text-muted-foreground">Welcome back. Here's an overview of your classes.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/teacher/grades/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Grades
            </Button>
          </Link>
        </div>
      </div>

      {dashboardData.announcements.length > 0 && (
        <Alert>
          <Bell className="h-4 w-4" />
          <AlertTitle>Important Notice</AlertTitle>
          <AlertDescription>{dashboardData.announcements[0].content}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="classes">My Classes</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.totalClasses}</div>
                <p className="text-xs text-muted-foreground">Across all grade levels</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.totalStudents}</div>
                <p className="text-xs text-muted-foreground">Across all your classes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Grades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.pendingGrades}</div>
                <p className="text-xs text-muted-foreground">Assignments to be graded</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Classes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.upcomingClasses}</div>
                <p className="text-xs text-muted-foreground">Classes today</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Today's Schedule</CardTitle>
                <CardDescription>Your classes for today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    <p className="text-center py-4 text-muted-foreground">Loading schedule...</p>
                  ) : dashboardData.todaySchedule.length === 0 ? (
                    <p className="text-center py-4 text-muted-foreground">No classes scheduled for today.</p>
                  ) : (
                    dashboardData.todaySchedule.map((schedule: any, index: number) => (
                      <div key={index} className="flex items-center space-x-4 rounded-md border p-3">
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">{schedule.time}</p>
                          <p className="text-sm text-muted-foreground">{schedule.class}</p>
                          <p className="text-xs text-muted-foreground">{schedule.room}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Your recent actions and notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    <p className="text-center py-4 text-muted-foreground">Loading activities...</p>
                  ) : dashboardData.recentActivities.length === 0 ? (
                    <p className="text-center py-4 text-muted-foreground">No recent activities.</p>
                  ) : (
                    dashboardData.recentActivities.map((activity: any, index: number) => (
                      <div key={index} className="border-b pb-3 last:border-0 last:pb-0">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{activity.action}</h3>
                          <span className="text-xs text-muted-foreground">{activity.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{activity.details}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="classes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Classes</CardTitle>
              <CardDescription>All classes you are currently teaching</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <p className="text-center py-4 text-muted-foreground">Loading classes...</p>
                ) : dashboardData.classes.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">No classes assigned yet.</p>
                ) : (
                  dashboardData.classes.map((classInfo: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="font-medium text-lg">{classInfo.name}</h3>
                          <p className="text-sm text-muted-foreground">{classInfo.schedule}</p>
                          <p className="text-sm text-muted-foreground">{classInfo.room}</p>
                        </div>
                        <div className="mt-2 md:mt-0 flex items-center gap-2">
                          <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                            {classInfo.students} Students
                          </div>
                          <Link href={`/dashboard/teacher/classes/${classInfo.id}`}>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Management</CardTitle>
              <CardDescription>Mark and view attendance for your classes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <Link href="/dashboard/teacher/attendance/mark" className="w-full md:w-auto">
                    <Button className="w-full">Mark Attendance</Button>
                  </Link>
                </div>

                {isLoading ? (
                  <p className="text-center py-4 text-muted-foreground">Loading attendance records...</p>
                ) : dashboardData.recentAttendance?.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">No recent attendance records.</p>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted">
                          <th className="p-2 text-left font-medium">Student Name</th>
                          <th className="p-2 text-left font-medium">Status</th>
                          <th className="p-2 text-left font-medium">Date</th>
                          <th className="p-2 text-left font-medium">Class</th>
                          <th className="p-2 text-left font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardData.recentAttendance?.map((record: any, index: number) => (
                          <tr key={index} className="border-t">
                            <td className="p-2">{record.studentName}</td>
                            <td className="p-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  record.status === "Present"
                                    ? "bg-green-100 text-green-800"
                                    : record.status === "Absent"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {record.status}
                              </span>
                            </td>
                            <td className="p-2">{record.date}</td>
                            <td className="p-2">{record.class}</td>
                            <td className="p-2">
                              <Link href={`/dashboard/teacher/attendance/edit/${record.id}`}>
                                <Button variant="outline" size="sm">
                                  Edit
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

