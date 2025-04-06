"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Loader2, Mail, Phone, MapPin, Calendar, User, GraduationCap } from "lucide-react"

export default function StudentDetails({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const { id } = params

  const [student, setStudent] = useState<any>(null)
  const [grades, setGrades] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStudentDetails = async () => {
      setIsLoading(true)
      try {
        // Fetch student details
        const response = await fetch(`/api/students/${id}`)
        if (!response.ok) throw new Error("Failed to fetch student details")
        const data = await response.json()
        setStudent(data)

        // Fetch student grades
        const gradesResponse = await fetch(`/api/grades/student/${id}`)
        if (!gradesResponse.ok) throw new Error("Failed to fetch student grades")
        const gradesData = await gradesResponse.json()
        setGrades(gradesData)

        // Fetch student attendance
        const attendanceResponse = await fetch(`/api/attendance/student/${id}`)
        if (!attendanceResponse.ok) throw new Error("Failed to fetch student attendance")
        const attendanceData = await attendanceResponse.json()
        setAttendance(attendanceData)
      } catch (error) {
        console.error("Error fetching student details:", error)
        toast({
          title: "Error",
          description: "Failed to load student details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStudentDetails()
  }, [id, toast])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!student) {
    return (
      <div className="text-center py-8">
        <p>Student not found or you don't have permission to view this student.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{`${student.firstName} ${student.lastName}`}</h1>
          <p className="text-muted-foreground">Student Details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Admission Number: {student.admissionNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Date of Birth: {formatDate(student.dateOfBirth)}</span>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <span>Class: {student.class?.name || "Not assigned"}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>Address: {student.address || "Not provided"}</span>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-medium mb-2">Parent Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Name: {student.parent?.user?.name || "Not provided"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>Email: {student.parent?.user?.email || "Not provided"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>Phone: {student.parent?.phone || "Not provided"}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/dashboard/teacher/messages?parent=${student.parent?.user?.id}`)}
              >
                <Mail className="mr-2 h-4 w-4" />
                Message Parent
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <Tabs defaultValue="grades">
              <TabsList>
                <TabsTrigger value="grades">Grades</TabsTrigger>
                <TabsTrigger value="attendance">Attendance</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <TabsContent value="grades" className="mt-0">
              {grades.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">No grades recorded for this student.</p>
              ) : (
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
                          <td className="p-2">{grade.subject.name}</td>
                          <td className="p-2">{grade.term.name}</td>
                          <td className="p-2">{grade.score}</td>
                          <td className="p-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                grade.letterGrade.startsWith("A")
                                  ? "bg-green-100 text-green-800"
                                  : grade.letterGrade.startsWith("B")
                                    ? "bg-blue-100 text-blue-800"
                                    : grade.letterGrade.startsWith("C")
                                      ? "bg-yellow-100 text-yellow-800"
                                      : grade.letterGrade.startsWith("D")
                                        ? "bg-orange-100 text-orange-800"
                                        : "bg-red-100 text-red-800"
                              }`}
                            >
                              {grade.letterGrade}
                            </span>
                          </td>
                          <td className="p-2">{formatDate(grade.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="attendance" className="mt-0">
              {attendance.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">No attendance records for this student.</p>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted">
                        <th className="p-2 text-left font-medium">Date</th>
                        <th className="p-2 text-left font-medium">Status</th>
                        <th className="p-2 text-left font-medium">Class</th>
                        <th className="p-2 text-left font-medium">Remarks</th>
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
                          <td className="p-2">{record.class.name}</td>
                          <td className="p-2">{record.remarks || "No remarks"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

