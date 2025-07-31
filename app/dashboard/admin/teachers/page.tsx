"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { useToast } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Plus, Download, Search, MoreHorizontal, FileText, Trash2, Edit, Mail } from "lucide-react"
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

export default function AdminTeachers() {
  const router = useRouter()
  const { toast } = useToast()

  const [filter, setFilter] = useState({
    department: "all", // Changed from empty string to "all"
    search: "",
  })

  const [teachers, setTeachers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch teachers data
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        // In a real app, this would be a fetch call to your API
        const response = await fetch("/api/teachers")
        const data = await response.json()
        setTeachers(data)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching teachers:", error)
        toast({
          title: "Error",
          description: "Failed to load teachers data. Please try again.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    fetchTeachers()
  }, [toast])

  // Filter teachers
  const filteredTeachers = teachers.filter((teacher) => {
    const matchesDepartment = filter.department === "all" || teacher.department === filter.department // Changed condition
    const matchesSearch =
      !filter.search ||
      teacher.user.name.toLowerCase().includes(filter.search.toLowerCase()) ||
      teacher.department.toLowerCase().includes(filter.search.toLowerCase()) ||
      teacher.id.toLowerCase().includes(filter.search.toLowerCase())

    return matchesDepartment && matchesSearch
  })

  // Handle filter change
  const handleFilterChange = (name: string, value: string) => {
    setFilter((prev) => ({ ...prev, [name]: value }))
  }

  const handleViewTeacher = (id: string) => {
    router.push(`/dashboard/admin/teachers/${id}`)
  }

  const handleEditTeacher = (id: string) => {
    router.push(`/dashboard/admin/teachers/${id}/edit`)
  }

  const handleDeleteTeacher = (id: string) => {
    // In a real app, you would call your API to delete the teacher
    toast({
      title: "Teacher Deleted",
      description: `Teacher ${id} has been deleted successfully.`,
    })

    setTeachers((prev) => prev.filter((teacher) => teacher.id !== id))
  }

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Teacher data is being exported to CSV.",
    })

    // In a real app, you would implement the export functionality
  }

  // Get unique departments for filter
  const departments = [...new Set(teachers.map((teacher) => teacher.department))].sort()

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teacher Management</h1>
          <p className="text-muted-foreground">View and manage all teaching staff</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/admin/teachers/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Teacher
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
          <CardTitle>Teachers</CardTitle>
          <CardDescription>Browse and search for teachers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search teachers by name or department..."
                  className="pl-8"
                  value={filter.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
              </div>

              <Select value={filter.department} onValueChange={(value) => handleFilterChange("department", value)}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem> {/* Changed from empty string to "all" */}
                  {departments.map((department) => (
                    <SelectItem key={department} value={department}>
                      {department}
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
            ) : filteredTeachers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No teachers found matching the selected filters.
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted">
                      <th className="p-2 text-left font-medium">ID</th>
                      <th className="p-2 text-left font-medium">Name</th>
                      <th className="p-2 text-left font-medium">Department</th>
                      <th className="p-2 text-left font-medium">Classes</th>
                      <th className="p-2 text-left font-medium">Contact</th>
                      <th className="p-2 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeachers.map((teacher) => (
                      <tr key={teacher.id} className="border-t">
                        <td className="p-2 font-medium">{teacher.id}</td>
                        <td className="p-2">{teacher.user.name}</td>
                        <td className="p-2">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                            {teacher.department}
                          </Badge>
                        </td>
                        <td className="p-2">{teacher.classes.length}</td>
                        <td className="p-2">{teacher.contactNumber}</td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleViewTeacher(teacher.id)}>
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
                                <DropdownMenuItem onClick={() => handleViewTeacher(teacher.id)}>
                                  <FileText className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditTeacher(teacher.id)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Teacher
                                </DropdownMenuItem>
                                {/* <DropdownMenuItem onClick={() => router.push(`mailto:${teacher.user.email}`)}>
                                  <Mail className="mr-2 h-4 w-4" />
                                  Email Teacher
                                </DropdownMenuItem> */}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDeleteTeacher(teacher.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Teacher
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teachers.length}</div>
            <p className="text-xs text-muted-foreground">Across all departments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">New Hires</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">In the last 3 months</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Teacher-Student Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1:16</div>
            <p className="text-xs text-muted-foreground">Average across school</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Department Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground space-y-1">
              {departments.map((dept) => {
                const count = teachers.filter((t) => t.department === dept).length
                const percentage = Math.round((count / teachers.length) * 100)
                return (
                  <div key={dept} className="flex justify-between items-center">
                    <span>{dept}</span>
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

