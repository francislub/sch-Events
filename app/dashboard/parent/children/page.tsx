"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, Book, Calendar, Clock } from "lucide-react"

interface Child {
  id: string
  firstName: string
  lastName: string
  grade: string
  section: string
  admissionNumber: string
  dateOfBirth: string
  gender: string
  enrollmentDate: string
  class: {
    id: string
    name: string
    teacher: {
      id: string
      user: {
        name: string
      }
    }
  }
}

export default function ParentChildren() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [children, setChildren] = useState<Child[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    async function fetchChildren() {
      try {
        setIsLoading(true)
        const res = await fetch("/api/students?parentId=current")
        if (!res.ok) throw new Error("Failed to fetch children")
        const data = await res.json()
        setChildren(data)
      } catch (error) {
        console.error("Error fetching children:", error)
        toast({
          title: "Error",
          description: "Failed to load your children's data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (status === "authenticated") {
      fetchChildren()
    }
  }, [status, toast])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Children</h1>
          <p className="text-muted-foreground">Loading your children's information...</p>
        </div>
        <div className="grid gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-24 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Children</h1>
        <p className="text-muted-foreground">View information about your children enrolled in the school</p>
      </div>

      {children.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground">No children registered under your account.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {children.map((child) => (
            <Card key={child.id}>
              <CardHeader>
                <CardTitle>
                  {child.firstName} {child.lastName}
                </CardTitle>
                <CardDescription>
                  Grade {child.grade}
                  {child.section} • Admission #{child.admissionNumber}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col items-center justify-center">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage
                        src="/placeholder.svg?height=96&width=96"
                        alt={`${child.firstName} ${child.lastName}`}
                      />
                      <AvatarFallback>
                        {child.firstName[0]}
                        {child.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push(`/dashboard/parent/children/${child.id}`)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Full Profile
                    </Button>
                  </div>

                  <div className="md:col-span-2">
                    <Tabs defaultValue="info">
                      <TabsList className="mb-4">
                        <TabsTrigger value="info">Basic Info</TabsTrigger>
                        <TabsTrigger value="academic">Academic</TabsTrigger>
                      </TabsList>

                      <TabsContent value="info">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Date of Birth</p>
                            <p className="font-medium">{new Date(child.dateOfBirth).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Gender</p>
                            <p className="font-medium">{child.gender}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Enrollment Date</p>
                            <p className="font-medium">{new Date(child.enrollmentDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Class</p>
                            <p className="font-medium">{child.class?.name || "Not assigned"}</p>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="academic">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Button
                            variant="outline"
                            className="flex flex-col items-center justify-center h-24 gap-2"
                            onClick={() => router.push(`/dashboard/parent/academics?child=${child.id}`)}
                          >
                            <Book className="h-6 w-6" />
                            <span>View Grades</span>
                          </Button>

                          <Button
                            variant="outline"
                            className="flex flex-col items-center justify-center h-24 gap-2"
                            onClick={() => router.push(`/dashboard/parent/attendance?child=${child.id}`)}
                          >
                            <Calendar className="h-6 w-6" />
                            <span>View Attendance</span>
                          </Button>

                          <Button
                            variant="outline"
                            className="flex flex-col items-center justify-center h-24 gap-2"
                            onClick={() => router.push(`/dashboard/parent/schedule?child=${child.id}`)}
                          >
                            <Clock className="h-6 w-6" />
                            <span>View Schedule</span>
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

