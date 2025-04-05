"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Search, Eye, Users, BookOpen } from "lucide-react"

export default function TeacherClasses() {
  const router = useRouter()
  const { toast } = useToast()

  const [classes, setClasses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch classes taught by the teacher
  useEffect(() => {
    const fetchClasses = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/classes/teacher")
        if (!response.ok) throw new Error("Failed to fetch classes")
        const data = await response.json()
        setClasses(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Error fetching classes:", error)
        toast({
          title: "Error",
          description: "Failed to load classes. Please try again.",
          variant: "destructive",
        })
        setClasses([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchClasses()
  }, [toast])

  // Filter classes based on search query
  const filteredClasses = classes.filter((cls) => {
    const className = cls.name.toLowerCase()
    const query = searchQuery.toLowerCase()

    return className.includes(query)
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Classes</h1>
          <p className="text-muted-foreground">View and manage your assigned classes</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Classes</CardTitle>
          <CardDescription>Classes you are teaching</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search classes..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {isLoading ? (
              <div className="text-center py-8">Loading classes...</div>
            ) : filteredClasses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No classes found matching your search.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredClasses.map((cls) => (
                  <Card key={cls.id} className="overflow-hidden">
                    <CardHeader className="bg-muted/50 pb-2">
                      <CardTitle>{cls.name}</CardTitle>
                      <CardDescription>{cls.section || "No section"}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{cls.studentCount || 0} Students</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{cls.subjects?.join(", ") || "No subjects assigned"}</span>
                        </div>
                        <div className="flex justify-end mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/dashboard/teacher/classes/${cls.id}`)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

