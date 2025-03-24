"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Search, ChevronLeft, ChevronRight, CalendarDays, GraduationCap, School, Users } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { getAdminStats } from "@/app/actions/admin-actions"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

interface StatsData {
  studentsCount: number
  teachersCount: number
  classesCount: number
  parentsCount: number
  attendanceRate: number
  recentActivities: {
    action: string
    details: string
    time: string
  }[]
}

export default function AdminDashboard() {
  const { toast } = useToast()

  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
    students: { search: "", grade: "all" },
    teachers: { search: "", department: "all" },
    classes: { search: "", grade: "all" },
  })

  // Fetch dashboard data
  // const fetchDashboardData = async () => {
  //   setIsLoading(true)

  //   try {
  //     // Fetch admin stats
  //     const statsResult = await getAdminStats()

  //     if (statsResult.success) {
  //       setDashboardData({
  //         totalStudents: statsResult.data.studentsCount || 0,
  //         totalTeachers: statsResult.data.teachersCount || 0,
  //         totalClasses: statsResult.data.classesCount || 0,
  //         totalParents: statsResult.data.parentsCount || 0,
  //         attendanceRate: statsResult.data.attendanceRate || 0,
  //         recentActivities: statsResult.data.recentActivities || [],
  //       })
  //     } else {
  //       toast({
  //         title: "Error",
  //         description: statsResult.message || "Failed to fetch dashboard data",
  //         variant: "destructive",
  //       })
  //     }
  //   } catch (error) {
  //     console.error("Error fetching dashboard data:", error)
  //     toast({
  //       title: "Error",
  //       description: "Failed to fetch dashboard data. Please try again.",
  //       variant: "destructive",
  //     })
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

  // Initial data fetch
  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true)
        const response = await getAdminStats()

        if (response.success) {
          setStats(response.data)
        } else {
          setError(response.message || "Failed to fetch dashboard data")
          toast({
            title: "Error",
            description: response.message || "Failed to fetch dashboard data",
            variant: "destructive",
          })
        }
      } catch (err) {
        console.error("Error fetching admin stats:", err)
        setError("An unexpected error occurred")
        toast({
          title: "Error",
          description: "Failed to fetch dashboard data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
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

      if (filters.students.grade !== "all") {
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

      if (filters.teachers.department !== "all") {
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

      if (filters.classes.grade !== "all") {
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
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Administrator Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, Admin. Here's an overview of your school.</p>
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
          <AlertDescription>Remember to update student records and attendance regularly.</AlertDescription>
        </Alert> */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics" disabled>
            Analytics
          </TabsTrigger>
          <TabsTrigger value="reports" disabled>
            Reports
          </TabsTrigger>
          {/* <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger> */}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold">{stats?.studentsCount || 0}</div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold">{stats?.teachersCount || 0}</div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
                <School className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold">{stats?.classesCount || 0}</div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold">{stats?.attendanceRate || 0}%</div>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Latest activities in the school management system</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[250px]" />
                          <Skeleton className="h-4 w-[200px]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center py-4 text-muted-foreground">{error}</div>
                ) : stats?.recentActivities && stats.recentActivities.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentActivities.map((activity, i) => (
                      <div key={i} className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">{activity.action}</p>
                          <p className="text-sm text-muted-foreground">{activity.details}</p>
                        </div>
                        <div className="text-sm text-muted-foreground">{activity.time}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">No recent activities found</div>
                )}
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Summary of school statistics</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-4 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Total Parents</div>
                      <div className="font-bold">{stats?.parentsCount || 0}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Student-Teacher Ratio</div>
                      <div className="font-bold">
                        {stats?.teachersCount
                          ? `${Math.round((stats.studentsCount / stats.teachersCount) * 10) / 10}:1`
                          : "N/A"}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Average Class Size</div>
                      <div className="font-bold">
                        {stats?.classesCount ? Math.round(stats.studentsCount / stats.classesCount) : 0}
                      </div>
                    </div>
                  </div>
                )}
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
                      {loading ? (
                        Array(5)
                          .fill(0)
                          .map((_, index) => (
                            <tr key={index} className="border-t">
                              <td className="p-2">
                                <Skeleton className="h-4 w-16" />
                              </td>
                              <td className="p-2">
                                <Skeleton className="h-4 w-32" />
                              </td>
                              <td className="p-2">
                                <Skeleton className="h-4 w-16" />
                              </td>
                              <td className="p-2">
                                <Skeleton className="h-4 w-24" />
                              </td>
                              <td className="p-2">
                                <Skeleton className="h-4 w-28" />
                              </td>
                              <td className="p-2">
                                <Skeleton className="h-8 w-20" />
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
                            <td className="p-2">{student.parent?.contactNumber || "N/A"}</td>
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
                        of {Math.ceil(pagination.students.total / pagination.students.limit) || 1}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange("students", pagination.students.page + 1)}
                      disabled={
                        pagination.students.page === Math.ceil(pagination.students.total / pagination.students.limit) ||
                        pagination.students.total === 0
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
                      {loading ? (
                        Array(5)
                          .fill(0)
                          .map((_, index) => (
                            <tr key={index} className="border-t">
                              <td className="p-2">
                                <Skeleton className="h-4 w-16" />
                              </td>
                              <td className="p-2">
                                <Skeleton className="h-4 w-32" />
                              </td>
                              <td className="p-2">
                                <Skeleton className="h-4 w-24" />
                              </td>
                              <td className="p-2">
                                <Skeleton className="h-4 w-16" />
                              </td>
                              <td className="p-2">
                                <Skeleton className="h-4 w-28" />
                              </td>
                              <td className="p-2">
                                <Skeleton className="h-8 w-20" />
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
                            <td className="p-2">{teacher.contactNumber || "N/A"}</td>
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
                        of {Math.ceil(pagination.teachers.total / pagination.teachers.limit) || 1}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange("teachers", pagination.teachers.page + 1)}
                      disabled={
                        pagination.teachers.page === Math.ceil(pagination.teachers.total / pagination.teachers.limit) ||
                        pagination.teachers.total === 0
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
                      {loading ? (
                        Array(5)
                          .fill(0)
                          .map((_, index) => (
                            <tr key={index} className="border-t">
                              <td className="p-2">
                                <Skeleton className="h-4 w-16" />
                              </td>
                              <td className="p-2">
                                <Skeleton className="h-4 w-24" />
                              </td>
                              <td className="p-2">
                                <Skeleton className="h-4 w-16" />
                              </td>
                              <td className="p-2">
                                <Skeleton className="h-4 w-32" />
                              </td>
                              <td className="p-2">
                                <Skeleton className="h-4 w-16" />
                              </td>
                              <td className="p-2">
                                <Skeleton className="h-8 w-20" />
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
                        of {Math.ceil(pagination.classes.total / pagination.classes.limit) || 1}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange("classes", pagination.classes.page + 1)}
                      disabled={
                        pagination.classes.page === Math.ceil(pagination.classes.total / pagination.classes.limit) ||
                        pagination.classes.total === 0
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

