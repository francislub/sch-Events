"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { markBulkAttendance } from "@/app/actions/attendance-actions"

export default function MarkAttendance() {
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    classId: "",
  })

  const [students, setStudents] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  // Fetch classes
  const fetchClasses = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/classes")

      if (!response.ok) {
        throw new Error(`Failed to fetch classes: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Classes fetched:", data)

      if (!Array.isArray(data)) {
        console.error("Classes API did not return an array:", data)
        setClasses([])
        return
      }

      setClasses(data)
    } catch (error) {
      console.error("Error fetching classes:", error)
      toast({
        title: "Error",
        description: "Failed to fetch classes. Please try again.",
        variant: "destructive",
      })
      setClasses([])
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch students when class is selected
  const fetchStudents = async () => {
    if (!formData.classId) return

    setIsLoading(true)
    setApiError(null)

    try {
      // Build query params
      const params = new URLSearchParams()
      params.append("classId", formData.classId)

      console.log(`Fetching students for class ID: ${formData.classId}`)

      // Fetch students from API
      const response = await fetch(`/api/students?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch students: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Students API response:", data)

      // Ensure data is an array
      if (!Array.isArray(data)) {
        console.error("Students API did not return an array:", data)
        setStudents([])
        setAttendanceData({})
        setApiError("Invalid response format from server")
        return
      }

      setStudents(data)

      // Initialize attendance data
      const initialAttendance: Record<string, string> = {}
      data.forEach((student: any) => {
        initialAttendance[student.id] = "Present"
      })

      setAttendanceData(initialAttendance)
    } catch (error) {
      console.error("Error fetching students:", error)
      setApiError(error instanceof Error ? error.message : "Failed to fetch students")
      toast({
        title: "Error",
        description: "Failed to fetch students. Please try again.",
        variant: "destructive",
      })
      setStudents([])
      setAttendanceData({})
    } finally {
      setIsLoading(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchClasses()
  }, [])

  // Fetch students when class is selected
  useEffect(() => {
    if (formData.classId) {
      fetchStudents()
    } else {
      setStudents([])
      setAttendanceData({})
    }
  }, [formData.classId])

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle attendance status change
  const handleAttendanceChange = (studentId: string, status: string) => {
    setAttendanceData((prev) => ({ ...prev, [studentId]: status }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (students.length === 0) {
      toast({
        title: "No Students",
        description: "There are no students to mark attendance for.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      // Create form data
      const formDataObj = new FormData()
      formDataObj.append("date", formData.date)
      formDataObj.append("classId", formData.classId)

      // Add attendance data for each student
      for (const [studentId, status] of Object.entries(attendanceData)) {
        formDataObj.append(`student-${studentId}`, status)
      }

      // Call server action
      const result = await markBulkAttendance(formDataObj)

      if (!result.success) {
        throw new Error(result.errors?._form?.[0] || "Failed to mark attendance")
      }

      toast({
        title: "Attendance Marked",
        description: "Attendance has been marked successfully for all students.",
      })

      // Redirect to attendance list
      router.push("/dashboard/admin/attendance")
    } catch (error) {
      console.error("Error marking attendance:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to mark attendance. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Mark all students with the same status
  const markAllAs = (status: string) => {
    const updatedAttendance: Record<string, string> = {}
    students.forEach((student) => {
      updatedAttendance[student.id] = status
    })
    setAttendanceData(updatedAttendance)
  }

  // Debug function to show raw student data
  const debugStudents = () => {
    console.log("Current students state:", students)
    return JSON.stringify(students, null, 2)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mark Attendance</h1>
        <p className="text-muted-foreground">Record student attendance for a class</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Information</CardTitle>
          <CardDescription>Select class and date to mark attendance</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="classId">Class</Label>
                <Select
                  value={formData.classId}
                  onValueChange={(value) => handleSelectChange("classId", value)}
                  disabled={isSaving || isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.length > 0 ? (
                      classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-classes" disabled>
                        No classes available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8">Loading students...</div>
            ) : apiError ? (
              <div className="text-center py-8 text-red-500">
                <p>Error: {apiError}</p>
                <Button type="button" variant="outline" className="mt-4" onClick={fetchStudents}>
                  Try Again
                </Button>
              </div>
            ) : students.length > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => markAllAs("Present")}>
                    Mark All Present
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => markAllAs("Absent")}>
                    Mark All Absent
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => markAllAs("Late")}>
                    Mark All Late
                  </Button>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted">
                        <th className="p-2 text-left font-medium">Student Name</th>
                        <th className="p-2 text-left font-medium">Class</th>
                        <th className="p-2 text-left font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.id} className="border-t">
                          <td className="p-2">{`${student.firstName || "Unknown"} ${student.lastName || ""}`}</td>
                          <td className="p-2">{student.class?.name || "Unknown"}</td>
                          <td className="p-2">
                            <Select
                              value={attendanceData[student.id] || "Present"}
                              onValueChange={(value) => handleAttendanceChange(student.id, value)}
                              disabled={isSaving}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Present">Present</SelectItem>
                                <SelectItem value="Absent">Absent</SelectItem>
                                <SelectItem value="Late">Late</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard/admin/attendance")}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving || students.length === 0}>
                    {isSaving ? "Saving..." : "Save Attendance"}
                  </Button>
                </div>
              </div>
            ) : formData.classId ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No students found in this class.</p>
                <Button type="button" variant="outline" className="mt-4" onClick={fetchStudents}>
                  Refresh
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">Please select a class to view students.</div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
