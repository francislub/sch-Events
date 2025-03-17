"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Plus, Search, Users, BookOpen, ClipboardList } from 'lucide-react'
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default function AdminClasses() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [filter, setFilter] = useState({
    grade: "all", // Changed from empty string to "all"
    teacher: "all", // Changed from empty string to "all"
    search: ""
  })
  
  const [classes, setClasses] = useState<any[]>([])
  const [teachers, setTeachers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Fetch classes and teachers data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, this would be a fetch call to your API
        // const classesResponse = await fetch('/api/classes')
        // const classesData = await classesResponse.json()
        // setClasses(classesData)
        
        // const teachersResponse = await fetch('/api/teachers')
        // const teachersData = await teachersResponse.json()
        // setTeachers(teachersData)

        // Mock data for demonstration
        setTimeout(() => {
          const mockTeachers = [
            { id: "T101", user: { name: "Ms. Johnson" }, department: "Mathematics" },
            { id: "T102", user: { name: "Mr. Smith" }, department: "Science" },
            { id: "T103", user: { name: "Mrs. Davis" }, department: "English" },
            { id: "T104", user: { name: "Mr. Wilson" }, department: "History" },
            { id: "T105", user: { name: "Ms. Brown" }, department: "Mathematics" }
          ]
          
          const mockClasses = [
            {
              id: "C101",
              name: "10A",
              grade: "10",
              section: "A",
              teacher: mockTeachers[0],
              students: Array.from({ length: 32 }),
              subjects: ["Mathematics", "Science", "English", "History", "Geography"]
            },
            {
              id: "C102",
              name: "10B",
              grade: "10",
              section: "B",
              teacher: mockTeachers[1],
              students: Array.from({ length: 30 }),
              subjects: ["Mathematics", "Science", "English", "History", "Geography"]
            },
            {
              id: "C103",
              name: "9A",
              grade: "9",
              section: "A",
              teacher: mockTeachers[2],
              students: Array.from({ length: 28 }),
              subjects: ["Mathematics", "Science", "English", "History", "Geography"]
            },
            {
              id: "C104",
              name: "9B",
              grade: "9",
              section: "B",
              teacher: mockTeachers[3],
              students: Array.from({ length: 27 }),
              subjects: ["Mathematics", "Science", "English", "History", "Geography"]
            },
            {
              id: "C105",
              name: "11A",
              grade: "11",
              section: "A",
              teacher: mockTeachers[4],
              students: Array.from({ length: 25 }),
              subjects: ["Mathematics", "Physics", "Chemistry", "Biology", "English", "History"]
            },
            {
              id: "C106",
              name: "11B",
              grade: "11",
              section: "B",
              teacher: mockTeachers[0],
              students: Array.from({ length: 26 }),
              subjects: ["Mathematics", "Physics", "Chemistry", "Biology", "English", "History"]
            },
            {
              id: "C107",
              name: "8A",
              grade: "8",
              section: "A",
              teacher: mockTeachers[1],
              students: Array.from({ length: 35 }),
              subjects: ["Mathematics", "Science", "English", "History", "Geography"]
            },
            {
              id: "C108",
              name: "8B",
              grade: "8",
              section: "B",
              teacher: mockTeachers[2],
              students: Array.from({ length: 33 }),
              subjects: ["Mathematics", "Science", "English", "History", "Geography"]
            }
          ]
          
          setTeachers(mockTeachers)
          setClasses(mockClasses)
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load classes data. Please try again.",
          variant: "destructive"
        })
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])
  
  // Filter classes
  const filteredClasses = classes.filter(cls => {
    const matchesGrade = filter.grade === "all" || cls.grade === filter.grade
    const matchesTeacher = filter.teacher === "all" || cls.teacher.id === filter.teacher
    const matchesSearch = !filter.search || 
      cls.name.toLowerCase().includes(filter.search.toLowerCase()) ||
      cls.grade.toLowerCase().includes(filter.search.toLowerCase()) ||
      cls.section.toLowerCase().includes(filter.search.toLowerCase())
    
    return matchesGrade && matchesTeacher && matchesSearch
  })
  
  // Handle filter change
  const handleFilterChange = (name: string, value: string) => {
    setFilter(prev => ({ ...prev, [name]: value }))
  }
  
  // Get unique grades for filter
  const grades = [...new Set(classes.map(cls => cls.grade))].sort()
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Class Management</h1>
          <p className="text-muted-foreground">
            View and manage all classes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/admin/classes/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Class
            </Button>
          </Link>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Classes</CardTitle>
          <CardDescription>Browse and search for classes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search classes..."
                  className="pl-8"
                  value={filter.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
              </div>
              
              <Select
                value={filter.grade}
                onValueChange={(value) => handleFilterChange("grade", value)}
              >
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="All Grades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  {grades.map(grade => (
                    <SelectItem key={grade} value={grade}>
                      Grade {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={filter.teacher}
                onValueChange={(value) => handleFilterChange("teacher", value)}
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="All Teachers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teachers</SelectItem>
                  {teachers.map(teacher => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="pb-2">
                      <div className="h-5 w-16 bg-muted rounded mb-2"></div>
                      <div className="h-4 w-32 bg-muted rounded"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="h-4 w-full bg-muted rounded"></div>
                        <div className="h-4 w-3/4 bg-muted rounded"></div>
                        <div className="flex justify-between">
                          <div className="h-8 w-20 bg-muted rounded"></div>
                          <div className="h-8 w-20 bg-muted rounded"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredClasses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No classes found matching the selected filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredClasses.map((cls) => (
                  <Card key={cls.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>Class {cls.name}</CardTitle>
                          <CardDescription>
                            Grade {cls.grade}, Section {cls.section}
                          </CardDescription>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                          {cls.students.length} students
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium">Class Teacher</p>
                          <p className="text-sm">
                            {cls.teacher.user.name} - {cls.teacher.department}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium">Subjects</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {cls.subjects.map((subject: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {subject}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex justify-between">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex gap-1"
                            onClick={() => router.push(`/dashboard/admin/classes/${cls.id}/students`)}
                          >
                            <Users className="h-4 w-4" />
                            Students
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex gap-1"
                            onClick={() => router.push(`/dashboard/admin/classes/${cls.id}/schedule`)}
                          >
                            <ClipboardList className="h-4 w-4" />
                            Schedule
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classes.length}</div>
            <p className="text-xs text-muted-foreground">Across all grades</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {classes.reduce((total, cls) => total + cls.students.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Across all classes</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Class Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {classes.length > 0 
                ? Math.round(classes.reduce((total, cls) => total + cls.students.length, 0) / classes.length) 
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">Students per class</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground space-y-1">
              {grades.map(grade => {
                const count = classes.filter(cls => cls.grade === grade).length
                return (
                  <div key={grade} className="flex justify-between items-center">
                    <span>Grade {grade}</span>
                    <span>{count} classes</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
