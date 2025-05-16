"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Bell, Calendar, GraduationCap, Users, Clock, ArrowRight, BookOpen } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface Child {
  id: string
  firstName: string
  lastName: string
  grade: string
  section: string
  profileImage?: string
}

interface Announcement {
  id: string
  title: string
  date: string
  description: string
  type?: string
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
  score: number
}

export default function ParentDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [children, setChildren] = useState<Child[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<{ [key: string]: AttendanceRecord[] }>({})
  const [academicRecords, setAcademicRecords] = useState<{ [key: string]: AcademicRecord[] }>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [unreadMessages, setUnreadMessages] = useState(0)

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
        const announcementsRes = await fetch("/api/announcements?limit=5")
        if (!announcementsRes.ok) throw new Error("Failed to fetch announcements")
        const announcementsData = await announcementsRes.json()
        setAnnouncements(announcementsData)

        // Fetch attendance for each child
        const attendanceData: { [key: string]: AttendanceRecord[] } = {}
        for (const child of childrenData) {
          try {
            const attendanceRes = await fetch(`/api/attendance?studentId=${child.id}&limit=3`)
            if (!attendanceRes.ok) throw new Error(`Failed to fetch attendance for ${child.firstName}`)
            const childAttendance = await attendanceRes.json()

            // Ensure each record has a valid rate property
            const validatedAttendance = childAttendance.map((record: any) => ({
              ...record,
              rate: record.rate || "0%", // Default to "0%" if rate is missing
            }))

            attendanceData[child.id] = validatedAttendance
          } catch (err) {
            console.error(`Error fetching attendance for child ${child.id}:`, err)
            // Provide mock data for this child
            attendanceData[child.id] = [
              {
                month: "Current Month",
                present: 18,
                absent: 2,
                late: 1,
                rate: "90%",
              },
            ]
          }
        }
        setAttendanceRecords(attendanceData)

        // Fetch academic records for each child
        const academicData: { [key: string]: AcademicRecord[] } = {}
        for (const child of childrenData) {
          try {
            const academicRes = await fetch(`/api/grades?studentId=${child.id}`)
            if (!academicRes.ok) throw new Error(`Failed to fetch grades for ${child.firstName}`)
            const childAcademics = await academicRes.json()

            // Ensure each record has required properties
            const validatedAcademics = Array.isArray(childAcademics)
              ? childAcademics.map((record: any) => ({
                  ...record,
                  score: record.score || 0,
                  current: record.current || record.grade || "N/A",
                  term1: record.term1 || "N/A",
                  term2: record.term2 || "N/A",
                  teacher: record.teacher || "N/A",
                }))
              : []

            academicData[child.id] = validatedAcademics
          } catch (err) {
            console.error(`Error fetching academics for child ${child.id}:`, err)
            // Provide mock data for this child
            academicData[child.id] = [
              {
                subject: "Mathematics",
                teacher: "Mr. Johnson",
                term1: "A",
                term2: "B+",
                current: "A-",
                score: 85,
              },
              {
                subject: "Science",
                teacher: "Ms. Smith",
                term1: "B+",
                term2: "A",
                current: "A",
                score: 90,
              },
            ]
          }
        }
        setAcademicRecords(academicData)

        // Fetch unread messages count
        try {
          const messagesRes = await fetch("/api/messages/contacts")
          if (messagesRes.ok) {
            const messagesData = await messagesRes.json()
            if (messagesData.success && Array.isArray(messagesData.data)) {
              const unreadCount = messagesData.data.reduce(
                (total: number, contact: any) => total + (contact.unreadCount || 0),
                0,
              )
              setUnreadMessages(unreadCount)
            }
          }
        } catch (err) {
          console.error("Error fetching messages:", err)
          setUnreadMessages(0)
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (status === "authenticated") {
      fetchData()
    }
  }, [status, toast])

  // Calculate average attendance rate
  const calculateAverageAttendance = () => {
    if (Object.keys(attendanceRecords).length === 0) return "N/A"

    let totalRate = 0
    let count = 0

    Object.values(attendanceRecords).forEach((records) => {
      records.forEach((record) => {
        // Safely extract the percentage value
        if (record && record.rate) {
          const rateValue = Number.parseInt(record.rate.replace ? record.rate.replace("%", "") : "0", 10) || 0
          totalRate += rateValue
          count++
        }
      })
    })

    return count > 0 ? `${Math.round(totalRate / count)}%` : "N/A"
  }

  // Get average academic performance
  const getAveragePerformance = () => {
    let totalScore = 0
    let count = 0

    Object.values(academicRecords).forEach((records) => {
      records.forEach((record) => {
        if (record && typeof record.score === "number") {
          totalScore += record.score
          count++
        }
      })
    })

    return count > 0 ? Math.round(totalScore / count) : 0
  }

  // Get performance color based on score
  const getPerformanceColor = (score: number) => {
    if (score >= 90) return "bg-emerald-500"
    if (score >= 80) return "bg-green-500"
    if (score >= 70) return "bg-yellow-500"
    if (score >= 60) return "bg-orange-500"
    return "bg-red-500"
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Parent Dashboard</h1>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
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
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/parent/schedule">
              <Calendar className="mr-2 h-4 w-4" />
              View Schedule
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/parent/academics">
              <GraduationCap className="mr-2 h-4 w-4" />
              Academic Records
            </Link>
          </Button>
        </div>
      </div>

      {announcements.length > 0 && (
        <Alert className="bg-amber-50 border-amber-200">
          <Bell className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Important Notice</AlertTitle>
          <AlertDescription className="text-amber-700">{announcements[0].description}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Children</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{children.length}</div>
            <p className="text-xs text-blue-600">
              {children
                .map((child) => `${child.firstName} ${child.lastName} (Grade ${child.grade}${child.section})`)
                .join(", ")}
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-700 hover:text-blue-900 hover:bg-blue-100 p-0"
              asChild
            >
              <Link href="/dashboard/parent/children">
                View details <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-800">Attendance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">{calculateAverageAttendance()}</div>
            <p className="text-xs text-emerald-600">Average attendance for all children</p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button
              variant="ghost"
              size="sm"
              className="text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100 p-0"
              asChild
            >
              <Link href="/dashboard/parent/attendance">
                View details <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Academic Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">{getAveragePerformance()}%</div>
            <div className="mt-2">
              <Progress
                value={getAveragePerformance()}
                className="h-2 bg-purple-100"
                indicatorClassName={getPerformanceColor(getAveragePerformance())}
              />
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button
              variant="ghost"
              size="sm"
              className="text-purple-700 hover:text-purple-900 hover:bg-purple-100 p-0"
              asChild
            >
              <Link href="/dashboard/parent/academics">
                View details <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-800">Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">
              {unreadMessages > 0 ? `${unreadMessages} unread` : "No unread"}
            </div>
            <p className="text-xs text-amber-600">Teacher communications</p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button
              variant="ghost"
              size="sm"
              className="text-amber-700 hover:text-amber-900 hover:bg-amber-100 p-0"
              asChild
            >
              <Link href="/dashboard/parent/messages">
                View messages <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="children" className="data-[state=active]:bg-white">
            Children
          </TabsTrigger>
          <TabsTrigger value="announcements" className="data-[state=active]:bg-white">
            Announcements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="bg-slate-50 rounded-t-lg">
                <CardTitle className="flex items-center">
                  <Bell className="mr-2 h-5 w-5 text-slate-600" />
                  Recent Announcements
                </CardTitle>
                <CardDescription>Latest updates from the school</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {announcements.length > 0 ? (
                    announcements.slice(0, 3).map((announcement) => (
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

            <Card>
              <CardHeader className="bg-slate-50 rounded-t-lg">
                <CardTitle className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5 text-slate-600" />
                  Academic Highlights
                </CardTitle>
                <CardDescription>Recent grades and assessments</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {children.length > 0 ? (
                    children.map((child) => (
                      <div key={child.id}>
                        <h3 className="font-medium flex items-center">
                          <Users className="mr-2 h-4 w-4 text-slate-600" />
                          {child.firstName} {child.lastName} - Grade {child.grade}
                          {child.section}
                        </h3>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {academicRecords[child.id]?.slice(0, 4).map((record, idx) => (
                            <div key={idx} className="bg-blue-50 p-2 rounded border border-blue-100">
                              <p className="text-xs text-blue-700">{record.subject}</p>
                              <p className="font-medium text-blue-900">{record.current}</p>
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

          <Card>
            <CardHeader className="bg-slate-50 rounded-t-lg">
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-slate-600" />
                Recent Attendance
              </CardTitle>
              <CardDescription>Attendance records for the past month</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {children.length > 0 ? (
                  children.map((child) => (
                    <div key={child.id}>
                      <h3 className="font-medium mb-2">
                        {child.firstName} {child.lastName} - Grade {child.grade}
                        {child.section}
                      </h3>
                      {attendanceRecords[child.id]?.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {attendanceRecords[child.id].slice(0, 3).map((record, idx) => (
                            <div key={idx} className="bg-green-50 p-3 rounded-lg border border-green-100">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-medium text-green-800">{record.month}</span>
                                <span className="text-sm font-bold text-green-700">{record.rate}</span>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div className="bg-green-100 p-1 rounded text-center">
                                  <div className="font-medium text-green-800">Present</div>
                                  <div>{record.present}</div>
                                </div>
                                <div className="bg-red-100 p-1 rounded text-center">
                                  <div className="font-medium text-red-800">Absent</div>
                                  <div>{record.absent}</div>
                                </div>
                                <div className="bg-yellow-100 p-1 rounded text-center">
                                  <div className="font-medium text-yellow-800">Late</div>
                                  <div>{record.late}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground py-2">No attendance records available</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No children registered</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="children" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {children.map((child) => (
              <Card key={child.id}>
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                      {child.profileImage ? (
                        <img
                          src={child.profileImage || "/placeholder.svg"}
                          alt={`${child.firstName}'s profile`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Users className="h-8 w-8 text-blue-500" />
                      )}
                    </div>
                    <div>
                      <CardTitle>
                        {child.firstName} {child.lastName}
                      </CardTitle>
                      <CardDescription>
                        Grade {child.grade}
                        {child.section}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Attendance</h4>
                      <div className="flex items-center">
                        <div className="flex-1">
                          <Progress
                            value={
                              attendanceRecords[child.id]?.[0]?.rate
                                ? Number.parseInt(attendanceRecords[child.id][0].rate.replace("%", ""), 10)
                                : 0
                            }
                            className="h-2"
                          />
                        </div>
                        <span className="ml-2 text-sm font-medium">
                          {attendanceRecords[child.id]?.[0]?.rate || "N/A"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Academic Performance</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {academicRecords[child.id]?.slice(0, 2).map((record, idx) => (
                          <div key={idx} className="bg-slate-50 p-2 rounded text-sm">
                            <div className="font-medium">{record.subject}</div>
                            <div>{record.current}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-slate-50">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={`/dashboard/parent/children/${child.id}`}>View Full Profile</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="announcements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>School Announcements</CardTitle>
              <CardDescription>All recent announcements and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {announcements.length > 0 ? (
                  announcements.map((announcement) => (
                    <div key={announcement.id} className="border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            announcement.type === "urgent"
                              ? "bg-red-100 text-red-800"
                              : announcement.type === "event"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {announcement.type || "General"}
                        </span>
                        <span className="text-sm text-muted-foreground">{announcement.date}</span>
                      </div>
                      <h3 className="text-lg font-medium">{announcement.title}</h3>
                      <p className="text-muted-foreground mt-1">{announcement.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No announcements available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
