"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Mail, Phone } from "lucide-react"
import Link from "next/link"

export default function StudentDetail({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [student, setStudent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [grades, setGrades] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])

  useEffect(() => {
    const fetchStudentData = async () => {
      setIsLoading(true)
      try {
        // Fetch student details
        const studentResponse = await fetch(`/api/students/${params.id}`)
        if (!studentResponse.ok) throw new Error("Failed to fetch student")
        const studentData = await studentResponse.json()
        setStudent(studentData)

        // Fetch grades
        const gradesResponse = await fetch(`/api/grades?studentId=${params.id}`)
        if (!gradesResponse.ok) throw new Error("Failed to fetch grades")
        const gradesData = await gradesResponse.json()
        setGrades(gradesData)

        // Fetch attendance
        const attendanceResponse = await fetch(`/api/attendance?studentId=${params.id}`)
        if (!attendanceResponse.ok) throw new Error("Failed to fetch attendance")
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
  }, [params.id, toast])

  if (isLoading) {
    return <div className="text-center py-8">Loading student data...</div>
  }

  if (!student) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Student not found.</p>
        <Button className="mt-4" onClick={() => router.push("/dashboard/teacher/students")}>
          Back to Students
        </Button>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/teacher/students")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {student.firstName} {student.lastName}
          </h1>
          <p className="text-muted-foreground">Student Details</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/teacher/grades/new?studentId=${student.id}`}>
            <Button>Add Grade</Button>
          </Link>
          <Link href={`/dashboard/teacher/attendance/mark?studentId=${student.id}`}>
            <Button variant="outline">Mark Attendance</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                <p>
                  {student.firstName} {student.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Admission Number</p>
                <p>{student.admissionNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Class</p>
                <p>{student.class?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gender</p>
                <p>{student.gender}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                <p>{formatDate(student.dateOfBirth)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Enrollment Date</p>
                <p>{formatDate(student.enrollmentDate)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Parent Information</CardTitle>
          </CardHeader>
          <CardContent>
            {student.parent ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Parent Name</p>
                  <p>{student.parent.user?.name || "N/A"}</p>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <p>{student.parent.user?.email || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p>{student.parent.phone || "N/A"}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Address</p>
                  <p>{student.address || "N/A"}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No parent information available.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="grades">
        <TabsList>
          <TabsTrigger value="grades">Grades</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="grades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Academic Performance</CardTitle>
              <CardDescription>Grades and academic records</CardDescription>
            </CardHeader>
            <CardContent>
              {grades.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted">
                        <th className="p-2 text-left font-medium">Subject</th>
                        <th className="p-2 text-left font-medium">Term</th>
                        <th className="p-2 text-left font-medium">Score</th>
                        <th className="p-2 text-left font-medium">Grade</th>
                        <th className="p-2 text-left font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grades.map((grade) => (
                        <tr key={grade.id} className="border-t">
                          <td className="p-2">{grade.subject}</td>
                          <td className="p-2">{grade.term}</td>
                          <td className="p-2">{grade.score}</td>
                          <td className="p-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                grade.grade.startsWith("A")
                                  ? "bg-green-100 text-green-800"
                                  : grade.grade.startsWith("B")
                                    ? "bg-blue-100 text-blue-800"
                                    : grade.grade.startsWith("C")
                                      ? "bg-yellow-100 text-yellow-800"
                                      : grade.grade.startsWith("D")
                                        ? "bg-orange-100 text-orange-800"
                                        : "bg-red-100 text-red-800"
                              }`}
                            >
                              {grade.grade}
                            </span>
                          </td>
                          <td className="p-2">{formatDate(grade.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">No grades recorded yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>Student attendance history</CardDescription>
            </CardHeader>
            <CardContent>
              {attendance.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted">
                        <th className="p-2 text-left font-medium">Date</th>
                        <th className="p-2 text-left font-medium">Status</th>
                        <th className="p-2 text-left font-medium">Class</th>
                        <th className="p-2 text-left font-medium">Marked By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendance.map((record) => (
                        <tr key={record.id} className="border-t">
                          <td className="p-2">{formatDate(record.date)}</td>
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
                          <td className="p-2">{record.class?.name || "N/A"}</td>
                          <td className="p-2">{record.markedBy?.name || "System"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">No attendance records yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

