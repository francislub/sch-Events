"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { getStudentById, deleteStudent } from "@/app/actions/student-actions"
import { AlertCircle, Edit, Trash2, ArrowLeft, User, Calendar, School, Home, Mail } from "lucide-react"
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
        // Fetch student data
        const studentData = await getStudentById(params.id)
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
          <p className="text-lg">Loading...</p>
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
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Student Details</h1>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/admin/students/${params.id}/edit`}>
            <Button variant="outline" className="flex items-center gap-2">
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
                  Are you sure you want to delete this student? This action cannot be undone.
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
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Full Name</div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{student.name}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Date of Birth</div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {student.student?.dateOfBirth
                      ? format(new Date(student.student.dateOfBirth), "MMMM d, yyyy")
                      : "Not specified"}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Gender</div>
                <div>{student.student?.gender || "Not specified"}</div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Admission Number</div>
                <div className="flex items-center gap-2">
                  <School className="h-4 w-4 text-muted-foreground" />
                  <span>{student.student?.admissionNumber || "Not specified"}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Email</div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{student.email}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Address</div>
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <span>{student.student?.address || "Not specified"}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Academic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Class</div>
              <div>{student.student?.class?.name || "Not assigned"}</div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Stream</div>
              <div>{student.student?.stream || "Not assigned"}</div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Class Teacher</div>
              <div>{student.student?.class?.teacher?.user?.name || "Not assigned"}</div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Enrollment Date</div>
              <div>
                {student.student?.enrollmentDate
                  ? format(new Date(student.student.enrollmentDate), "MMMM d, yyyy")
                  : "Not specified"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Parent/Guardian Information</CardTitle>
          </CardHeader>
          <CardContent>
            {student.student?.parent ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Name</div>
                  <div>{student.student.parent.user?.name || "Not specified"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Relationship</div>
                  <div>{student.student.parent.relationship || "Parent"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Contact</div>
                  <div>{student.student.parent.user?.email || "Not specified"}</div>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">No parent/guardian information available</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

