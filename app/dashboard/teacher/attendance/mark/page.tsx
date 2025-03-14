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
import { markAttendance } from "@/app/actions/attendance-actions"

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

  // Mock data for classes
  useEffect(() => {
    // In a real app, you would fetch this data from your API
    setClasses([
      { id: "1", name: "10A" },
      { id: "2", name: "10B" },
      { id: "3", name: "9A" },
      { id: "4", name: "9B" },
    ])
  }, [])

  // Load students when class is selected
  useEffect(() => {
    if (formData.classId) {
      setIsLoading(true)

      // In a real app, you would fetch students for the selected class
      setTimeout(() => {
        const mockStudents = [
          { id: "1", firstName: "Sarah", lastName: "Doe", grade: "10", section: "A" },
          { id: "2", firstName: "Michael", lastName: "Smith", grade: "10", section: "A" },
          { id: "3", firstName: "Emily", lastName: "Johnson", grade: "9", section: "B" },
          { id: "4", firstName: "David", lastName: "Wilson", grade: "10", section: "B" },
          { id: "5", firstName: "Jessica", lastName: "Brown", grade: "10", section: "A" },
        ].filter((student) => {
          const selectedClass = classes.find((c) => c.id === formData.classId)
          return selectedClass && `${student.grade}${student.section}` === selectedClass.name
        })

        setStudents(mockStudents)

        // Initialize attendance data
        const initialAttendance: Record<string, string> = {}
        mockStudents.forEach((student) => {
          initialAttendance[student.id] = "Present"
        })

        setAttendanceData(initialAttendance)
        setIsLoading(false)
      }, 500)
    } else {
      setStudents([])
      setAttendanceData({})
    }
  }, [formData.classId, classes])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAttendanceChange = (studentId: string, status: string) => {
    setAttendanceData((prev) => ({ ...prev, [studentId]: status }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // In a real app, you would call your API to save attendance
      // Process each student's attendance
      for (const studentId in attendanceData) {
        const formDataObj = new FormData()
        formDataObj.append("date", formData.date)
        formDataObj.append("studentId", studentId)
        formDataObj.append("status", attendanceData[studentId])

        // Call the server action
        await markAttendance(formDataObj)
      }

      toast({
        title: "Attendance Marked",
        description: "Attendance has been marked successfully for all students.",
      })

      // Redirect to attendance list
      router.push("/dashboard/teacher/attendance")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark attendance. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const markAllAs = (status: string) => {
    const updatedAttendance: Record<string, string> = {}
    students.forEach((student) => {
      updatedAttendance[student.id] = status
    })
    setAttendanceData(updatedAttendance)
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
                  disabled={isSaving}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8">Loading students...</div>
            ) : students.length > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => markAllAs("Present")}>
                    Mark All Present
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => markAllAs("Absent")}>
                    Mark All Absent
                  </Button>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted">
                        <th className="p-2 text-left font-medium">Student Name</th>
                        <th className="p-2 text-left font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.id} className="border-t">
                          <td className="p-2">{`${student.firstName} ${student.lastName}`}</td>
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
                    onClick={() => router.push("/dashboard/teacher/attendance")}
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
              <div className="text-center py-8 text-muted-foreground">No students found in this class.</div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">Please select a class to view students.</div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

