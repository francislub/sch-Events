"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface Student {
  id: string
  firstName: string
  lastName: string
  email: string
  grade: string
  dateOfBirth: string
  address: string
  classes: {
    id: string
    name: string
  }[]
}

interface Grade {
  id: string
  value: number
  term: string
  subject: {
    name: string
  }
  createdAt: string
}

interface Attendance {
  id: string
  date: string
  status: string
  class: {
    name: string
  }
}

export default function StudentDetailPage() {
  const params = useParams()
  const studentId = params.id as string
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [student, setStudent] = useState<Student | null>(null)
  const [grades, setGrades] = useState<Grade[]>([])
  const [attendance, setAttendance] = useState<Attendance[]>([])

  useEffect(() => {
    const fetchStudentData = async () => {
      setIsLoading(true)
      try {
        // Fetch student details
        const studentResponse = await fetch(`/api/students/${studentId}`)
        if (!studentResponse.ok) throw new Error("Failed to fetch student details")
        const studentData = await studentResponse.json()
        setStudent(studentData)

        // Fetch student grades
        const gradesResponse = await fetch(`/api/grades/student/${studentId}`)
        if (!gradesResponse.ok) throw new Error("Failed to fetch student grades")
        const gradesData = await gradesResponse.json()
        setGrades(gradesData)

        // Fetch student attendance
        const attendanceResponse = await fetch(`/api/attendance/student/${studentId}`)
        if (!attendanceResponse.ok) throw new Error("Failed to fetch student attendance")
        const attendanceData = await attendanceResponse.json()
        setAttendance(attendanceData)
      } catch (error) {
        console.error("Error fetching student data:", error)
        toast({
          title: "Error",
          description: "Failed to load student data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStudentData()
  }, [studentId, toast])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <h2 className="text-2xl font-bold mb-2">Student Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The student you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Link href="/dashboard/teacher/students">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Students
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/teacher/students">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">
            {student.firstName} {student.lastName}
          </h1>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="grades">Grades</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
              <CardDescription>Personal details and enrolled classes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Personal Information</h3>
                  <dl className="space-y-2">
                    <div className="flex flex-col">
                      <dt className="text-sm text-muted-foreground">Full Name</dt>
                      <dd>
                        {student.firstName} {student.lastName}
                      </dd>
                    </div>
                    <div className="flex flex-col">
                      <dt className="text-sm text-muted-foreground">Email</dt>
                      <dd>{student.email}</dd>
                    </div>
                    <div className="flex flex-col">
                      <dt className="text-sm text-muted-foreground">Grade Level</dt>
                      <dd>{student.grade}</dd>
                    </div>
                    <div className="flex flex-col">
                      <dt className="text-sm text-muted-foreground">Date of Birth</dt>
                      <dd>{new Date(student.dateOfBirth).toLocaleDateString()}</dd>
                    </div>
                    <div className="flex flex-col">
                      <dt className="text-sm text-muted-foreground">Address</dt>
                      <dd>{student.address || "Not provided"}</dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Enrolled Classes</h3>
                  {student.classes.length === 0 ? (
                    <p className="text-muted-foreground">Not enrolled in any classes.</p>
                  ) : (
                    <ul className="space-y-2">
                      {student.classes.map((cls) => (
                        <li key={cls.id} className="border rounded-md p-2">
                          <Link href={`/dashboard/teacher/classes/${cls.id}`} className="hover:underline">
                            {cls.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Grades</CardTitle>
                <CardDescription>Latest academic performance</CardDescription>
              </CardHeader>
              <CardContent>
                {grades.length === 0 ? (
                  <p className="text-muted-foreground">No grades recorded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {grades.slice(0, 5).map((grade) => (
                      <div key={grade.id} className="border rounded-md p-2 flex justify-between items-center">
                        <div>
                          <p className="font-medium">{grade.subject.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {grade.term} • {new Date(grade.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-lg font-bold">{grade.value}%</div>
                      </div>
                    ))}
                    <div className="pt-2">
                      <Link href="#" onClick={() => document.querySelector('[data-value="grades"]')?.click()}>
                        <Button variant="link" className="p-0 h-auto">
                          View all grades
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Attendance</CardTitle>
                <CardDescription>Latest attendance records</CardDescription>
              </CardHeader>
              <CardContent>
                {attendance.length === 0 ? (
                  <p className="text-muted-foreground">No attendance records yet.</p>
                ) : (
                  <div className="space-y-2">
                    {attendance.slice(0, 5).map((record) => (
                      <div key={record.id} className="border rounded-md p-2 flex justify-between items-center">
                        <div>
                          <p className="font-medium">{record.class.name}</p>
                          <p className="text-sm text-muted-foreground">{new Date(record.date).toLocaleDateString()}</p>
                        </div>
                        <div>
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
                        </div>
                      </div>
                    ))}
                    <div className="pt-2">
                      <Link href="#" onClick={() => document.querySelector('[data-value="attendance"]')?.click()}>
                        <Button variant="link" className="p-0 h-auto">
                          View all attendance
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="grades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Academic Performance</CardTitle>
              <CardDescription>
                All grades for {student.firstName} {student.lastName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {grades.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No grades recorded for this student yet.</p>
                  <Link href="/dashboard/teacher/grades/new">
                    <Button className="mt-4">Add New Grade</Button>
                  </Link>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted">
                        <th className="p-2 text-left font-medium">Subject</th>
                        <th className="p-2 text-left font-medium">Term</th>
                        <th className="p-2 text-left font-medium">Grade</th>
                        <th className="p-2 text-left font-medium">Date</th>
                        <th className="p-2 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grades.map((grade) => (
                        <tr key={grade.id} className="border-t">
                          <td className="p-2">{grade.subject.name}</td>
                          <td className="p-2">{grade.term}</td>
                          <td className="p-2 font-medium">{grade.value}%</td>
                          <td className="p-2">{new Date(grade.createdAt).toLocaleDateString()}</td>
                          <td className="p-2">
                            <Link href={`/dashboard/teacher/grades/edit/${grade.id}`}>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>
                All attendance records for {student.firstName} {student.lastName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {attendance.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No attendance records for this student yet.</p>
                  <Link href="/dashboard/teacher/attendance/mark">
                    <Button className="mt-4">Mark Attendance</Button>
                  </Link>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted">
                        <th className="p-2 text-left font-medium">Date</th>
                        <th className="p-2 text-left font-medium">Class</th>
                        <th className="p-2 text-left font-medium">Status</th>
                        <th className="p-2 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendance.map((record) => (
                        <tr key={record.id} className="border-t">
                          <td className="p-2">{new Date(record.date).toLocaleDateString()}</td>
                          <td className="p-2">{record.class.name}</td>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

