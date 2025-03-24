"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { getClassById, deleteClass } from "@/app/actions/class-actions"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
import Link from "next/link"

export default function ClassDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [classData, setClassData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const result = await getClassById(params.id)
        if (result.success) {
          setClassData(result.data)
        } else {
          setError(result.errors?._form?.[0] || "Failed to load class data")
        }
      } catch (error) {
        console.error("Error fetching class:", error)
        setError("An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchClassData()
  }, [params.id])

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this class? This action cannot be undone.")) {
      try {
        const result = await deleteClass(params.id)

        if (result.success) {
          toast({
            title: "Class Deleted",
            description: "Class has been deleted successfully.",
          })
          router.push("/dashboard/admin/classes")
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to delete class. Please try again.",
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
          <p className="text-lg">Loading class details...</p>
        </div>
      </div>
    )
  }

  if (error) {
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
              <p>{error}</p>
              <Button className="mt-4" onClick={() => router.push("/dashboard/admin/classes")}>
                Return to Classes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex items-center">
          <Button variant="outline" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{classData.name}</h1>
            <p className="text-muted-foreground">
              Grade {classData.grade} | Section {classData.section}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/admin/classes/${params.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit Class
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Class
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Class Details</TabsTrigger>
          <TabsTrigger value="students">Students ({classData.students?.length || 0})</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Class Information</CardTitle>
              <CardDescription>Detailed information about the class</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Class Name</h3>
                  <p className="text-lg">{classData.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Grade</h3>
                  <p className="text-lg">{classData.grade}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Section</h3>
                  <p className="text-lg">{classData.section}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Number of Students</h3>
                  <p className="text-lg">{classData.students?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Class Teacher</CardTitle>
              <CardDescription>Information about the assigned teacher</CardDescription>
            </CardHeader>
            <CardContent>
              {classData.teacher ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Teacher Name</h3>
                      <p className="text-lg">{classData.teacher.user?.name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                      <p className="text-lg">{classData.teacher.user?.email}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Contact Number</h3>
                      <p className="text-lg">{classData.teacher.contactNumber || "N/A"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Specialization</h3>
                      <p className="text-lg">{classData.teacher.specialization || "N/A"}</p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Link href={`/dashboard/admin/teachers/${classData.teacher.id}`}>
                      <Button variant="outline" size="sm">
                        View Teacher Profile
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p>No teacher assigned to this class.</p>
                  <Link href={`/dashboard/admin/classes/${params.id}/edit`} className="mt-2 inline-block">
                    <Button variant="outline" size="sm">
                      Assign Teacher
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>Students</CardTitle>
              <CardDescription>Students enrolled in this class</CardDescription>
            </CardHeader>
            <CardContent>
              {classData.students && classData.students.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted">
                        <th className="p-2 text-left font-medium">Name</th>
                        <th className="p-2 text-left font-medium">Admission No.</th>
                        <th className="p-2 text-left font-medium">Gender</th>
                        <th className="p-2 text-left font-medium">Parent</th>
                        <th className="p-2 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classData.students.map((student: any) => (
                        <tr key={student.id} className="border-t">
                          <td className="p-2 font-medium">
                            {student.firstName} {student.lastName}
                          </td>
                          <td className="p-2">{student.admissionNumber}</td>
                          <td className="p-2">{student.gender}</td>
                          <td className="p-2">{student.parent?.user?.name || "N/A"}</td>
                          <td className="p-2">
                            <Link href={`/dashboard/admin/students/${student.id}`}>
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No students enrolled in this class.</p>
                  <Link href="/dashboard/admin/students/new" className="mt-2 inline-block">
                    <Button variant="outline" size="sm">
                      Add Student
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

