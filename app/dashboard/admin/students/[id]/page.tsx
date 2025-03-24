"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { getStudentById, deleteStudent } from "@/app/actions/student-actions"
import { ArrowLeft, Edit, Trash2, GraduationCap, Calendar } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

export default function StudentDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [student, setStudent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const data = await getStudentById(params.id)
        if (data) {
          setStudent(data)
        } else {
          setError("Failed to load student data")
        }
      } catch (error) {
        console.error("Error fetching student:", error)
        setError("An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchStudentData()
  }, [params.id])

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this student? This action cannot be undone.")) {
      try {
        const result = await deleteStudent(params.id)

        if (result.success) {
          toast({
            title: "Student Deleted",
            description: "Student has been deleted successfully.",
          })
          router.push("/dashboard/admin/students")
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to delete student. Please try again.",
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg">Loading student details...</p>
        </div>
      </div>
    )
  }

  if (error || !student) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-red-600">
              <p>{error || "Student not found"}</p>
              <Button className="mt-4" onClick={() => router.push("/dashboard/admin/students")}>
                Return to Students
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const studentData = student.student

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex items-center">
          <Button variant="outline" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{student.name}</h1>
            <p className="text-muted-foreground">
              {studentData.admissionNumber} | {studentData.class?.name || "No Class"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/admin/students/${params.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit Student
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Student
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Student Details</TabsTrigger>
          <TabsTrigger value="academics">Academics</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Basic details about the student</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Full Name</h3>
                  <p className="text-lg">{student.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Admission Number</h3>
                  <p className="text-lg">{studentData.admissionNumber}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Date of Birth</h3>
                  <p className="text-lg">
                    {studentData.dateOfBirth ? format(new Date(studentData.dateOfBirth), "PPP") : "N/A"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Gender</h3>
                  <p className="text-lg">{studentData.gender}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                  <p className="text-lg">{student.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
                  <p className="text-lg">{studentData.address || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Academic Information</CardTitle>
              <CardDescription>Class and enrollment details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Class</h3>
                  <p className="text-lg">{studentData.class?.name || "Not assigned"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Grade</h3>
                  <p className="text-lg">{studentData.class?.grade || "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Section</h3>
                  <p className="text-lg">{studentData.class?.section || "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Stream</h3>
                  <p className="text-lg">{studentData.stream || "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Enrollment Date</h3>
                  <p className="text-lg">
                    {studentData.enrollmentDate ? format(new Date(studentData.enrollmentDate), "PPP") : "N/A"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Class Teacher</h3>
                  <p className="text-lg">{studentData.class?.teacher?.user?.name || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Parent/Guardian Information</CardTitle>
              <CardDescription>Details about the student's parent or guardian</CardDescription>
            </CardHeader>
            <CardContent>
              {studentData.parent ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Parent Name</h3>
                      <p className="text-lg">{studentData.parent.user?.name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Relationship</h3>
                      <p className="text-lg">{studentData.parent.relationship || "Parent"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                      <p className="text-lg">{studentData.parent.user?.email}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Contact Number</h3>
                      <p className="text-lg">{studentData.parent.contactNumber || "N/A"}</p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Link href={`/dashboard/admin/parents/${studentData.parent.id}`}>
                      <Button variant="outline" size="sm">
                        View Parent Profile
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p>No parent/guardian information available.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academics">
          <Card>
            <CardHeader>
              <CardTitle>Academic Performance</CardTitle>
              <CardDescription>Grades and academic records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">Academic records will be displayed here.</p>
                <Link href={`/dashboard/admin/students/${params.id}/academics`} className="mt-2 inline-block">
                  <Button variant="outline" size="sm">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    View Full Academic Records
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>Student's attendance history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">Attendance records will be displayed here.</p>
                <Link href={`/dashboard/admin/students/${params.id}/attendance`} className="mt-2 inline-block">
                  <Button variant="outline" size="sm">
                    <Calendar className="mr-2 h-4 w-4" />
                    View Full Attendance Records
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

