"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { markAttendance } from "@/app/actions/attendance-actions"

export default function EditAttendance() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    date: "",
    status: "",
    studentId: "",
  })

  const [student, setStudent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch attendance record
  const fetchAttendanceRecord = async () => {
    setIsLoading(true)

    try {
      // In a real app, you would fetch the attendance record from your API
      // For now, we'll simulate a delay and use mock data
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Mock data for the attendance record
      const mockRecord = {
        id: params.id,
        date: "2025-03-15",
        status: "Present",
        studentId: "1",
        student: {
          id: "1",
          firstName: "Sarah",
          lastName: "Doe",
          grade: "10",
          section: "A",
          class: {
            id: "1",
            name: "10A",
          },
        },
      }

      setFormData({
        date: mockRecord.date,
        status: mockRecord.status,
        studentId: mockRecord.studentId,
      })

      setStudent(mockRecord.student)
    } catch (error) {
      console.error("Error fetching attendance record:", error)
      toast({
        title: "Error",
        description: "Failed to fetch attendance record. Please try again.",
        variant: "destructive",
      })
      router.push("/dashboard/admin/attendance")
    } finally {
      setIsLoading(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchAttendanceRecord()
  }, [params.id])

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Create form data
      const formDataObj = new FormData()
      formDataObj.append("date", formData.date)
      formDataObj.append("studentId", formData.studentId)
      formDataObj.append("status", formData.status)

      // Call server action
      const result = await markAttendance(formDataObj)

      if (!result.success) {
        throw new Error(result.errors?._form?.[0] || "Failed to update attendance")
      }

      toast({
        title: "Attendance Updated",
        description: "Attendance record has been updated successfully.",
      })

      // Redirect to attendance list
      router.push("/dashboard/admin/attendance")
    } catch (error) {
      console.error("Error updating attendance:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update attendance. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading attendance record...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Attendance</h1>
        <p className="text-muted-foreground">
          Update attendance record for {student?.firstName} {student?.lastName}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Information</CardTitle>
          <CardDescription>Update the attendance details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="studentName">Student</Label>
                <Input id="studentName" value={`${student?.firstName} ${student?.lastName}`} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="class">Class</Label>
                <Input id="class" value={student?.class?.name} disabled />
              </div>

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
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                  disabled={isSaving}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Present">Present</SelectItem>
                    <SelectItem value="Absent">Absent</SelectItem>
                    <SelectItem value="Late">Late</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

