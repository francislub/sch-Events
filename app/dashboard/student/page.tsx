"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { Calendar, Clock, BookOpen, Users, Award, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default function StudentDashboard() {
  const { data: session } = useSession()
  const { toast } = useToast()

  const [studentData, setStudentData] = useState<any>(null)
  const [recentGrades, setRecentGrades] = useState<any[]>([])
  const [recentAttendance, setRecentAttendance] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch student data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch student profile
        const profileResponse = await fetch("/api/students/profile")
        const profileData = await profileResponse.json()

        // Fetch recent grades
        const gradesResponse = await fetch("/api/grades?limit=5")
        const gradesData = await gradesResponse.json()

        // Fetch recent attendance
        const attendanceResponse = await fetch("/api/attendance?limit=5")
        const attendanceData = await attendanceResponse.json()

        setStudentData(profileData)
        setRecentGrades(gradesData)
        setRecentAttendance(attendanceData)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    if (session) {
      fetchData()
    }
  }, [session, toast])

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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {session?.user?.name}</h1>
        <p className="text-muted-foreground">Here's an overview of your academic information</p>
      </div>

      {studentData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <BookOpen className="mr-2 h-4 w-4" />
                Class Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studentData.class.name}</div>
              <p className="text-sm text-muted-foreground">
                Grade {studentData.grade}, Section {studentData.section}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Users className="mr-2 h-4 w-4" />
                Class Teacher
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studentData.class.teacher.user.name}</div>
              <p className="text-sm text-muted-foreground">{studentData.class.teacher.department}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Award className="mr-2 h-4 w-4" />
                Academic Standing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Good Standing</div>
              <p className="text-sm text-muted-foreground">Admission #: {studentData.admissionNumber}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="mr-2 h-5 w-5" />
              Recent Grades
            </CardTitle>
            <CardDescription>Your latest academic performance</CardDescription>
          </CardHeader>
          <CardContent>
            {recentGrades.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">No grades recorded yet.</div>
            ) : (
              <div className="space-y-4">
                {recentGrades.map((grade) => (
                  <div key={grade.id} className="flex items-center justify-between border-b pb-3">
                    <div>
                      <p className="font-medium">{grade.subject}</p>
                      <p className="text-sm text-muted-foreground">
                        {grade.term} • {new Date(grade.createdAt).toLocaleDateString()}
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

                <div className="pt-2">
                  <Link href="/dashboard/student/academics">
                    <Button variant="outline" className="w-full">
                      View All Grades
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Recent Attendance
            </CardTitle>
            <CardDescription>Your latest attendance records</CardDescription>
          </CardHeader>
          <CardContent>
            {recentAttendance.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">No attendance records yet.</div>
            ) : (
              <div className="space-y-4">
                {recentAttendance.map((record) => (
                  <div key={record.id} className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center">
                      {record.status === "Present" ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      ) : record.status === "Late" ? (
                        <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mr-2" />
                      )}
                      <div>
                        <p className="font-medium">{new Date(record.date).toLocaleDateString()}</p>
                        <p className="text-sm text-muted-foreground">{record.status}</p>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="pt-2">
                  <Link href="/dashboard/student/attendance">
                    <Button variant="outline" className="w-full">
                      View All Attendance
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Upcoming Events
          </CardTitle>
          <CardDescription>School events and important dates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4 border-b pb-4">
              <div className="bg-primary/10 text-primary flex flex-col items-center justify-center w-14 h-14 rounded-md">
                <span className="text-xl font-bold">15</span>
                <span className="text-xs">May</span>
              </div>
              <div>
                <p className="font-medium">End of Term Exams</p>
                <p className="text-sm text-muted-foreground">Final examinations for the current term</p>
              </div>
            </div>

            <div className="flex items-start gap-4 border-b pb-4">
              <div className="bg-primary/10 text-primary flex flex-col items-center justify-center w-14 h-14 rounded-md">
                <span className="text-xl font-bold">20</span>
                <span className="text-xs">May</span>
              </div>
              <div>
                <p className="font-medium">Science Fair</p>
                <p className="text-sm text-muted-foreground">Annual science project exhibition</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-primary/10 text-primary flex flex-col items-center justify-center w-14 h-14 rounded-md">
                <span className="text-xl font-bold">30</span>
                <span className="text-xs">May</span>
              </div>
              <div>
                <p className="font-medium">End of Term</p>
                <p className="text-sm text-muted-foreground">Last day of the current term</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

