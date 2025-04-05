"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Loader2 } from "lucide-react"

export default function ClassDetails({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const { id } = params

  const [classData, setClassData] = useState<any>(null)
  const [students, setStudents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchClassDetails = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/classes/${id}`)
        if (!response.ok) throw new Error("Failed to fetch class details")
        const data = await response.json()
        setClassData(data)

        // Fetch students in this class
        const studentsResponse = await fetch(`/api/students?classId=${id}`)
        if (!studentsResponse.ok) throw new Error("Failed to fetch students")
        const studentsData = await studentsResponse.json()
        setStudents(Array.isArray(studentsData) ? studentsData : [])
      } catch (error) {
        console.error("Error fetching class details:", error)
        toast({
          title: "Error",
          description: "Failed to load class details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchClassDetails()
  }, [id, toast])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!classData) {
    return (
      <div className="text-center py-8">
        <p>Class not found or you don't have permission to view it.</p>
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
          <h1 className="text-3xl font-bold tracking-tight">{classData.name}</h1>
          <p className="text-muted-foreground">{classData.section || "No section"}</p>
        </div>
      </div>

      <Tabs defaultValue="students">
        <TabsList>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Students</CardTitle>
              <CardDescription>Students enrolled in this class</CardDescription>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">No students found in this class.</p>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted">
                        <th className="p-2 text-left font-medium">Name</th>
                        <th className="p-2 text-left font-medium">Admission #</th>
                        <th className="p-2 text-left font-medium">Gender</th>
                        <th className="p-2 text-left font-medium">Parent</th>
                        <th className="p-2 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.id} className="border-t">
                          <td className="p-2">{`${student.firstName} ${student.lastName}`}</td>
                          <td className="p-2">{student.admissionNumber}</td>
                          <td className="p-2">{student.gender}</td>
                          <td className="p-2">{student.parent?.user?.name || "N/A"}</td>
                          <td className="p-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/dashboard/teacher/students/${student.id}`)}
                            >
                              View
                            </Button>
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

        <TabsContent value="subjects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subjects</CardTitle>
              <CardDescription>Subjects taught in this class</CardDescription>
            </CardHeader>
            <CardContent>
              {!classData.subjects || classData.subjects.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">No subjects assigned to this class.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classData.subjects.map((subject: string, index: number) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle>{subject}</CardTitle>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Class Schedule</CardTitle>
              <CardDescription>Weekly schedule for this class</CardDescription>
            </CardHeader>
            <CardContent>
              {!classData.schedule || classData.schedule.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">No schedule available for this class.</p>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted">
                        <th className="p-2 text-left font-medium">Day</th>
                        <th className="p-2 text-left font-medium">Subject</th>
                        <th className="p-2 text-left font-medium">Start Time</th>
                        <th className="p-2 text-left font-medium">End Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classData.schedule.map((item: any, index: number) => (
                        <tr key={index} className="border-t">
                          <td className="p-2">{item.day}</td>
                          <td className="p-2">{item.subject}</td>
                          <td className="p-2">{item.startTime}</td>
                          <td className="p-2">{item.endTime}</td>
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

