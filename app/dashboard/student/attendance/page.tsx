"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { Calendar, CheckCircle, XCircle, Clock, BarChart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"

export default function StudentAttendance() {
  const { data: session } = useSession()
  const { toast } = useToast()

  const [attendance, setAttendance] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState({
    month: "all",
    status: "all",
  })

  // Fetch attendance data
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await fetch("/api/attendance")
        const data = await response.json()
        setAttendance(data)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching attendance:", error)
        toast({
          title: "Error",
          description: "Failed to load attendance data. Please try again.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    if (session) {
      fetchAttendance()
    }
  }, [session, toast])

  // Get months from attendance data
  const months = [
    ...new Set(
      attendance.map((record) => {
        const date = new Date(record.date)
        return `${date.getFullYear()}-${date.getMonth() + 1}`
      }),
    ),
  ]
    .sort()
    .map((monthStr) => {
      const [year, month] = monthStr.split("-").map(Number)
      return {
        value: monthStr,
        label: format(new Date(year, month - 1, 1), "MMMM yyyy"),
      }
    })

  // Filter attendance
  const filteredAttendance = attendance.filter((record) => {
    const recordDate = new Date(record.date)
    const recordMonth = `${recordDate.getFullYear()}-${recordDate.getMonth() + 1}`

    const matchesMonth = filter.month === "all" || recordMonth === filter.month
    const matchesStatus = filter.status === "all" || record.status === filter.status

    return matchesMonth && matchesStatus
  })

  // Calculate attendance statistics
  const totalDays = filteredAttendance.length
  const presentDays = filteredAttendance.filter((record) => record.status === "Present").length
  const lateDays = filteredAttendance.filter((record) => record.status === "Late").length
  const absentDays = filteredAttendance.filter((record) => record.status === "Absent").length

  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance Records</h1>
          <p className="text-muted-foreground">Loading your attendance records...</p>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attendance Records</h1>
        <p className="text-muted-foreground">View your attendance history and statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              Total Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalDays}</div>
            <p className="text-sm text-muted-foreground">School days recorded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              Present
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{presentDays}</div>
            <p className="text-sm text-muted-foreground">
              Days present ({totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="mr-2 h-4 w-4 text-yellow-500" />
              Late
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{lateDays}</div>
            <p className="text-sm text-muted-foreground">
              Days late ({totalDays > 0 ? Math.round((lateDays / totalDays) * 100) : 0}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <XCircle className="mr-2 h-4 w-4 text-red-500" />
              Absent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{absentDays}</div>
            <p className="text-sm text-muted-foreground">
              Days absent ({totalDays > 0 ? Math.round((absentDays / totalDays) * 100) : 0}%)
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
          <CardDescription>View and filter your attendance records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <Select value={filter.month} onValueChange={(value) => setFilter((prev) => ({ ...prev, month: value }))}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="All Months" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filter.status}
                onValueChange={(value) => setFilter((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Present">Present</SelectItem>
                  <SelectItem value="Late">Late</SelectItem>
                  <SelectItem value="Absent">Absent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filteredAttendance.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No attendance records found matching the selected filters.
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted">
                      <th className="p-2 text-left font-medium">Date</th>
                      <th className="p-2 text-left font-medium">Day</th>
                      <th className="p-2 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttendance.map((record) => {
                      const date = new Date(record.date)
                      return (
                        <tr key={record.id} className="border-t">
                          <td className="p-2 font-medium">{format(date, "dd MMM yyyy")}</td>
                          <td className="p-2">{format(date, "EEEE")}</td>
                          <td className="p-2">
                            <Badge
                              className={
                                record.status === "Present"
                                  ? "bg-green-100 text-green-800"
                                  : record.status === "Late"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }
                            >
                              {record.status}
                            </Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart className="mr-2 h-5 w-5" />
            Attendance Overview
          </CardTitle>
          <CardDescription>Your attendance rate over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="relative h-48 w-48">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold">{attendanceRate}%</div>
                  <div className="text-sm text-muted-foreground">Attendance Rate</div>
                </div>
              </div>
              <svg className="h-full w-full" viewBox="0 0 100 100">
                <circle
                  className="text-muted stroke-current"
                  strokeWidth="10"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
                <circle
                  className={`${
                    attendanceRate >= 90
                      ? "text-green-500"
                      : attendanceRate >= 80
                        ? "text-blue-500"
                        : attendanceRate >= 70
                          ? "text-yellow-500"
                          : "text-red-500"
                  } stroke-current`}
                  strokeWidth="10"
                  strokeDasharray={`${attendanceRate * 2.51} 251`}
                  strokeLinecap="round"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                  transform="rotate(-90 50 50)"
                />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

