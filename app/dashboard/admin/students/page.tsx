"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Plus, Download, Search, MoreHorizontal, FileText, Trash2, Edit, Mail, GraduationCap } from "lucide-react"
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
import { getStudents } from "@/app/actions/student-actions"
import { getClasses } from "@/app/actions/class-actions"

export default function AdminStudents() {
  const router = useRouter()
  const { toast } = useToast()

  const [filter, setFilter] = useState({
    classId: "all",
    grade: "all",
    search: "",
  })

  const [students, setStudents] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch students and classes data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [studentsData, classesResult] = await Promise.all([getStudents(), getClasses()])

        setStudents(studentsData || [])

        if (classesResult.success) {
          setClasses(classesResult.data || [])
        }

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

  // Filter students
  const filteredStudents = students.filter((student) => {
    const studentData = student.student
    if (!studentData) return false

    const matchesClass = filter.classId === "all" || studentData.classId === filter.classId
    const matchesGrade = filter.grade === "all" || studentData.class?.grade === filter.grade

    const searchTerm = filter.search.toLowerCase()
    const matchesSearch =
      !searchTerm ||
      student.name.toLowerCase().includes(searchTerm) ||
      studentData.admissionNumber?.toLowerCase().includes(searchTerm) ||
      student.email.toLowerCase().includes(searchTerm)

    return matchesClass && matchesGrade && matchesSearch
  })

  // Handle filter change
  const handleFilterChange = (name: string, value: string) => {
    setFilter((prev) => ({ ...prev, [name]: value }))
  }

  const handleViewStudent = (id: string) => {
    router.push(`/dashboard/admin/students/${id}`)
  }

  const handleEditStudent = (id: string) => {
    router.push(`/dashboard/admin/students/${id}/edit`)
  }

  const handleViewAcademics = (id: string) => {
    router.push(`/dashboard/admin/students/${id}/academics`)
  }

  const handleDeleteStudent = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this student? This action cannot be undone.")) {
      try {
        // In a real app, you would call your API to delete the student
        toast({
          title: "Student Deleted",
          description: "Student has been deleted successfully.",
        })

        // Update the students list
        setStudents((prev) => prev.filter((student) => student.id !== id))
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
    const headers = ["ID", "Name", "Admission Number", "Class", "Grade", "Parent", "Email"]
    const csvData = [
      headers.join(","),
      ...filteredStudents.map((student) =>
        [
          student.id,
          student.name,
          student.student?.admissionNumber || "N/A",
          student.student?.class?.name || "N/A",
          student.student?.class?.grade || "N/A",
          student.student?.parent?.user?.name || "N/A",
          student.email,
        ].join(","),
      ),
    ].join("\n")

    // Create a blob and download
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "students.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Export Complete",
      description: "Students data has been exported to CSV.",
    })
  }

  // Get unique grades for filter
  const grades = [...new Set(classes.map((cls) => cls.grade))].sort()

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
          <p className="text-muted-foreground">View and manage all students</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/admin/students/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Student
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
          <CardTitle>Students</CardTitle>
          <CardDescription>Browse and search for students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students by name, admission number or email..."
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

              <Select value={filter.classId} onValueChange={(value) => handleFilterChange("classId", value)}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
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
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No students found matching the selected filters.
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted">
                      <th className="p-2 text-left font-medium">Name</th>
                      <th className="p-2 text-left font-medium">Admission No.</th>
                      <th className="p-2 text-left font-medium">Class</th>
                      <th className="p-2 text-left font-medium">Parent</th>
                      <th className="p-2 text-left font-medium">Email</th>
                      <th className="p-2 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="border-t">
                        <td className="p-2 font-medium">{student.name}</td>
                        <td className="p-2">{student.student?.admissionNumber || "N/A"}</td>
                        <td className="p-2">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                            {student.student?.class?.name || "N/A"}
                          </Badge>
                        </td>
                        <td className="p-2">{student.student?.parent?.user?.name || "N/A"}</td>
                        <td className="p-2">{student.email}</td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleViewStudent(student.id)}>
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
                                <DropdownMenuItem onClick={() => handleViewStudent(student.id)}>
                                  <FileText className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditStudent(student.id)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Student
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleViewAcademics(student.id)}>
                                  <GraduationCap className="mr-2 h-4 w-4" />
                                  View Academics
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push(`mailto:${student.email}`)}>
                                  <Mail className="mr-2 h-4 w-4" />
                                  Email Student
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDeleteStudent(student.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Student
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
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">Enrolled in the school</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground space-y-1">
              {grades.map((grade) => {
                const count = students.filter((student) => student.student?.class?.grade === grade).length
                const percentage = Math.round((count / students.length) * 100) || 0
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

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Gender Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground space-y-1">
              {["Male", "Female", "Other"].map((gender) => {
                const count = students.filter((student) => student.student?.gender === gender).length
                const percentage = Math.round((count / students.length) * 100) || 0
                return (
                  <div key={gender} className="flex justify-between items-center">
                    <span>{gender}</span>
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

