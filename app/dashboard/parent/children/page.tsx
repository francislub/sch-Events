"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, GraduationCap, MapPin, Phone, Mail, UserIcon } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

export default function ParentChildren() {
  const { toast } = useToast()
  const [children, setChildren] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch children data
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        // In a real implementation, this would be a fetch call to your API
        // const response = await fetch('/api/parent/children')
        // const data = await response.json()
        // setChildren(data)

        // Mock data for demonstration
        setTimeout(() => {
          const mockChildren = [
            {
              id: "1",
              firstName: "Sarah",
              lastName: "Doe",
              grade: "10",
              section: "A",
              dateOfBirth: "2010-05-15",
              gender: "Female",
              enrollmentDate: "2023-01-10",
              class: {
                id: "1",
                name: "10A",
                teacher: {
                  id: "1",
                  user: {
                    name: "Ms. Johnson"
                  },
                  department: "Mathematics"
                }
              },
              attendance: {
                present: 45,
                absent: 2,
                late: 3,
                rate: "90%"
              },
              grades: {
                average: 88.5,
                subjects: [
                  { name: "Mathematics", grade: "A", score: 92 },
                  { name: "Science", grade: "B+", score: 88 },
                  { name: "English", grade: "B", score: 85 },
                  { name: "History", grade: "A-", score: 90 }
                ]
              }
            },
            {
              id: "2",
              firstName: "Michael",
              lastName: "Doe",
              grade: "8",
              section: "B",
              dateOfBirth: "2012-09-22",
              gender: "Male",
              enrollmentDate: "2023-01-10",
              class: {
                id: "3",
                name: "8B",
                teacher: {
                  id: "3",
                  user: {
                    name: "Mrs. Davis"
                  },
                  department: "English"
                }
              },
              attendance: {
                present: 42,
                absent: 5,
                late: 3,
                rate: "84%"
              },
              grades: {
                average: 83.5,
                subjects: [
                  { name: "Mathematics", grade: "B", score: 82 },
                  { name: "Science", grade: "B+", score: 87 },
                  { name: "English", grade: "A-", score: 89 },
                  { name: "Geography", grade: "B", score: 83 }
                ]
              }
            }
          ]
          setChildren(mockChildren)
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching children:", error)
        toast({
          title: "Error",
          description: "Failed to load children data. Please try again.",
          variant: "destructive"
        })
        setIsLoading(false)
      }
    }

    fetchChildren()
  }, [toast])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Children</h1>
        <p className="text-muted-foreground">
          View details about your children enrolled in the school
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="h-16 w-16 rounded-full bg-muted"></div>
                <div className="space-y-2">
                  <div className="h-5 w-36 rounded bg-muted"></div>
                  <div className="h-4 w-24 rounded bg-muted"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-4 w-full rounded bg-muted"></div>
                  <div className="h-4 w-full rounded bg-muted"></div>
                  <div className="h-4 w-3/4 rounded bg-muted"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : children.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground">No children found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {children.map((child) => (
              <Card key={child.id} className="overflow-hidden">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={`/placeholder.svg?height=64&width=64`} alt={`${child.firstName} ${child.lastName}`} />
                    <AvatarFallback>{child.firstName.charAt(0)}{child.lastName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">{child.firstName} {child.lastName}</CardTitle>
                    <CardDescription>
                      Grade {child.grade}{child.section} • Student ID: {child.id}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="overview" className="mt-2">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="academics">Academics</TabsTrigger>
                      <TabsTrigger value="attendance">Attendance</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="pt-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {child.gender}, Born {new Date(child.dateOfBirth).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            Enrolled on {new Date(child.enrollmentDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            Class {child.class.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            Teacher: {child.class.teacher.user.name}
                          </span>
                        </div>
                      </div>
                      
                      <div className="pt-2 flex justify-end">
                        <Button variant="outline" size="sm" className="mr-2">Contact Teacher</Button>
                        <Button size="sm">View Full Profile</Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="academics" className="pt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Current Term Grades</h3>
                          <p className="text-sm text-muted-foreground">Average: {child.grades.average.toFixed(1)}%</p>
                        </div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                          Term 1 - 2025
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        {child.grades.subjects.map((subject: any, index: number) => (
                          <div key={index} className="flex justify-between items-center p-2 rounded-md bg-background hover:bg-muted/50">
                            <span>{subject.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{subject.score}%</span>
                              <Badge className={`${
                                subject.grade.startsWith('A') ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                                subject.grade.startsWith('B') ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' :
                                subject.grade.startsWith('C') ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' :
                                'bg-red-100 text-red-800 hover:bg-red-100'
                              }`}>
                                {subject.grade}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="pt-2 flex justify-end">
                        <Button size="sm">View All Grades</Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="attendance" className="pt-4 space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-green-50 p-3 rounded-md text-center">
                          <h4 className="text-sm font-medium text-green-800">Present</h4>
                          <p className="text-xl font-bold text-green-800">{child.attendance.present}</p>
                        </div>
                        <div className="bg-red-50 p-3 rounded-md text-center">
                          <h4 className="text-sm font-medium text-red-800">Absent</h4>
                          <p className="text-xl font-bold text-red-800">{child.attendance.absent}</p>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded-md text-center">
                          <h4 className="text-sm font-medium text-yellow-800">Late</h4>
                          <p className="text-xl font-bold text-yellow-800">{child.attendance.late}</p>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded-md">
                        <div className="flex justify-between">
                          <h4 className="text-sm font-medium text-blue-800">Attendance Rate</h4>
                          <span className="text-sm font-medium text-blue-800">{child.attendance.rate}</span>
                        </div>
                        <div className="mt-2 h-2 w-full bg-blue-200 rounded-full">
                          <div 
                            className="h-2 bg-blue-600 rounded-full"
                            style={{ width: child.attendance.rate }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="pt-2 flex justify-end">
                        <Button size="sm">View Full Attendance</Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
