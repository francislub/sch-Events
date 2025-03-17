"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Clock, UserCheck, BookOpen, Users } from 'lucide-react'
import { getClasses } from "@/app/actions/class-actions"

export default function TeacherClasses() {
  const router = useRouter()
  const { toast } = useToast()
  const [classes, setClasses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch classes data
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        // In a real app, this would use the server action to fetch data
        // const result = await getClasses()
        // if (result.success) {
        //   setClasses(result.data)
        // } else {
        //   throw new Error(result.errors?._form?.[0] || "Failed to fetch classes")
        // }

        // Mock data for demonstration
        setTimeout(() => {
          const mockClasses = [
            {
              id: "1",
              name: "10A",
              grade: "10",
              section: "A",
              teacher: {
                id: "1",
                user: {
                  name: "Ms. Johnson"
                },
                department: "Mathematics"
              },
              students: [
                { id: "1", firstName: "Sarah", lastName: "Doe" },
                { id: "2", firstName: "Michael", lastName: "Smith" },
                { id: "5", firstName: "Jessica", lastName: "Brown" },
                { id: "8", firstName: "James", lastName: "Wilson" },
                { id: "10", firstName: "Emily", lastName: "Davis" }
              ],
              schedule: [
                { id: "1", day: "Monday", startTime: "08:00", endTime: "09:30", subject: "Mathematics", room: "105" },
                { id: "2", day: "Wednesday", startTime: "08:00", endTime: "09:30", subject: "Mathematics", room: "105" },
                { id: "3", day: "Friday", startTime: "08:00", endTime: "09:30", subject: "Mathematics", room: "105" }
              ]
            },
            {
              id: "2",
              name: "10B",
              grade: "10",
              section: "B",
              teacher: {
                id: "1",
                user: {
                  name: "Ms. Johnson"
                },
                department: "Mathematics"
              },
              students: [
                { id: "3", firstName: "David", lastName: "Wilson" },
                { id: "4", firstName: "Emily", lastName: "Johnson" },
                { id: "6", firstName: "Robert", lastName: "Brown" },
                { id: "9", firstName: "Sophia", lastName: "Martinez" }
              ],
              schedule: [
                { id: "4", day: "Monday", startTime: "13:00", endTime: "14:30", subject: "Mathematics", room: "105" },
                { id: "5", day: "Wednesday", startTime: "13:00", endTime: "14:30", subject: "Mathematics", room: "105" },
                { id: "6", day: "Friday", startTime: "13:00", endTime: "14:30", subject: "Mathematics", room: "105" }
              ]
            },
            {
              id: "3",
              name: "9A",
              grade: "9",
              section: "A",
              teacher: {
                id: "1",
                user: {
                  name: "Ms. Johnson"
                },
                department: "Mathematics"
              },
              students: [
                { id: "11", firstName: "Oliver", lastName: "Taylor" },
                { id: "12", firstName: "Sophie", lastName: "Anderson" },
                { id: "13", firstName: "Jacob", lastName: "Thomas" },
                { id: "14", firstName: "Emma", lastName: "Jackson" }
              ],
              schedule: [
                { id: "7", day: "Tuesday", startTime: "08:00", endTime: "09:30", subject: "Mathematics", room: "203" },
                { id: "8", day: "Thursday", startTime: "08:00", endTime: "09:30", subject: "Mathematics", room: "203" }
              ]
            }
          ]
          setClasses(mockClasses)
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching classes:", error)
        toast({
          title: "Error",
          description: "Failed to load classes data. Please try again.",
          variant: "destructive"
        })
        setIsLoading(false)
      }
    }

    fetchClasses()
  }, [toast])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Classes</h1>
        <p className="text-muted-foreground">
          Manage and view the classes you teach
        </p>
      </div>

      <div className="grid gap-6">
        {isLoading ? (
          // Loading skeleton
          <>
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <div>
                      <div className="h-6 w-20 bg-muted rounded mb-2"></div>
                      <div className="h-4 w-40 bg-muted rounded"></div>
                    </div>
                    <div className="h-8 w-20 bg-muted rounded"></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map((j) => (
                        <div key={j} className="h-20 bg-muted rounded"></div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        ) : classes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <p className="text-muted-foreground mb-4">You are not assigned to any classes yet.</p>
              <Button onClick={() => router.refresh()}>Refresh</Button>
            </CardContent>
          </Card>
        ) : (
          classes.map((cls) => (
            <Card key={cls.id}>
              <CardHeader className="pb-2">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <CardTitle className="text-2xl">Class {cls.name}</CardTitle>
                    <CardDescription>
                      Grade {cls.grade}, Section {cls.section} • {cls.students.length} Students
                    </CardDescription>
                  </div>
                  <Button onClick={() => router.push(`/dashboard/teacher/classes/${cls.id}`)}>
                    View Class Details
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview">
                  <TabsList className="mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="schedule">Schedule</TabsTrigger>
                    <TabsTrigger value="students">Students</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card className="bg-blue-50">
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                          <Users className="h-8 w-8 text-blue-500 mb-2" />
                          <p className="text-2xl font-bold text-blue-700">{cls.students.length}</p>
                          <p className="text-sm text-blue-600">Students</p>
                        </CardContent>
                      </Card>

                      <Card className="bg-green-50">
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                          <Clock className="h-8 w-8 text-green-500 mb-2" />
                          <p className="text-2xl font-bold text-green-700">{cls.schedule.length}</p>
                          <p className="text-sm text-green-600">Classes per Week</p>
                        </CardContent>
                      </Card>

                      <Card className="bg-purple-50">
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                          <UserCheck className="h-8 w-8 text-purple-500 mb-2" />
                          <p className="text-2xl font-bold text-purple-700">92%</p>
                          <p className="text-sm text-purple-600">Attendance Rate</p>
                        </CardContent>
                      </Card>

                      <Card className="bg-orange-50">
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                          <BookOpen className="h-8 w-8 text-orange-500 mb-2" />
                          <p className="text-2xl font-bold text-orange-700">85%</p>
                          <p className="text-sm text-orange-600">Average Grade</p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="flex justify-between flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/teacher/attendance/mark?classId=${cls.id}`)}>
                        Mark Attendance
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/teacher/grades/new?classId=${cls.id}`)}>
                        Add Grades
                      </Button>
                      <Button variant="outline" size="sm">
                        Email Class
                      </Button>
                      <Button variant="outline" size="sm">
                        Print Class List
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="schedule">
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-muted">
                            <th className="p-2 text-left font-medium">Day</th>
                            <th className="p-2 text-left font-medium">Time</th>
                            <th className="p-2 text-left font-medium">Subject</th>
                            <th className="p-2 text-left font-medium">Room</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cls.schedule.map((session: any) => (
                            <tr key={session.id} className="border-t">
                              <td className="p-2">{session.day}</td>
                              <td className="p-2">{session.startTime} - {session.endTime}</td>
                              <td className="p-2">{session.subject}</td>
                              <td className="p-2">{session.room}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>

                  <TabsContent value="students">
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-muted">
                            <th className="p-2 text-left font-medium">ID</th>
                            <th className="p-2 text-left font-medium">Name</th>
                            <th className="p-2 text-left font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cls.students.map((student: any) => (
                            <tr key={student.id} className="border-t">
                              <td className="p-2">{student.id}</td>
                              <td className="p-2">{student.firstName} {student.lastName}</td>
                              <td className="p-2">
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/teacher/students/${student.id}`)}>
                                    View Profile
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/teacher/grades/new?studentId=${student.id}`)}>
                                    Add Grades
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
