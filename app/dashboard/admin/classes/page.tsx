"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Plus, Download, Search, MoreHorizontal, FileText, Trash2, Edit, Users } from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { deleteClass, getClasses } from "@/app/actions/class-actions"
import { getTeachers } from "@/app/actions/teacher-actions"

export default function AdminClasses() {
  const router = useRouter()
  const { toast } = useToast()

  const [filter, setFilter] = useState({
    grade: "all",
    teacherId: "all",
    search: "",
  })

  const [classes, setClasses] = useState<any[]>([])
  const [teachers, setTeachers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch classes and teachers data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [classesResult, teachersData] = await Promise.all([getClasses(), getTeachers()])

        if (classesResult.success) {
          setClasses(classesResult.data || [])
        } else {
          toast({
            title: "Error",
            description: "Failed to load classes data. Please try again.",
            variant: "destructive",
          })
        }

        setTeachers(teachersData || [])
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

  // Filter classes
  const filteredClasses = classes.filter((cls) => {
    const matchesGrade = filter.grade === "all" || cls.grade === filter.grade
    const matchesTeacher = filter.teacherId === "all" || cls.teacherId === filter.teacherId
    const matchesSearch =
      !filter.search ||
      cls.name.toLowerCase().includes(filter.search.toLowerCase()) ||
      cls.section.toLowerCase().includes(filter.search.toLowerCase())

    return matchesGrade && matchesTeacher && matchesSearch
  })

  // Handle filter change
  const handleFilterChange = (name: string, value: string) => {
    setFilter((prev) => ({ ...prev, [name]: value }))
  }

  const handleViewClass = (id: string) => {
    router.push(`/dashboard/admin/classes/${id}`)
  }

  const handleEditClass = (id: string) => {
    router.push(`/dashboard/admin/classes/${id}/edit`)
  }

  const handleDeleteClass = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this class? This action cannot be undone.")) {
      try {
        const result = await deleteClass(id)

        if (result.success) {
          toast({
            title: "Class Deleted",
            description: "Class has been deleted successfully.",
          })

          // Update the classes list
          setClasses((prev) => prev.filter((cls) => cls.id !== id))
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

  const handleExport = () => {
    // Generate CSV data
    const headers = ["ID", "Name", "Grade", "Section", "Teacher", "Students"]
    const csvData = [
      headers.join(","),
      ...filteredClasses.map((cls) =>
        [cls.id, cls.name, cls.grade, cls.section, cls.teacher?.user?.name || "N/A", cls.students?.length || 0].join(
          ",",
        ),
      ),
    ].join("\n")

    // Create a blob and download
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "classes.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Export Complete",
      description: "Classes data has been exported to CSV.",
    })
  }

  // Get unique grades for filter
  const grades = [...new Set(classes.map((cls) => cls.grade))].sort()

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Class Management</h1>
          <p className="text-muted-foreground">View and manage all classes</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/admin/classes/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Class
            </Button>
          </Link>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
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
                  placeholder="Search classes by name or section..."
                  className="pl-8"
                  value={filter.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
              </div>

              <Select value={filter.grade} onValueChange={(value) => handleFilterChange("grade", value)}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="All Grades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  {grades.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      Grade {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filter.teacherId} onValueChange={(value) => handleFilterChange("teacherId", value)}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="All Teachers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teachers</SelectItem>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center border-b pb-4">
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-muted rounded w-1/3"></div>
                      <div className="h-3 bg-muted rounded w-1/4"></div>
                    </div>
                    <div className="space-x-2">
                      <div className="h-8 w-16 bg-muted rounded inline-block"></div>
                      <div className="h-8 w-16 bg-muted rounded inline-block"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredClasses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No classes found matching the selected filters.
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted">
                      <th className="p-2 text-left font-medium">Name</th>
                      <th className="p-2 text-left font-medium">Grade</th>
                      <th className="p-2 text-left font-medium">Section</th>
                      <th className="p-2 text-left font-medium">Teacher</th>
                      <th className="p-2 text-left font-medium">Students</th>
                      <th className="p-2 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClasses.map((cls) => (
                      <tr key={cls.id} className="border-t">
                        <td className="p-2 font-medium">{cls.name}</td>
                        <td className="p-2">Grade {cls.grade}</td>
                        <td className="p-2">Section {cls.section}</td>
                        <td className="p-2">{cls.teacher?.user?.name || "Not assigned"}</td>
                        <td className="p-2">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                            {cls.students?.length || 0} students
                          </Badge>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleViewClass(cls.id)}>
                              View
                            </Button>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleViewClass(cls.id)}>
                                  <FileText className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditClass(cls.id)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Class
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => router.push(`/dashboard/admin/classes/${cls.id}/students`)}
                                >
                                  <Users className="mr-2 h-4 w-4" />
                                  View Students
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteClass(cls.id)}>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Class
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <CardTitle className="text-sm font-medium">Average Class Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {classes.length > 0
                ? Math.round(classes.reduce((total, cls) => total + (cls.students?.length || 0), 0) / classes.length)
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
              {grades.map((grade) => {
                const count = classes.filter((cls) => cls.grade === grade).length
                const percentage = Math.round((count / classes.length) * 100) || 0
                return (
                  <div key={grade} className="flex justify-between items-center">
                    <span>Grade {grade}</span>
                    <span>{percentage}%</span>
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

