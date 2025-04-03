"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import {
  Calendar,
  Clock,
  BookOpen,
  Users,
  Award,
  CheckCircle,
  XCircle,
  BarChart3,
  BookMarked,
  GraduationCap,
  Bell,
  FileText,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"

export default function StudentDashboard() {
  const { data: session } = useSession()
  const { toast } = useToast()

  const [studentData, setStudentData] = useState<any>(null)
  const [recentGrades, setRecentGrades] = useState<any[]>([])
  const [recentAttendance, setRecentAttendance] = useState<any[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch student data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch student profile
        const profileResponse = await fetch("/api/students/profile")
        if (!profileResponse.ok) {
          throw new Error("Failed to fetch student profile")
        }
        const profileData = await profileResponse.json()
        setStudentData(profileData)

        // Fetch recent grades
        const gradesResponse = await fetch("/api/grades?limit=5")
        if (gradesResponse.ok) {
          const gradesData = await gradesResponse.json()
          // Handle different response formats
          if (Array.isArray(gradesData)) {
            setRecentGrades(gradesData)
          } else if (gradesData && Array.isArray(gradesData.grades)) {
            setRecentGrades(gradesData.grades)
          } else {
            setRecentGrades([])
          }
        } else {
          setRecentGrades([])
        }

        // Fetch recent attendance
        const attendanceResponse = await fetch("/api/attendance?limit=5")
        if (attendanceResponse.ok) {
          const attendanceData = await attendanceResponse.json()
          // Handle different response formats
          if (Array.isArray(attendanceData)) {
            setRecentAttendance(attendanceData)
          } else if (attendanceData && Array.isArray(attendanceData.attendance)) {
            setRecentAttendance(attendanceData.attendance)
          } else {
            setRecentAttendance([])
          }
        } else {
          setRecentAttendance([])
        }

        // Fetch assignments
        try {
          const assignmentsResponse = await fetch("/api/assignments?limit=3")
          if (assignmentsResponse.ok) {
            const assignmentsData = await assignmentsResponse.json()
            if (Array.isArray(assignmentsData)) {
              setAssignments(assignmentsData)
            } else if (assignmentsData && Array.isArray(assignmentsData.assignments)) {
              setAssignments(assignmentsData.assignments)
            } else {
              setAssignments([])
            }
          }
        } catch (error) {
          console.error("Error fetching assignments:", error)
          setAssignments([])
        }

        // Mock announcements data (replace with actual API call when available)
        setAnnouncements([
          {
            id: "1",
            title: "End of Term Exams",
            content: "Final examinations for the current term will begin on May 15th.",
            date: new Date("2025-05-15"),
            priority: "high",
          },
          {
            id: "2",
            title: "Science Fair",
            content: "Annual science project exhibition will be held on May 20th.",
            date: new Date("2025-05-20"),
            priority: "medium",
          },
          {
            id: "3",
            title: "End of Term",
            content: "Last day of the current term will be May 30th.",
            date: new Date("2025-05-30"),
            priority: "medium",
          },
        ])
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchData()
    }
  }, [session, toast])

  // Calculate attendance statistics
  const attendanceStats = useMemo(() => {
    if (!recentAttendance || recentAttendance.length === 0) {
      return { present: 0, absent: 0, late: 0, total: 0, rate: 0 }
    }

    const present = recentAttendance.filter((a) => a.status === "Present").length
    const absent = recentAttendance.filter((a) => a.status === "Absent").length
    const late = recentAttendance.filter((a) => a.status === "Late").length
    const total = recentAttendance.length
    const rate = Math.round((present / total) * 100)

    return { present, absent, late, total, rate }
  }, [recentAttendance])

  // Calculate grade statistics
  const gradeStats = useMemo(() => {
    if (!recentGrades || recentGrades.length === 0) {
      return { average: 0, highest: 0, lowest: 0 }
    }

    const scores = recentGrades.map((g) => g.score)
    const average = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    const highest = Math.max(...scores)
    const lowest = Math.min(...scores)

    return { average, highest, lowest }
  }, [recentGrades])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 bg-muted rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="h-12 bg-muted rounded"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {session?.user?.name}</h1>
          <p className="text-muted-foreground">Here's an overview of your academic information</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="hidden md:flex">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </Button>
          <Button size="sm">
            <FileText className="mr-2 h-4 w-4" />
            View Report Card
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      {studentData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center text-blue-700">
                <BookOpen className="mr-2 h-4 w-4" />
                Class Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-800">{studentData.class?.name || "N/A"}</div>
              <p className="text-sm text-blue-600">
                Grade {studentData.grade}, Section {studentData.section}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center text-purple-700">
                <Users className="mr-2 h-4 w-4" />
                Class Teacher
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-800">
                {studentData.class?.teacher?.user?.name || "N/A"}
              </div>
              <p className="text-sm text-purple-600">{studentData.class?.teacher?.department || "Department"}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center text-green-700">
                <Award className="mr-2 h-4 w-4" />
                Academic Standing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">Good Standing</div>
              <p className="text-sm text-green-600">Admission #: {studentData.admissionNumber}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center text-amber-700">
                <BarChart3 className="mr-2 h-4 w-4" />
                Average Grade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-800">{gradeStats.average}%</div>
              <p className="text-sm text-amber-600">
                Range: {gradeStats.lowest}% - {gradeStats.highest}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Attendance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Attendance Overview
          </CardTitle>
          <CardDescription>Your attendance statistics for this term</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Attendance Rate</p>
                  <p className="text-2xl font-bold">{attendanceStats.rate}%</p>
                </div>
                <div className="relative h-16 w-16">
                  <svg className="h-full w-full" viewBox="0 0 100 100">
                    <circle
                      className="text-muted stroke-current"
                      strokeWidth="10"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                    />
                    <circle
                      className={`${
                        attendanceStats.rate >= 90
                          ? "text-green-500"
                          : attendanceStats.rate >= 80
                            ? "text-blue-500"
                            : attendanceStats.rate >= 70
                              ? "text-yellow-500"
                              : "text-red-500"
                      } stroke-current`}
                      strokeWidth="10"
                      strokeDasharray={`${attendanceStats.rate * 2.51} 251`}
                      strokeLinecap="round"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                    <p className="text-sm">Present</p>
                  </div>
                  <p className="text-sm font-medium">{attendanceStats.present} days</p>
                </div>
                <Progress value={(attendanceStats.present / attendanceStats.total) * 100} className="h-2 bg-muted" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
                    <p className="text-sm">Late</p>
                  </div>
                  <p className="text-sm font-medium">{attendanceStats.late} days</p>
                </div>
                <Progress value={(attendanceStats.late / attendanceStats.total) * 100} className="h-2 bg-muted" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                    <p className="text-sm">Absent</p>
                  </div>
                  <p className="text-sm font-medium">{attendanceStats.absent} days</p>
                </div>
                <Progress value={(attendanceStats.absent / attendanceStats.total) * 100} className="h-2 bg-muted" />
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Recent Attendance</p>
              <div className="space-y-3">
                {recentAttendance && recentAttendance.length > 0 ? (
                  recentAttendance.slice(0, 5).map((record) => (
                    <div key={record.id} className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center">
                        {record.status === "Present" ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        ) : record.status === "Late" ? (
                          <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mr-2" />
                        )}
                        <div>
                          <p className="font-medium">{format(new Date(record.date), "EEEE, MMM d")}</p>
                          <p className="text-xs text-muted-foreground">{record.status}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">No attendance records yet.</div>
                )}
              </div>
              <div className="mt-4">
                <Link href="/dashboard/student/attendance">
                  <Button variant="outline" className="w-full">
                    View Full Attendance
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <GraduationCap className="mr-2 h-5 w-5" />
            Academic Performance
          </CardTitle>
          <CardDescription>Your recent grades and academic progress</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="grades" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="grades">Recent Grades</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
            </TabsList>

            <TabsContent value="grades">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  {recentGrades && recentGrades.length > 0 ? (
                    <div className="space-y-4">
                      {recentGrades.slice(0, 5).map((grade) => (
                        <div key={grade.id} className="flex items-center justify-between border-b pb-3">
                          <div>
                            <p className="font-medium">{grade.subject}</p>
                            <p className="text-sm text-muted-foreground">
                              {grade.term} • {format(new Date(grade.createdAt), "MMM d, yyyy")}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <Badge
                              className={
                                grade.score >= 90
                                  ? "bg-green-100 text-green-800"
                                  : grade.score >= 80
                                    ? "bg-blue-100 text-blue-800"
                                    : grade.score >= 70
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                              }
                            >
                              {grade.score}% - {grade.grade}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">No grades recorded yet.</div>
                  )}
                </div>

                <div className="flex flex-col">
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Grade Distribution</p>
                    <div className="flex items-center justify-between bg-muted p-4 rounded-lg">
                      {["A", "B", "C", "D", "F"].map((grade) => {
                        const count = recentGrades ? recentGrades.filter((g) => g.grade === grade).length : 0
                        const percentage =
                          recentGrades && recentGrades.length > 0 ? Math.round((count / recentGrades.length) * 100) : 0

                        return (
                          <div key={grade} className="flex flex-col items-center">
                            <div
                              className={`w-4 rounded-full mb-1 ${
                                grade === "A"
                                  ? "bg-green-500"
                                  : grade === "B"
                                    ? "bg-blue-500"
                                    : grade === "C"
                                      ? "bg-yellow-500"
                                      : grade === "D"
                                        ? "bg-orange-500"
                                        : "bg-red-500"
                              }`}
                              style={{ height: `${Math.max(percentage, 5)}px` }}
                            ></div>
                            <p className="text-xs font-medium">{grade}</p>
                            <p className="text-xs text-muted-foreground">{count}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="mt-auto">
                    <Link href="/dashboard/student/academics">
                      <Button variant="outline" className="w-full">
                        View All Grades
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="assignments">
              <div className="space-y-4">
                {assignments && assignments.length > 0 ? (
                  assignments.map((assignment) => (
                    <Card key={assignment.id} className="overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        <div className="p-4 md:p-6 flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-lg">{assignment.title}</h3>
                            <Badge variant={assignment.status === "Completed" ? "outline" : "secondary"}>
                              {assignment.status || "Pending"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{assignment.description}</p>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <BookMarked className="h-4 w-4 mr-1" />
                            <span>{assignment.subject}</span>
                            <span className="mx-2">•</span>
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>Due: {format(new Date(assignment.dueDate), "MMM d, yyyy")}</span>
                          </div>
                        </div>
                        <div className="bg-muted p-4 md:p-6 md:w-48 flex flex-row md:flex-col justify-between items-center md:items-start">
                          <div>
                            <p className="text-sm font-medium">Points</p>
                            <p className="text-xl font-bold">{assignment.points || "N/A"}</p>
                          </div>
                          <Link href={`/dashboard/student/assignments/${assignment.id}`}>
                            <Button size="sm" variant="secondary">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">No assignments due.</div>
                )}

                <div className="pt-2">
                  <Link href="/dashboard/student/assignments">
                    <Button variant="outline" className="w-full">
                      View All Assignments
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Announcements & Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            Announcements & Events
          </CardTitle>
          <CardDescription>Important school announcements and upcoming events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="flex items-start gap-4 border-b pb-4">
                <div
                  className={`
                  flex flex-col items-center justify-center w-14 h-14 rounded-md
                  ${announcement.priority === "high" ? "bg-red-100 text-red-800" : "bg-primary/10 text-primary"}
                `}
                >
                  <span className="text-xl font-bold">{format(announcement.date, "dd")}</span>
                  <span className="text-xs">{format(announcement.date, "MMM")}</span>
                </div>
                <div>
                  <div className="flex items-center">
                    <p className="font-medium">{announcement.title}</p>
                    {announcement.priority === "high" && (
                      <Badge variant="destructive" className="ml-2">
                        Important
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{announcement.content}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            View All Announcements
          </Button>
        </CardFooter>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/dashboard/student/schedule">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <Calendar className="h-8 w-8 mb-2 text-primary" />
              <p className="font-medium">Class Schedule</p>
              <p className="text-xs text-muted-foreground">View your weekly timetable</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/student/messages">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <Bell className="h-8 w-8 mb-2 text-primary" />
              <p className="font-medium">Messages</p>
              <p className="text-xs text-muted-foreground">Communicate with teachers</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/student/assignments">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <FileText className="h-8 w-8 mb-2 text-primary" />
              <p className="font-medium">Assignments</p>
              <p className="text-xs text-muted-foreground">View and submit assignments</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/student/profile">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <Users className="h-8 w-8 mb-2 text-primary" />
              <p className="font-medium">Profile</p>
              <p className="text-xs text-muted-foreground">Manage your account</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}

