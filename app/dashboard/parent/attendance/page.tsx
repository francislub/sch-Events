"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface Child {
  id: string
  firstName: string
  lastName: string
  grade: string
  section: string
}

interface AttendanceRecord {
  id: string
  date: string
  status: string
  day: string
}

interface MonthlyAttendance {
  month: string
  present: number
  absent: number
  late: number
  rate: string
}

export default function ParentAttendance() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("")
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyAttendance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [months, setMonths] = useState<{ value: string; label: string }[]>([])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    async function fetchChildren() {
      try {
        const res = await fetch("/api/students?parentId=current")
        if (!res.ok) throw new Error("Failed to fetch children")
        const data = await res.json()
        setChildren(data)
        if (data.length > 0) {
          setSelectedChild(data[0].id)
        }
      } catch (error) {
        console.error("Error fetching children:", error)
        toast({
          title: "Error",
          description: "Failed to load your children's data. Please try again.",
          variant: "destructive",
        })
      }
    }

    if (status === "authenticated") {
      fetchChildren()
    }
  }, [status, toast])

  useEffect(() => {
    // Generate months for the current year
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const monthsArray = []

    for (let i = 0; i < 12; i++) {
      const date = new Date(currentYear, i, 1)
      const monthValue = `${currentYear}-${String(i + 1).padStart(2, "0")}`
      const monthLabel = date.toLocaleString("default", { month: "long", year: "numeric" })
      monthsArray.push({ value: monthValue, label: monthLabel })
    }

    setMonths(monthsArray)

    // Set current month as default
    const currentMonth = `${currentYear}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`
    setSelectedMonth(currentMonth)
  }, [])

  useEffect(() => {
    async function fetchAttendance() {
      if (!selectedChild || !selectedMonth) {
        setAttendanceData([])
        setMonthlyData([])
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)

        // Fetch daily attendance records
        const dailyRes = await fetch(`/api/attendance?studentId=${selectedChild}&month=${selectedMonth}`)
        if (!dailyRes.ok) throw new Error("Failed to fetch attendance records")
        const dailyData = await dailyRes.json()
        setAttendanceData(dailyData)

        // Fetch monthly attendance summary
        const monthlyRes = await fetch(`/api/attendance/summary?studentId=${selectedChild}&months=3`)
        if (!monthlyRes.ok) throw new Error("Failed to fetch attendance summary")
        const monthlyData = await monthlyRes.json()
        setMonthlyData(monthlyData)
      } catch (error) {
        console.error("Error fetching attendance:", error)
        toast({
          title: "Error",
          description: "Failed to load attendance data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (selectedChild) {
      fetchAttendance()
    }
  }, [selectedChild, selectedMonth, toast])

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Attendance records are being exported to PDF.",
    })

    // In a real app, you would implement the export functionality
  }

  // Calculate attendance statistics
  const calculateStats = () => {
    if (!attendanceData.length) return { present: 0, absent: 0, late: 0, rate: "0%" }

    const present = attendanceData.filter((a) => a.status === "Present").length
    const absent = attendanceData.filter((a) => a.status === "Absent").length
    const late = attendanceData.filter((a) => a.status === "Late").length
    const total = attendanceData.length

    const rate = Math.round((present / total) * 100) + "%"

    return { present, absent, late, rate }
  }

  const stats = calculateStats()

  if (isLoading && !children.length) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance Records</h1>
          <p className="text-muted-foreground">Loading attendance data...</p>
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-8">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance Records</h1>
          <p className="text-muted-foreground">View your child's attendance history</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport} disabled={!selectedChild || !attendanceData.length}>
            <FileDown className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Select value={selectedChild} onValueChange={setSelectedChild}>
          <SelectTrigger className="w-full md:w-[250px]">
            <SelectValue placeholder="Select child" />
          </SelectTrigger>
          <SelectContent>
            {children.map((child) => (
              <SelectItem key={child.id} value={child.id}>
                {child.firstName} {child.lastName} - Grade {child.grade}
                {child.section}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedMonth} onValueChange={setSelectedMonth} disabled={!selectedChild}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month.value} value={month.value}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedChild ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground">Please select a child to view attendance records.</p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground">Loading attendance records...</p>
          </CardContent>
        </Card>
      ) : attendanceData.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground">No attendance records found for the selected month.</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="records">
          <TabsList>
            <TabsTrigger value="records">Attendance Records</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="records" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {children.find((c) => c.id === selectedChild)?.firstName}{" "}
                  {children.find((c) => c.id === selectedChild)?.lastName} -{" "}
                  {months.find((m) => m.value === selectedMonth)?.label} Attendance
                </CardTitle>
                <CardDescription>Daily attendance records for the selected month</CardDescription>
              </CardHeader>
              <CardContent>
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
                      {attendanceData.map((record) => (
                        <tr key={record.id} className="border-t">
                          <td className="p-2">{new Date(record.date).toLocaleDateString()}</td>
                          <td className="p-2">{record.day}</td>
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Summary</CardTitle>
                <CardDescription>
                  Overview of attendance for {children.find((c) => c.id === selectedChild)?.firstName}{" "}
                  {children.find((c) => c.id === selectedChild)?.lastName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-medium text-green-800">Present</h3>
                    <p className="text-2xl font-bold">{stats.present}</p>
                    <p className="text-sm text-muted-foreground">days</p>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="font-medium text-red-800">Absent</h3>
                    <p className="text-2xl font-bold">{stats.absent}</p>
                    <p className="text-sm text-muted-foreground">days</p>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="font-medium text-yellow-800">Late</h3>
                    <p className="text-2xl font-bold">{stats.late}</p>
                    <p className="text-sm text-muted-foreground">days</p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-800">Attendance Rate</h3>
                    <p className="text-2xl font-bold">{stats.rate}</p>
                    <p className="text-sm text-muted-foreground">overall</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-medium mb-2">Monthly Trend</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted">
                          <th className="p-2 text-left font-medium">Month</th>
                          <th className="p-2 text-left font-medium">Present</th>
                          <th className="p-2 text-left font-medium">Absent</th>
                          <th className="p-2 text-left font-medium">Late</th>
                          <th className="p-2 text-left font-medium">Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthlyData.length > 0 ? (
                          monthlyData.map((record, index) => (
                            <tr key={index} className="border-t">
                              <td className="p-2">{record.month}</td>
                              <td className="p-2">{record.present}</td>
                              <td className="p-2">{record.absent}</td>
                              <td className="p-2">{record.late}</td>
                              <td className="p-2 font-medium">{record.rate}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="p-4 text-center text-muted-foreground">
                              No monthly summary available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

