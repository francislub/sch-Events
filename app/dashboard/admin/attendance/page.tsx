"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { ChevronLeft, ChevronRight, FileDown, Filter, Plus, RefreshCw, Search, Trash2, X } from "lucide-react"
import Link from "next/link"
import { deleteAttendanceRecord } from "@/app/actions/attendance-actions"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function AdminAttendance() {
  const router = useRouter()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [attendance, setAttendance] = useState<any[]>([])
  const [statistics, setStatistics] = useState({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    attendanceRate: 0,
  })
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
  })

  // Filter state
  const [filters, setFilters] = useState({
    classId: "",
    grade: "",
    section: "",
    status: "",
    startDate: "",
    endDate: "",
    search: "",
  })

  const [showFilters, setShowFilters] = useState(false)
  const [classes, setClasses] = useState<any[]>([])
  const [isExporting, setIsExporting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Mock data for classes, grades, and sections
  const grades = ["7", "8", "9", "10", "11", "12"]
  const sections = ["A", "B", "C", "D"]
  const statuses = ["Present", "Absent", "Late"]

  // Fetch attendance data
  const fetchAttendance = async () => {
    setIsLoading(true)

    try {
      // Build query params
      const params = new URLSearchParams()
      params.append("page", pagination.page.toString())
      params.append("limit", pagination.limit.toString())

      if (filters.classId) params.append("classId", filters.classId)
      if (filters.grade) params.append("grade", filters.grade)
      if (filters.section) params.append("section", filters.section)
      if (filters.status) params.append("status", filters.status)
      if (filters.startDate) params.append("startDate", filters.startDate)
      if (filters.endDate) params.append("endDate", filters.endDate)

      // Fetch attendance data from API
      const response = await fetch(`/api/attendance?${params.toString()}`)

      if (!response.ok) {
        throw new Error("Failed to fetch attendance data")
      }

      const data = await response.json()

      setAttendance(data.attendance)
      setPagination(data.pagination)
      setStatistics(data.statistics)
    } catch (error) {
      console.error("Error fetching attendance:", error)
      toast({
        title: "Error",
        description: "Failed to fetch attendance data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch classes for filter
  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/classes")

      if (!response.ok) {
        throw new Error("Failed to fetch classes")
      }

      const data = await response.json()
      setClasses(data)
    } catch (error) {
      console.error("Error fetching classes:", error)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchClasses()
    fetchAttendance()
  }, [])

  // Fetch data when pagination or filters change
  useEffect(() => {
    fetchAttendance()
  }, [pagination.page, pagination.limit, filters])

  // Handle filter changes
  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }))
    // Reset to first page when filters change
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      classId: "",
      grade: "",
      section: "",
      status: "",
      startDate: "",
      endDate: "",
      search: "",
    })
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      setPagination((prev) => ({ ...prev, page: newPage }))
    }
  }

  // Handle export
  const handleExport = async () => {
    setIsExporting(true)

    try {
      // In a real app, you would call an API endpoint to generate and download the export
      // For now, we'll just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Export Complete",
        description: "Attendance data has been exported successfully.",
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export attendance data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  // Handle delete attendance record
  const handleDeleteRecord = async (id: string) => {
    setIsDeleting(true)

    try {
      const result = await deleteAttendanceRecord(id)

      if (result.success) {
        toast({
          title: "Record Deleted",
          description: "Attendance record has been deleted successfully.",
        })

        // Refresh attendance data
        fetchAttendance()
      } else {
        toast({
          title: "Delete Failed",
          description: result.errors?._form?.[0] || "Failed to delete attendance record.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance Management</h1>
          <p className="text-muted-foreground">View and manage student attendance records</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-2 h-4 w-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
          <Button variant="outline" onClick={handleExport} disabled={isExporting}>
            <FileDown className="mr-2 h-4 w-4" />
            {isExporting ? "Exporting..." : "Export"}
          </Button>
          <Link href="/dashboard/admin/attendance/mark">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Mark Attendance
            </Button>
          </Link>
        </div>
      </div>

      {showFilters && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>Filters</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" /> Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="classId">Class</Label>
                <Select value={filters.classId} onValueChange={(value) => handleFilterChange("classId", value)}>
                  <SelectTrigger>
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

              <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
                <Select value={filters.grade} onValueChange={(value) => handleFilterChange("grade", value)}>
                  <SelectTrigger>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="section">Section</Label>
                <Select value={filters.section} onValueChange={(value) => handleFilterChange("section", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Sections" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sections</SelectItem>
                    {sections.map((section) => (
                      <SelectItem key={section} value={section}>
                        Section {section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange("startDate", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange("endDate", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="records">
        <TabsList>
          <TabsTrigger value="records">Attendance Records</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>View and manage student attendance records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="relative flex-grow">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by student name..."
                      className="pl-8"
                      value={filters.search}
                      onChange={(e) => handleFilterChange("search", e.target.value)}
                    />
                  </div>
                  <Button variant="ghost" size="icon" className="ml-2" onClick={fetchAttendance} disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                  </Button>
                </div>

                {isLoading ? (
                  <div className="text-center py-8">Loading attendance records...</div>
                ) : attendance.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No attendance records found matching the selected filters.
                  </div>
                ) : (
                  <>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-muted">
                            <th className="p-2 text-left font-medium">Student</th>
                            <th className="p-2 text-left font-medium">Class</th>
                            <th className="p-2 text-left font-medium">Date</th>
                            <th className="p-2 text-left font-medium">Status</th>
                            <th className="p-2 text-left font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attendance.map((record) => (
                            <tr key={record.id} className="border-t">
                              <td className="p-2">{`${record.student.firstName} ${record.student.lastName}`}</td>
                              <td className="p-2">{record.student.class.name}</td>
                              <td className="p-2">{formatDate(record.date)}</td>
                              <td className="p-2">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    record.status === "Present"
                                      ? "bg-green-100 text-green-800"
                                      : record.status === "Absent"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {record.status}
                                </span>
                              </td>
                              <td className="p-2">
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.push(`/dashboard/admin/attendance/edit/${record.id}`)}
                                  >
                                    Edit
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Attendance Record</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete this attendance record? This action cannot be
                                          undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeleteRecord(record.id)}
                                          className="bg-red-500 hover:bg-red-600"
                                          disabled={isDeleting}
                                        >
                                          {isDeleting ? "Deleting..." : "Delete"}
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        Showing {attendance.length} of {pagination.total} records
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={pagination.page === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-1">
                          <span className="text-sm">Page</span>
                          <Input
                            className="w-12 h-8"
                            value={pagination.page}
                            onChange={(e) => {
                              const page = Number.parseInt(e.target.value)
                              if (!isNaN(page)) {
                                handlePageChange(page)
                              }
                            }}
                          />
                          <span className="text-sm">of {pagination.pages}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={pagination.page === pagination.pages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Statistics</CardTitle>
              <CardDescription>Overview of attendance statistics based on selected filters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-800">Present</h3>
                  <p className="text-2xl font-bold">{statistics.present}</p>
                  <p className="text-sm text-muted-foreground">
                    {statistics.total > 0 ? `${Math.round((statistics.present / statistics.total) * 100)}%` : "0%"}
                  </p>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-medium text-red-800">Absent</h3>
                  <p className="text-2xl font-bold">{statistics.absent}</p>
                  <p className="text-sm text-muted-foreground">
                    {statistics.total > 0 ? `${Math.round((statistics.absent / statistics.total) * 100)}%` : "0%"}
                  </p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-medium text-yellow-800">Late</h3>
                  <p className="text-2xl font-bold">{statistics.late}</p>
                  <p className="text-sm text-muted-foreground">
                    {statistics.total > 0 ? `${Math.round((statistics.late / statistics.total) * 100)}%` : "0%"}
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-800">Attendance Rate</h3>
                  <p className="text-2xl font-bold">
                    {statistics.total > 0 ? `${Math.round((statistics.present / statistics.total) * 100)}%` : "0%"}
                  </p>
                  <p className="text-sm text-muted-foreground">Overall</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Attendance Trends</h3>
                <div className="h-[300px] bg-muted rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground">Attendance trend chart would be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

