"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { ArrowLeft, Book, Calendar, Clock, Mail, Phone, User } from "lucide-react"

interface Child {
  id: string
  firstName: string
  lastName: string
  grade: string
  section: string
  admissionNumber: string
  dateOfBirth: string
  gender: string
  enrollmentDate: string
  address: string
  class: {
    id: string
    name: string
    teacher: {
      id: string
      user: {
        id: string
        name: string
        email: string
      }
    }
  }
}

interface AttendanceSummary {
  present: number
  absent: number
  late: number
  rate: string
}

interface AcademicSummary {
  gpa: string
  highestGrade: number
  highestSubject: string
  averageScore: number
}

export default function ChildProfile() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const childId = params.id as string

  const [child, setChild] = useState<Child | null>(null)
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary | null>(null)
  const [academicSummary, setAcademicSummary] = useState<AcademicSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    async function fetchChildData() {
      try {
        setIsLoading(true)

        // Fetch child profile
        const profileRes = await fetch(`/api/students/${childId}`)
        if (!profileRes.ok) throw new Error("Failed to fetch child profile")
        const profileData = await profileRes.json()
        setChild(profileData)

        // Fetch attendance summary
        const attendanceRes = await fetch(`/api/attendance/summary?studentId=${childId}&current=true`)
        if (!attendanceRes.ok) throw new Error("Failed to fetch attendance summary")
        const attendanceData = await attendanceRes.json()
        setAttendanceSummary(attendanceData)

        // Fetch academic summary
        const academicRes = await fetch(`/api/grades/summary?studentId=${childId}`)
        if (!academicRes.ok) throw new Error("Failed to fetch academic summary")
        const academicData = await academicRes.json()
        setAcademicSummary(academicData)
      } catch (error) {
        console.error("Error fetching child data:", error)
        toast({
          title: "Error",
          description: "Failed to load child profile. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (status === "authenticated" && childId) {
      fetchChildData()
    }
  }, [childId, status, toast])

  const handleContactTeacher = () => {
    if (child?.class?.teacher?.user) {
      router.push(`/dashboard/parent/messages?contact=${child.class.teacher.user.id}`)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Student Profile</h1>
            <p className="text-muted-foreground">Loading student information...</p>
          </div>
        </div>

        <div className="grid gap-6">
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-48 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!child) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Student Not Found</h1>
            <p className="text-muted-foreground">The requested student profile could not be found.</p>
          </div>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground mb-4">
              The student profile you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button onClick={() => router.push("/dashboard/parent/children")}>Go Back to Children List</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {child.firstName} {child.lastName}
          </h1>
          <p className="text-muted-foreground">
            Student Profile • Grade {child.grade}
            {child.section}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center mb-6">
              <Avatar className="h-32 w-32 mb-4">
                <AvatarImage src="/placeholder.svg?height=128&width=128" alt={`${child.firstName} ${child.lastName}`} />
                <AvatarFallback>
                  {child.firstName[0]}
                  {child.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-bold">
                {child.firstName} {child.lastName}
              </h3>
              <p className="text-muted-foreground">Admission #{child.admissionNumber}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-medium">{child.gender}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">{new Date(child.dateOfBirth).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Enrollment Date</p>
                  <p className="font-medium">{new Date(child.enrollmentDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Book className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Class</p>
                  <p className="font-medium">{child.class?.name || "Not assigned"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Academic Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary">
              <TabsList className="mb-4">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="teacher">Class Teacher</TabsTrigger>
                <TabsTrigger value="actions">Quick Actions</TabsTrigger>
              </TabsList>

              <TabsContent value="summary">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Attendance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {attendanceSummary ? (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Attendance Rate</p>
                            <p className="text-2xl font-bold">{attendanceSummary.rate}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Present / Absent / Late</p>
                            <p className="font-medium">
                              {attendanceSummary.present} / {attendanceSummary.absent} / {attendanceSummary.late}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No attendance data available</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Academics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {academicSummary ? (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">GPA</p>
                            <p className="text-2xl font-bold">{academicSummary.gpa}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Average Score</p>
                            <p className="text-2xl font-bold">{academicSummary.averageScore}%</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No academic data available</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <Button
                    variant="outline"
                    className="h-auto py-4"
                    onClick={() => router.push(`/dashboard/parent/academics?child=${child.id}`)}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Book className="h-5 w-5" />
                      <span>View Grades</span>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto py-4"
                    onClick={() => router.push(`/dashboard/parent/attendance?child=${child.id}`)}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      <span>View Attendance</span>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto py-4"
                    onClick={() => router.push(`/dashboard/parent/schedule?child=${child.id}`)}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Clock className="h-5 w-5" />
                      <span>View Schedule</span>
                    </div>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="teacher">
                {child.class?.teacher ? (
                  <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src="/placeholder.svg?height=96&width=96" alt={child.class.teacher.user.name} />
                      <AvatarFallback>
                        {child.class.teacher.user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="space-y-4 text-center md:text-left">
                      <div>
                        <h3 className="text-xl font-bold">{child.class.teacher.user.name}</h3>
                        <p className="text-muted-foreground">Class Teacher - {child.class.name}</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 justify-center md:justify-start">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{child.class.teacher.user.email}</span>
                        </div>
                      </div>

                      <Button onClick={handleContactTeacher}>Contact Teacher</Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No class teacher assigned</p>
                )}
              </TabsContent>

              <TabsContent value="actions">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto py-6"
                    onClick={() => router.push(`/dashboard/parent/messages?contact=${child.class?.teacher?.user?.id}`)}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Mail className="h-5 w-5" />
                      <span>Message Teacher</span>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto py-6"
                    onClick={() => router.push(`/dashboard/parent/messages?type=admin`)}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Phone className="h-5 w-5" />
                      <span>Contact Administration</span>
                    </div>
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

