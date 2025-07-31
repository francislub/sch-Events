"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { deleteStudent } from "@/app/actions/student-actions"
import {
  AlertCircle,
  Edit,
  Trash2,
  ArrowLeft,
  User,
  Calendar,
  School,
  Home,
  Mail,
  Users,
  BookOpen,
  Phone,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { format } from "date-fns"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default function StudentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [student, setStudent] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch student data with all relations
        const response = await fetch(`/api/students/${params.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch student data")
        }
        const studentData = await response.json()
        setStudent(studentData)
      } catch (error) {
        console.error("Error loading data:", error)
        setError("Failed to load student data. Please refresh the page.")
        toast({
          title: "Error",
          description: "Failed to load student data. Please refresh the page.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [params.id, toast])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteStudent(params.id)

      if (!result.success) {
        toast({
          title: "Error",
          description: result.error || "Failed to delete student",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Student deleted successfully",
      })

      router.push("/dashboard/admin/students")
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg">Loading student details...</p>
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Student not found</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => router.push("/dashboard/admin/students")}>Back to Students</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Student Details</h1>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/admin/students/${params.id}/edit`}>
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Student</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this student? This action cannot be undone and will remove all
                  associated records.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Full Name</div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{`${student.firstName} ${student.lastName}`}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Admission Number</div>
                <div className="flex items-center gap-2">
                  <School className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="outline">{student.admissionNumber}</Badge>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Date of Birth</div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {student.dateOfBirth ? format(new Date(student.dateOfBirth), "MMMM d, yyyy") : "Not specified"}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Gender</div>
                <div>{student.gender || "Not specified"}</div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Grade</div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <Badge>{student.grade}</Badge>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Section</div>
                <div>{student.section}</div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Enrollment Date</div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {student.enrollmentDate
                      ? format(new Date(student.enrollmentDate), "MMMM d, yyyy")
                      : "Not specified"}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Email</div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{student.user?.email || "Not specified"}</span>
                </div>
              </div>
            </div>

            {student.address && (
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Address</div>
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <span>{student.address}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Academic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Academic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Class</div>
              <div className="flex items-center gap-2">
                <School className="h-4 w-4 text-muted-foreground" />
                <span>{student.class?.name || "Not assigned"}</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Class Teacher</div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{student.class?.teacher?.user?.name || "Not assigned"}</span>
              </div>
            </div>

            {student.class?.teacher?.department && (
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Department</div>
                <Badge variant="secondary">{student.class.teacher.department}</Badge>
              </div>
            )}

            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Total Grades</div>
              <div className="text-2xl font-bold">{student.grades?.length || 0}</div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Attendance Records</div>
              <div className="text-2xl font-bold">{student.attendances?.length || 0}</div>
            </div>
          </CardContent>
        </Card>

        {/* Parent/Guardian Information */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Parent/Guardian Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {student.parent ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Name</div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{student.parent.user?.name || "Not specified"}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Relationship</div>
                  <Badge variant="outline">{student.parent.relationship || "Parent"}</Badge>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Email</div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{student.parent.user?.email || "Not specified"}</span>
                  </div>
                </div>
                {student.parent.contactNumber && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">Contact Number</div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{student.parent.contactNumber}</span>
                    </div>
                  </div>
                )}
                {student.parent.address && (
                  <div className="space-y-1 md:col-span-2">
                    <div className="text-sm font-medium text-muted-foreground">Address</div>
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      <span>{student.parent.address}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground">No parent/guardian information available</div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Recent Grades</h4>
                {student.grades && student.grades.length > 0 ? (
                  <div className="space-y-2">
                    {student.grades.slice(0, 3).map((grade: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                        <span className="text-sm">{grade.subject}</span>
                        <Badge
                          variant={grade.score >= 70 ? "default" : grade.score >= 50 ? "secondary" : "destructive"}
                        >
                          {grade.grade}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No grades recorded yet</p>
                )}
              </div>

              <div>
                <h4 className="font-medium mb-2">Recent Attendance</h4>
                {student.attendances && student.attendances.length > 0 ? (
                  <div className="space-y-2">
                    {student.attendances.slice(0, 3).map((attendance: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                        <span className="text-sm">{format(new Date(attendance.date), "MMM d, yyyy")}</span>
                        <Badge
                          variant={
                            attendance.status === "Present"
                              ? "default"
                              : attendance.status === "Late"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {attendance.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No attendance records yet</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
