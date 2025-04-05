"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Bell } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface Child {
  id: string
  firstName: string
  lastName: string
  grade: string
  section: string
}

interface Announcement {
  id: string
  title: string
  date: string
  description: string
}

interface AttendanceRecord {
  month: string
  present: number
  absent: number
  late: number
  rate: string
}

interface AcademicRecord {
  subject: string
  teacher: string
  term1: string
  term2: string
  current: string
}

export default function ParentDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [children, setChildren] = useState<Child[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<{ [key: string]: AttendanceRecord[] }>({})
  const [academicRecords, setAcademicRecords] = useState<{ [key: string]: AcademicRecord[] }>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)

        // Fetch children
        const childrenRes = await fetch("/api/students?parentId=current")
        if (!childrenRes.ok) throw new Error("Failed to fetch children")
        const childrenData = await childrenRes.json()
        setChildren(childrenData)

        // Fetch announcements
        const announcementsRes = await fetch("/api/announcements?limit=3")
        if (!announcementsRes.ok) throw new Error("Failed to fetch announcements")
        const announcementsData = await announcementsRes.json()
        setAnnouncements(announcementsData)

        // Fetch attendance for each child
        const attendanceData: { [key: string]: AttendanceRecord[] } = {}
        for (const child of childrenData) {
          const attendanceRes = await fetch(`/api/attendance?studentId=${child.id}&limit=3`)
          if (!attendanceRes.ok) throw new Error(`Failed to fetch attendance for ${child.firstName}`)
          const childAttendance = await attendanceRes.json()
          attendanceData[child.id] = childAttendance
        }
        setAttendanceRecords(attendanceData)

        // Fetch academic records for each child
        const academicData: { [key: string]: AcademicRecord[] } = {}
        for (const child of childrenData) {
          const academicRes = await fetch(`/api/grades?studentId=${child.id}`)
          if (!academicRes.ok) throw new Error(`Failed to fetch grades for ${child.firstName}`)
          const childAcademics = await academicRes.json()
          academicData[child.id] = childAcademics
        }
        setAcademicRecords(academicData)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    if (status === "authenticated") {
      fetchData()
    }
  }, [status])

  // Calculate average attendance rate
  const calculateAverageAttendance = () => {
    if (Object.keys(attendanceRecords).length === 0) return "N/A"

    let totalRate = 0
    let count = 0

    Object.values(attendanceRecords).forEach((records) => {
      records.forEach((record) => {
        totalRate += Number.parseInt(record.rate.replace("%", ""))
        count++
      })
    })

    return count > 0 ? `${Math.round(totalRate / count)}%` : "N/A"
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Parent Dashboard</h1>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Parent Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {session?.user?.name}.</p>
        </div>
        <Alert variant="destructive">
          <Bell className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}. Please try refreshing the page or contact support.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Parent Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session?.user?.name}. Here's an overview of your children's progress.
          </p>
        </div>
      </div>

      <Alert>
        <Bell className="h-4 w-4" />
        <AlertTitle>Important Notice</AlertTitle>
        <AlertDescription>
          {announcements.length > 0
            ? announcements[0].description
            : "No current announcements. Check back later for updates."}
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="academics">Academics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Children</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{children.length}</div>
                <p className="text-xs text-muted-foreground">
                  {children
                    .map((child) => `${child.firstName} ${child.lastName} (Grade ${child.grade}${child.section})`)
                    .join(", ")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{calculateAverageAttendance()}</div>
                <p className="text-xs text-muted-foreground">Average attendance for all children</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{announcements.length}</div>
                <p className="text-xs text-muted-foreground">Events in the next 30 days</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Recent Announcements</CardTitle>
                <CardDescription>Latest updates from the school</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {announcements.length > 0 ? (
                    announcements.map((announcement, index) => (
                      <div key={announcement.id} className="border-b pb-3 last:border-0 last:pb-0">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{announcement.title}</h3>
                          <span className="text-xs text-muted-foreground">{announcement.date}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{announcement.description}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No announcements available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Academic Performance</CardTitle>
                <CardDescription>Recent grades and assessments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {children.length > 0 ? (
                    children.map((child) => (
                      <div key={child.id}>
                        <h3 className="font-medium">
                          {child.firstName} {child.lastName} - Grade {child.grade}
                          {child.section}
                        </h3>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {academicRecords[child.id]?.slice(0, 4).map((record, idx) => (
                            <div key={idx} className="bg-blue-50 p-2 rounded">
                              <p className="text-xs text-muted-foreground">{record.subject}</p>
                              <p className="font-medium">{record.current}</p>
                            </div>
                          ))}
                          {(!academicRecords[child.id] || academicRecords[child.id].length === 0) && (
                            <div className="col-span-2 text-center text-muted-foreground py-2">
                              No academic records available
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No children registered</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>Detailed attendance for your children</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {children.length > 0 ? (
                  children.map((child) => (
                    <div key={child.id}>
                      <h3 className="font-medium mb-2">
                        {child.firstName} {child.lastName} - Grade {child.grade}
                        {child.section}
                      </h3>
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-muted">
                              <th className="p-2 text-left font-medium">Month</th>
                              <th className="p-2 text-left font-medium">Present</th>
                              <th className="p-2 text-left font-medium">Absent</th>
                              <th className="p-2 text-left font-medium">Late</th>
                              <th className="p-2 text-left font-medium">Rate</th>
                            </tr>
                          </thead>
                          <tbody>
                            {attendanceRecords[child.id]?.map((record, index) => (
                              <tr key={index} className="border-t">
                                <td className="p-2">{record.month}</td>
                                <td className="p-2">{record.present}</td>
                                <td className="p-2">{record.absent}</td>
                                <td className="p-2">{record.late}</td>
                                <td className="p-2 font-medium">{record.rate}</td>
                              </tr>
                            ))}
                            {(!attendanceRecords[child.id] || attendanceRecords[child.id].length === 0) && (
                              <tr>
                                <td colSpan={5} className="p-4 text-center text-muted-foreground">
                                  No attendance records available
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No children registered</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Academic Records</CardTitle>
              <CardDescription>Detailed academic performance for your children</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {children.length > 0 ? (
                  children.map((child) => (
                    <div key={child.id}>
                      <h3 className="font-medium mb-2">
                        {child.firstName} {child.lastName} - Grade {child.grade}
                        {child.section}
                      </h3>
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-muted">
                              <th className="p-2 text-left font-medium">Subject</th>
                              <th className="p-2 text-left font-medium">Teacher</th>
                              <th className="p-2 text-left font-medium">Term 1</th>
                              <th className="p-2 text-left font-medium">Term 2</th>
                              <th className="p-2 text-left font-medium">Current</th>
                            </tr>
                          </thead>
                          <tbody>
                            {academicRecords[child.id]?.map((record, index) => (
                              <tr key={index} className="border-t">
                                <td className="p-2">{record.subject}</td>
                                <td className="p-2">{record.teacher}</td>
                                <td className="p-2">{record.term1}</td>
                                <td className="p-2">{record.term2}</td>
                                <td className="p-2 font-medium">{record.current}</td>
                              </tr>
                            ))}
                            {(!academicRecords[child.id] || academicRecords[child.id].length === 0) && (
                              <tr>
                                <td colSpan={5} className="p-4 text-center text-muted-foreground">
                                  No academic records available
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No children registered</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

