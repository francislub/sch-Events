"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Bell, Plus, Download, Search, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { getAttendanceStatistics } from "@/app/actions/attendance-actions"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AdminDashboard() {
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    attendanceRate: 0,
    recentActivities: [],
  })

  // State for students, teachers, and classes tabs
  const [students, setStudents] = useState<any[]>([])
  const [teachers, setTeachers] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])

  // Pagination state
  const [pagination, setPagination] = useState({
    students: { page: 1, limit: 5, total: 0 },
    teachers: { page: 1, limit: 5, total: 0 },
    classes: { page: 1, limit: 5, total: 0 },
  })

  // Filter state
  const [filters, setFilters] = useState({
    students: { search: "", grade: "" },
    teachers: { search: "", department: "" },
    classes: { search: "", grade: "" },
  })

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setIsLoading(true)

    try {
      // Fetch students count
      const studentsResponse = await fetch("/api/students")
      const studentsData = await studentsResponse.json()

      // Fetch teachers count
      const teachersResponse = await fetch("/api/teachers")
      const teachersData = await teachersResponse.json()

      // Fetch classes count
      const classesResponse = await fetch("/api/classes")
      const classesData = await classesResponse.json()

      // Fetch attendance statistics
      const attendanceStats = await getAttendanceStatistics()

      // Mock recent activities (in a real app, you would fetch this from an API)
      const mockActivities = [
        {
          action: "New Student Registered",
          details: "John Smith - Grade 9A",
          time: "Today, 11:23 AM",
        },
        {
          action: "Teacher Added",
          details: "Ms. Rebecca Johnson - Science",
          time: "Yesterday, 3:45 PM",
        },
        {
          action: "Fee Payment Received",
          details: "Sarah Doe - Grade 10A - $500",
          time: "Yesterday, 2:30 PM",
        },
        {
          action: "Class Schedule Updated",
          details: "Grade 11 - New timetable published",
          time: "March 12, 2025",
        },
        {
          action: "System Backup Completed",
          details: "All data backed up successfully",
          time: "March 11, 2025",
        },
      ]

      setDashboardData({
        totalStudents: studentsData.length || 0,
        totalTeachers: teachersData.length || 0,
        totalClasses: classesData.length || 0,
        attendanceRate: attendanceStats.success ? attendanceStats.data.attendanceRate : 0,
        recentActivities: mockActivities,
      })

      // Set initial data for tabs
      setStudents(studentsData.slice(0, 5))
      setTeachers(teachersData.slice(0, 5))
      setClasses(classesData.slice(0, 5))

      // Set pagination totals
      setPagination({
        students: { ...pagination.students, total: studentsData.length },
        teachers: { ...pagination.teachers, total: teachersData.length },
        classes: { ...pagination.classes, total: classesData.length },
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Fetch students with pagination and filters
  const fetchStudents = async () => {
    try {
      const params = new URLSearchParams()
      params.append("page", pagination.students.page.toString())
      params.append("limit", pagination.students.limit.toString())

      if (filters.students.search) {
        params.append("search", filters.students.search)
      }

      if (filters.students.grade) {
        params.append("grade", filters.students.grade)
      }

      const response = await fetch(`/api/students?${params.toString()}`)

      if (!response.ok) {
        throw new Error("Failed to fetch students")
      }

      const data = await response.json()

      setStudents(data.students || [])
      setPagination((prev) => ({
        ...prev,
        students: {
          ...prev.students,
          total: data.pagination?.total || 0,
        },
      }))
    } catch (error) {
      console.error("Error fetching students:", error)
      toast({
        title: "Error",
        description: "Failed to fetch students. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Fetch teachers with pagination and filters
  const fetchTeachers = async () => {
    try {
      const params = new URLSearchParams()
      params.append("page", pagination.teachers.page.toString())
      params.append("limit", pagination.teachers.limit.toString())

      if (filters.teachers.search) {
        params.append("search", filters.teachers.search)
      }

      if (filters.teachers.department) {
        params.append("department", filters.teachers.department)
      }

      const response = await fetch(`/api/teachers?${params.toString()}`)

      if (!response.ok) {
        throw new Error("Failed to fetch teachers")
      }

      const data = await response.json()

      setTeachers(data.teachers || [])
      setPagination((prev) => ({
        ...prev,
        teachers: {
          ...prev.teachers,
          total: data.pagination?.total || 0,
        },
      }))
    } catch (error) {
      console.error("Error fetching teachers:", error)
      toast({
        title: "Error",
        description: "Failed to fetch teachers. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Fetch classes with pagination and filters
  const fetchClasses = async () => {
    try {
      const params = new URLSearchParams()
      params.append("page", pagination.classes.page.toString())
      params.append("limit", pagination.classes.limit.toString())

      if (filters.classes.search) {
        params.append("search", filters.classes.search)
      }

      if (filters.classes.grade) {
        params.append("grade", filters.classes.grade)
      }

      const response = await fetch(`/api/classes?${params.toString()}`)

      if (!response.ok) {
        throw new Error("Failed to fetch classes")
      }

      const data = await response.json()

      setClasses(data.classes || [])
      setPagination((prev) => ({
        ...prev,
        classes: {
          ...prev.classes,
          total: data.pagination?.total || 0,
        },
      }))
    } catch (error) {
      console.error("Error fetching classes:", error)
      toast({
        title: "Error",
        description: "Failed to fetch classes. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle filter changes
  const handleFilterChange = (tab: string, field: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [tab]: {
        ...prev[tab as keyof typeof prev],
        [field]: value,
      },
    }))

    // Reset to first page when filters change
    setPagination((prev) => ({
      ...prev,
      [tab]: {
        ...prev[tab as keyof typeof prev],
        page: 1,
      },
    }))
  }

  // Handle page change
  const handlePageChange = (tab: string, newPage: number) => {
    const maxPage = Math.ceil(
      pagination[tab as keyof typeof pagination].total / pagination[tab as keyof typeof pagination].limit,
    )

    if (newPage > 0 && newPage <= maxPage) {
      setPagination((prev) => ({
        ...prev,
        [tab]: {
          ...prev[tab as keyof typeof prev],
          page: newPage,
        },
      }))
    }
  }

  // Effect to fetch data when pagination or filters change
  useEffect(() => {
    fetchStudents()
  }, [pagination.students.page, filters.students])

  useEffect(() => {
    fetchTeachers()
  }, [pagination.teachers.page, filters.teachers])

  useEffect(() => {
    fetchClasses()
  }, [pagination.classes.page, filters.classes])

  // Handle export reports
  const handleExportReports = () => {
    toast({
      title: "Export Started",
      description: "Reports are being generated and will be available for download shortly.",
    })

    // In a real app, you would implement the export functionality
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Administrator Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, Admin. Here's an overview of Wobulenzi High School.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/admin/students/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Student
            </Button>
          </Link>
          <Button variant="outline" onClick={handleExportReports}>
            <Download className="mr-2 h-4 w-4" />
            Export Reports
          </Button>
        </div>
      </div>

      <Alert>
        <Bell className="h-4 w-4" />
        <AlertTitle>Important Notice</AlertTitle>
        <AlertDescription>
          Board meeting scheduled for March 20th, 2025 at 2:00 PM. Please prepare the quarterly reports.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? "Loading..." : dashboardData.totalStudents}</div>
                <p className="text-xs text-muted-foreground">
                  {isLoading ? "" : `+${Math.floor(dashboardData.totalStudents * 0.12)} from last year`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? "Loading..." : dashboardData.totalTeachers}</div>
                <p className="text-xs text-muted-foreground">{isLoading ? "" : "+3 new this term"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Classes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? "Loading..." : dashboardData.totalClasses}</div>
                <p className="text-xs text-muted-foreground">Across all grades</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "Loading..." : `${dashboardData.attendanceRate}%`}
                </div>
                <p className="text-xs text-muted-foreground">+1.2% from last term</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-full lg:col-span-4">
              <CardHeader>
                <CardTitle>Enrollment Trends</CardTitle>
                <CardDescription>Student enrollment over the past year</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-muted rounded-md">
                  <p className="text-muted-foreground">Enrollment chart would be displayed here</p>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-full lg:col-span-3">
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Latest system activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading
                    ? Array(5)
                        .fill(0)
                        .map((_, index) => (
                          <div key={index} className="border-b pb-3 last:border-0 last:pb-0">
                            <div className="flex justify-between">
                              <div className="h-5 w-32 bg-muted rounded"></div>
                              <div className="h-4 w-24 bg-muted rounded"></div>
                            </div>
                            <div className="h-4 w-48 bg-muted rounded mt-1"></div>
                          </div>
                        ))
                    : dashboardData.recentActivities.map((activity: any, index) => (
                        <div key={index} className="border-b pb-3 last:border-0 last:pb-0">
                          <div className="flex justify-between">
                            <h3 className="font-medium">{activity.action}</h3>
                            <span className="text-xs text-muted-foreground">{activity.time}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{activity.details}</p>
                        </div>
                      ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Management</CardTitle>
              <CardDescription>View and manage all students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search students..."
                      className="pl-10"
                      value={filters.students.search}
                      onChange={(e) => handleFilterChange("students", "search", e.target.value)}
                    />
                  </div>

                  <Select
                    value={filters.students.grade}
                    onValueChange={(value) => handleFilterChange("students", "grade", value)}
                  >
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="All Grades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Grades</SelectItem>
                      {["7", "8", "9", "10", "11", "12"].map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          Grade {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex-grow md:flex-grow-0"></div>

                  <Link href="/dashboard/admin/students/new">
                    <Button>Add New Student</Button>
                  </Link>
                </div>

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
                      {isLoading ? (
                        Array(5)
                          .fill(0)
                          .map((_, index) => (
                            <tr key={index} className="border-t">
                              <td className="p-2">
                                <div className="h-4 w-16 bg-muted rounded"></div>
                              </td>
                              <td className="p-2">
                                <div className="h-4 w-32 bg-muted rounded"></div>
                              </td>
                              <td className="p-2">
                                <div className="h-4 w-16 bg-muted rounded"></div>
                              </td>
                              <td className="p-2">
                                <div className="h-4 w-24 bg-muted rounded"></div>
                              </td>
                              <td className="p-2">
                                <div className="h-4 w-28 bg-muted rounded"></div>
                              </td>
                              <td className="p-2">
                                <div className="h-8 w-20 bg-muted rounded"></div>
                              </td>
                            </tr>
                          ))
                      ) : students.length === 0 ? (
                        <tr className="border-t">
                          <td colSpan={6} className="p-4 text-center text-muted-foreground">
                            No students found
                          </td>
                        </tr>
                      ) : (
                        students.map((student) => (
                          <tr key={student.id} className="border-t">
                            <td className="p-2">{student.id.substring(0, 8)}</td>
                            <td className="p-2">{`${student.firstName} ${student.lastName}`}</td>
                            <td className="p-2">
                              {student.grade}
                              {student.section}
                            </td>
                            <td className="p-2">{student.parent?.user?.name || "N/A"}</td>
                            <td className="p-2">{student.parent?.phone || "N/A"}</td>
                            <td className="p-2">
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => (window.location.href = `/dashboard/admin/students/${student.id}`)}
                                >
                                  View
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    (window.location.href = `/dashboard/admin/students/edit/${student.id}`)
                                  }
                                >
                                  Edit
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    Showing {students.length} of {pagination.students.total} students
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange("students", pagination.students.page - 1)}
                      disabled={pagination.students.page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1">
                      <span className="text-sm">Page</span>
                      <Input
                        className="w-12 h-8"
                        value={pagination.students.page}
                        onChange={(e) => {
                          const page = Number.parseInt(e.target.value)
                          if (!isNaN(page)) {
                            handlePageChange("students", page)
                          }
                        }}
                      />
                      <span className="text-sm">
                        of {Math.ceil(pagination.students.total / pagination.students.limit)}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange("students", pagination.students.page + 1)}
                      disabled={
                        pagination.students.page === Math.ceil(pagination.students.total / pagination.students.limit)
                      }
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teachers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Teacher Management</CardTitle>
              <CardDescription>View and manage all teachers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search teachers..."
                      className="pl-10"
                      value={filters.teachers.search}
                      onChange={(e) => handleFilterChange("teachers", "search", e.target.value)}
                    />
                  </div>

                  <Select
                    value={filters.teachers.department}
                    onValueChange={(value) => handleFilterChange("teachers", "department", value)}
                  >
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {["Mathematics", "Science", "English", "History", "Arts"].map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex-grow md:flex-grow-0"></div>

                  <Link href="/dashboard/admin/teachers/new">
                    <Button>Add New Teacher</Button>
                  </Link>
                </div>

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
                      {isLoading ? (
                        Array(5)
                          .fill(0)
                          .map((_, index) => (
                            <tr key={index} className="border-t">
                              <td className="p-2">
                                <div className="h-4 w-16 bg-muted rounded"></div>
                              </td>
                              <td className="p-2">
                                <div className="h-4 w-32 bg-muted rounded"></div>
                              </td>
                              <td className="p-2">
                                <div className="h-4 w-24 bg-muted rounded"></div>
                              </td>
                              <td className="p-2">
                                <div className="h-4 w-16 bg-muted rounded"></div>
                              </td>
                              <td className="p-2">
                                <div className="h-4 w-28 bg-muted rounded"></div>
                              </td>
                              <td className="p-2">
                                <div className="h-8 w-20 bg-muted rounded"></div>
                              </td>
                            </tr>
                          ))
                      ) : teachers.length === 0 ? (
                        <tr className="border-t">
                          <td colSpan={6} className="p-4 text-center text-muted-foreground">
                            No teachers found
                          </td>
                        </tr>
                      ) : (
                        teachers.map((teacher) => (
                          <tr key={teacher.id} className="border-t">
                            <td className="p-2">{teacher.id.substring(0, 8)}</td>
                            <td className="p-2">{teacher.user?.name || "N/A"}</td>
                            <td className="p-2">{teacher.department || "N/A"}</td>
                            <td className="p-2">{teacher.classes?.length || 0}</td>
                            <td className="p-2">{teacher.phone || teacher.user?.phone || "N/A"}</td>
                            <td className="p-2">
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => (window.location.href = `/dashboard/admin/teachers/${teacher.id}`)}
                                >
                                  View
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    (window.location.href = `/dashboard/admin/teachers/edit/${teacher.id}`)
                                  }
                                >
                                  Edit
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    Showing {teachers.length} of {pagination.teachers.total} teachers
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange("teachers", pagination.teachers.page - 1)}
                      disabled={pagination.teachers.page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1">
                      <span className="text-sm">Page</span>
                      <Input
                        className="w-12 h-8"
                        value={pagination.teachers.page}
                        onChange={(e) => {
                          const page = Number.parseInt(e.target.value)
                          if (!isNaN(page)) {
                            handlePageChange("teachers", page)
                          }
                        }}
                      />
                      <span className="text-sm">
                        of {Math.ceil(pagination.teachers.total / pagination.teachers.limit)}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange("teachers", pagination.teachers.page + 1)}
                      disabled={
                        pagination.teachers.page === Math.ceil(pagination.teachers.total / pagination.teachers.limit)
                      }
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Class Management</CardTitle>
              <CardDescription>View and manage all classes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search classes..."
                      className="pl-10"
                      value={filters.classes.search}
                      onChange={(e) => handleFilterChange("classes", "search", e.target.value)}
                    />
                  </div>

                  <Select
                    value={filters.classes.grade}
                    onValueChange={(value) => handleFilterChange("classes", "grade", value)}
                  >
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="All Grades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Grades</SelectItem>
                      {["7", "8", "9", "10", "11", "12"].map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          Grade {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex-grow md:flex-grow-0"></div>

                  <Link href="/dashboard/admin/classes/new">
                    <Button>Add New Class</Button>
                  </Link>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted">
                        <th className="p-2 text-left font-medium">Class ID</th>
                        <th className="p-2 text-left font-medium">Class Name</th>
                        <th className="p-2 text-left font-medium">Grade</th>
                        <th className="p-2 text-left font-medium">Class Teacher</th>
                        <th className="p-2 text-left font-medium">Students</th>
                        <th className="p-2 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        Array(5)
                          .fill(0)
                          .map((_, index) => (
                            <tr key={index} className="border-t">
                              <td className="p-2">
                                <div className="h-4 w-16 bg-muted rounded"></div>
                              </td>
                              <td className="p-2">
                                <div className="h-4 w-24 bg-muted rounded"></div>
                              </td>
                              <td className="p-2">
                                <div className="h-4 w-16 bg-muted rounded"></div>
                              </td>
                              <td className="p-2">
                                <div className="h-4 w-32 bg-muted rounded"></div>
                              </td>
                              <td className="p-2">
                                <div className="h-4 w-16 bg-muted rounded"></div>
                              </td>
                              <td className="p-2">
                                <div className="h-8 w-20 bg-muted rounded"></div>
                              </td>
                            </tr>
                          ))
                      ) : classes.length === 0 ? (
                        <tr className="border-t">
                          <td colSpan={6} className="p-4 text-center text-muted-foreground">
                            No classes found
                          </td>
                        </tr>
                      ) : (
                        classes.map((cls) => (
                          <tr key={cls.id} className="border-t">
                            <td className="p-2">{cls.id.substring(0, 8)}</td>
                            <td className="p-2">{cls.name}</td>
                            <td className="p-2">{cls.grade}</td>
                            <td className="p-2">{cls.teacher?.user?.name || "Not assigned"}</td>
                            <td className="p-2">{cls.students?.length || 0}</td>
                            <td className="p-2">
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => (window.location.href = `/dashboard/admin/classes/${cls.id}`)}
                                >
                                  View
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => (window.location.href = `/dashboard/admin/classes/edit/${cls.id}`)}
                                >
                                  Edit
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    Showing {classes.length} of {pagination.classes.total} classes
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange("classes", pagination.classes.page - 1)}
                      disabled={pagination.classes.page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1">
                      <span className="text-sm">Page</span>
                      <Input
                        className="w-12 h-8"
                        value={pagination.classes.page}
                        onChange={(e) => {
                          const page = Number.parseInt(e.target.value)
                          if (!isNaN(page)) {
                            handlePageChange("classes", page)
                          }
                        }}
                      />
                      <span className="text-sm">
                        of {Math.ceil(pagination.classes.total / pagination.classes.limit)}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange("classes", pagination.classes.page + 1)}
                      disabled={
                        pagination.classes.page === Math.ceil(pagination.classes.total / pagination.classes.limit)
                      }
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

