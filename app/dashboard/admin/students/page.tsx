"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Download, Search, MoreHorizontal, FileText, Trash2, Edit, UserPlus } from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function AdminStudents() {
  const router = useRouter()
  const { toast } = useToast()

  const [filter, setFilter] = useState({
    grade: "",
    section: "",
    search: "",
  })

  const [students, setStudents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const studentsPerPage = 10

  // Fetch students data
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // In a real app, this would be a fetch call to your API
        // const response = await fetch('/api/students')
        // const data = await response.json()
        // setStudents(data)

        // Mock data for demonstration
        setTimeout(() => {
          const mockStudents = Array.from({ length: 25 }).map((_, index) => ({
            id: `S100${index + 1}`,
            firstName: [
              "Sarah",
              "Michael",
              "Emily",
              "David",
              "Jessica",
              "Daniel",
              "Sophia",
              "Matthew",
              "Olivia",
              "Jacob",
            ][index % 10],
            lastName: [
              "Doe",
              "Smith",
              "Johnson",
              "Wilson",
              "Brown",
              "Taylor",
              "Anderson",
              "Thomas",
              "Jackson",
              "White",
            ][index % 10],
            grade: ["7", "8", "9", "10", "11", "12"][Math.floor(index / 5) % 6],
            section: ["A", "B", "C"][index % 3],
            dateOfBirth: "2010-05-15",
            gender: index % 2 === 0 ? "Female" : "Male",
            enrollmentDate: "2023-01-10",
            parent: {
              id: `P100${Math.floor(index / 2) + 1}`,
              user: {
                name: ["John Doe", "Jane Smith", "Robert Johnson", "Mary Wilson", "William Brown"][
                  Math.floor(index / 5) % 5
                ],
              },
              contactNumber: `+1 234-567-${8900 + index}`,
            },
            class: {
              id: `C100${Math.floor(index / 5) + 1}`,
              name: `${["7", "8", "9", "10", "11", "12"][Math.floor(index / 5) % 6]}${["A", "B", "C"][index % 3]}`,
            },
          }))

          setStudents(mockStudents)
          setTotalPages(Math.ceil(mockStudents.length / studentsPerPage))
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching students:", error)
        toast({
          title: "Error",
          description: "Failed to load students data. Please try again.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    fetchStudents()
  }, [toast])

  // Filter and paginate students
  const filteredStudents = students.filter((student) => {
    const matchesGrade = filter.grade === "all" || !filter.grade || student.grade === filter.grade
    const matchesSection = filter.section === "all" || !filter.section || student.section === filter.section
    const matchesSearch =
      !filter.search ||
      student.firstName.toLowerCase().includes(filter.search.toLowerCase()) ||
      student.lastName.toLowerCase().includes(filter.search.toLowerCase()) ||
      student.id.toLowerCase().includes(filter.search.toLowerCase())

    return matchesGrade && matchesSection && matchesSearch
  })

  const paginatedStudents = filteredStudents.slice((currentPage - 1) * studentsPerPage, currentPage * studentsPerPage)

  // Handle filter change
  const handleFilterChange = (name: string, value: string) => {
    setFilter((prev) => ({ ...prev, [name]: value }))
    setCurrentPage(1) // Reset to first page when filter changes
  }

  const handleViewStudent = (id: string) => {
    router.push(`/dashboard/admin/students/${id}`)
  }

  const handleEditStudent = (id: string) => {
    router.push(`/dashboard/admin/students/${id}/edit`)
  }

  const handleDeleteStudent = (id: string) => {
    // In a real app, you would call your API to delete the student
    toast({
      title: "Student Deleted",
      description: `Student ${id} has been deleted successfully.`,
    })

    setStudents((prev) => prev.filter((student) => student.id !== id))
  }

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Student data is being exported to CSV.",
    })

    // In a real app, you would implement the export functionality
  }

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
              <UserPlus className="mr-2 h-4 w-4" />
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
                  placeholder="Search students by name or ID..."
                  className="pl-8"
                  value={filter.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
              </div>

              <Select value={filter.grade} onValueChange={(value) => handleFilterChange("grade", value)}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="All Grades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  <SelectItem value="7">Grade 7</SelectItem>
                  <SelectItem value="8">Grade 8</SelectItem>
                  <SelectItem value="9">Grade 9</SelectItem>
                  <SelectItem value="10">Grade 10</SelectItem>
                  <SelectItem value="11">Grade 11</SelectItem>
                  <SelectItem value="12">Grade 12</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filter.section} onValueChange={(value) => handleFilterChange("section", value)}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="All Sections" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  <SelectItem value="A">Section A</SelectItem>
                  <SelectItem value="B">Section B</SelectItem>
                  <SelectItem value="C">Section C</SelectItem>
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
              <>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted">
                        <th className="p-2 text-left font-medium">ID</th>
                        <th className="p-2 text-left font-medium">Name</th>
                        <th className="p-2 text-left font-medium">Grade</th>
                        <th className="p-2 text-left font-medium">Parent</th>
                        <th className="p-2 text-left font-medium">Contact</th>
                        <th className="p-2 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedStudents.map((student) => (
                        <tr key={student.id} className="border-t">
                          <td className="p-2 font-medium">{student.id}</td>
                          <td className="p-2">
                            {student.firstName} {student.lastName}
                          </td>
                          <td className="p-2">
                            {student.grade}
                            {student.section}
                          </td>
                          <td className="p-2">{student.parent.user.name}</td>
                          <td className="p-2">{student.parent.contactNumber}</td>
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

                <div className="flex justify-between items-center mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {paginatedStudents.length} of {filteredStudents.length} students
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(prev + 1, Math.ceil(filteredStudents.length / studentsPerPage)),
                        )
                      }
                      disabled={currentPage >= Math.ceil(filteredStudents.length / studentsPerPage)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">Across all grades</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">New Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">In the last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Gender Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">52% / 48%</div>
            <p className="text-xs text-muted-foreground">Female / Male students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground">Across all students</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

