"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, Edit, Trash2, ArrowLeft, User, Mail, Phone, Home, BookOpen, Users, Building } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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

export default function TeacherDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [teacher, setTeacher] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch(`/api/teachers/${params.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch teacher data")
        }
        const teacherData = await response.json()
        setTeacher(teacherData)
      } catch (error) {
        console.error("Error loading data:", error)
        setError("Failed to load teacher data. Please refresh the page.")
        toast({
          title: "Error",
          description: "Failed to load teacher data. Please refresh the page.",
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
      const response = await fetch(`/api/teachers/${params.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete teacher")
      }

      toast({
        title: "Success",
        description: "Teacher deleted successfully",
      })

      router.push("/dashboard/admin/teachers")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
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
          <p className="text-lg">Loading teacher details...</p>
        </div>
      </div>
    )
  }

  if (!teacher) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Teacher not found</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => router.push("/dashboard/admin/teachers")}>Back to Teachers</Button>
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
          <h1 className="text-2xl font-bold">Teacher Details</h1>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/admin/teachers/${params.id}/edit`}>
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
                <AlertDialogTitle>Delete Teacher</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this teacher? This action cannot be undone and will affect all
                  associated classes and students.
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
                  <span className="font-medium">{teacher.user.name}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Email</div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{teacher.user.email}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Department</div>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="secondary">{teacher.department}</Badge>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Qualification</div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span>{teacher.qualification}</span>
                </div>
              </div>

              {teacher.contactNumber && (
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Contact Number</div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{teacher.contactNumber}</span>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Role</div>
                <Badge variant="outline">{teacher.user.role}</Badge>
              </div>
            </div>

            {teacher.address && (
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Address</div>
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <span>{teacher.address}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Teaching Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Teaching Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Total Classes</div>
              <div className="text-2xl font-bold">{teacher.classes?.length || 0}</div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Total Students</div>
              <div className="text-2xl font-bold">
                {teacher.classes?.reduce((total: number, cls: any) => total + (cls.students?.length || 0), 0) || 0}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Account Created</div>
              <div className="text-sm">{new Date(teacher.createdAt).toLocaleDateString()}</div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Last Updated</div>
              <div className="text-sm">{new Date(teacher.updatedAt).toLocaleDateString()}</div>
            </div>
          </CardContent>
        </Card>

        {/* Classes Assigned */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Classes Assigned
            </CardTitle>
          </CardHeader>
          <CardContent>
            {teacher.classes && teacher.classes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teacher.classes.map((cls: any) => (
                  <Card key={cls.id} className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{cls.name}</h4>
                        <Badge variant="outline">Grade {cls.grade}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">Section: {cls.section}</div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-3 w-3" />
                        <span>{cls.students?.length || 0} students</span>
                      </div>
                      <Link href={`/dashboard/admin/classes/${cls.id}`}>
                        <Button variant="outline" size="sm" className="w-full bg-transparent">
                          View Class
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No classes assigned yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
