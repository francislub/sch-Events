"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ParentAttendance() {
  const { toast } = useToast()

  const [selectedChild, setSelectedChild] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // Mock data for children
  const children = [
    { id: "1", name: "Sarah Doe", grade: "10A" },
    { id: "2", name: "Michael Doe", grade: "8B" },
  ]

  // Mock data for months
  const months = [
    { value: "2025-01", label: "January 2025" },
    { value: "2025-02", label: "February 2025" },
    { value: "2025-03", label: "March 2025" },
  ]

  // Mock data for attendance
  const [attendanceData, setAttendanceData] = useState<any[]>([])

  useEffect(() => {
    // In a real app, you would fetch this data from your API
    if (selectedChild && selectedMonth) {
      setIsLoading(true)

      // Simulate API call
      setTimeout(() => {
        const mockAttendance = {
          "1": {
            // Sarah
            "2025-03": [
              { date: "2025-03-01", day: "Monday", status: "Present" },
              { date: "2025-03-02", day: "Tuesday", status: "Present" },
              { date: "2025-03-03", day: "Wednesday", status: "Present" },
              { date: "2025-03-04", day: "Thursday", status: "Absent" },
              { date: "2025-03-05", day: "Friday", status: "Present" },
              { date: "2025-03-08", day: "Monday", status: "Present" },
              { date: "2025-03-09", day: "Tuesday", status: "Present" },
              { date: "2025-03-10", day: "Wednesday", status: "Late" },
              { date: "2025-03-11", day: "Thursday", status: "Present" },
              { date: "2025-03-12", day: "Friday", status: "Present" },
              { date: "2025-03-15", day: "Monday", status: "Present" },
              { date: "2025-03-16", day: "Tuesday", status: "Present" },
              { date: "2025-03-17", day: "Wednesday", status: "Present" },
              { date: "2025-03-18", day: "Thursday", status: "Present" },
              { date: "2025-03-19", day: "Friday", status: "Present" },
            ],
            "2025-02": [
              { date: "2025-02-01", day: "Monday", status: "Present" },
              { date: "2025-02-02", day: "Tuesday", status: "Present" },
              { date: "2025-02-03", day: "Wednesday", status: "Present" },
              { date: "2025-02-04", day: "Thursday", status: "Present" },
              { date: "2025-02-05", day: "Friday", status: "Present" },
              { date: "2025-02-08", day: "Monday", status: "Absent" },
              { date: "2025-02-09", day: "Tuesday", status: "Absent" },
              { date: "2025-02-10", day: "Wednesday", status: "Present" },
              { date: "2025-02-11", day: "Thursday", status: "Present" },
              { date: "2025-02-12", day: "Friday", status: "Present" },
              { date: "2025-02-15", day: "Monday", status: "Present" },
              { date: "2025-02-16", day: "Tuesday", status: "Present" },
              { date: "2025-02-17", day: "Wednesday", status: "Late" },
              { date: "2025-02-18", day: "Thursday", status: "Present" },
              { date: "2025-02-19", day: "Friday", status: "Present" },
            ],
          },
          "2": {
            // Michael
            "2025-03": [
              { date: "2025-03-01", day: "Monday", status: "Present" },
              { date: "2025-03-02", day: "Tuesday", status: "Present" },
              { date: "2025-03-03", day: "Wednesday", status: "Absent" },
              { date: "2025-03-04", day: "Thursday", status: "Present" },
              { date: "2025-03-05", day: "Friday", status: "Present" },
              { date: "2025-03-08", day: "Monday", status: "Present" },
              { date: "2025-03-09", day: "Tuesday", status: "Present" },
              { date: "2025-03-10", day: "Wednesday", status: "Present" },
              { date: "2025-03-11", day: "Thursday", status: "Late" },
              { date: "2025-03-12", day: "Friday", status: "Present" },
              { date: "2025-03-15", day: "Monday", status: "Present" },
              { date: "2025-03-16", day: "Tuesday", status: "Present" },
              { date: "2025-03-17", day: "Wednesday", status: "Present" },
              { date: "2025-03-18", day: "Thursday", status: "Present" },
              { date: "2025-03-19", day: "Friday", status: "Absent" },
            ],
            "2025-02": [
              { date: "2025-02-01", day: "Monday", status: "Present" },
              { date: "2025-02-02", day: "Tuesday", status: "Present" },
              { date: "2025-02-03", day: "Wednesday", status: "Present" },
              { date: "2025-02-04", day: "Thursday", status: "Late" },
              { date: "2025-02-05", day: "Friday", status: "Present" },
              { date: "2025-02-08", day: "Monday", status: "Present" },
              { date: "2025-02-09", day: "Tuesday", status: "Present" },
              { date: "2025-02-10", day: "Wednesday", status: "Present" },
              { date: "2025-02-11", day: "Thursday", status: "Present" },
              { date: "2025-02-12", day: "Friday", status: "Absent" },
              { date: "2025-02-15", day: "Monday", status: "Present" },
              { date: "2025-02-16", day: "Tuesday", status: "Present" },
              { date: "2025-02-17", day: "Wednesday", status: "Present" },
              { date: "2025-02-18", day: "Thursday", status: "Present" },
              { date: "2025-02-19", day: "Friday", status: "Present" },
            ],
          },
        }

        setAttendanceData(mockAttendance[selectedChild as keyof typeof mockAttendance]?.[selectedMonth] || [])
        setIsLoading(false)
      }, 500)
    } else {
      setAttendanceData([])
      setIsLoading(false)
    }
  }, [selectedChild, selectedMonth])

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
                {child.name} - {child.grade}
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

      {!selectedChild || !selectedMonth ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground">Please select a child and month to view attendance records.</p>
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
                  {children.find((c) => c.id === selectedChild)?.name} -{" "}
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
                      {attendanceData.map((record, index) => (
                        <tr key={index} className="border-t">
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
                  Overview of attendance for {children.find((c) => c.id === selectedChild)?.name} in{" "}
                  {months.find((m) => m.value === selectedMonth)?.label}
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
                  <div className="h-[200px] bg-muted rounded-md flex items-center justify-center">
                    <p className="text-muted-foreground">Attendance trend chart would be displayed here</p>
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

