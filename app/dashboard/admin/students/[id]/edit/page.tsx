"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { getStudentById, updateStudent } from "@/app/actions/student-actions"
import { getParents } from "@/app/actions/parent-actions"
import { getClasses } from "@/app/actions/class-actions"
import { ArrowLeft } from "lucide-react"
import { format } from "date-fns"

export default function EditStudentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    admissionNumber: "",
    classId: "",
    stream: "",
    parentId: "",
    address: "",
    email: "",
    updatePassword: false,
    password: "",
  })

  const [parents, setParents] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoadingData(true)

        // Fetch student data
        const student = await getStudentById(params.id)
        if (!student) {
          setError("Student not found")
          return
        }

        const studentData = student.student

        // Format date for input field
        const dateOfBirth = studentData?.dateOfBirth ? format(new Date(studentData.dateOfBirth), "yyyy-MM-dd") : ""

        setFormData({
          fullName: student.name,
          dateOfBirth,
          gender: studentData?.gender || "",
          admissionNumber: studentData?.admissionNumber || "",
          classId: studentData?.classId || "",
          stream: studentData?.stream || "",
          parentId: studentData?.parentId || "",
          address: studentData?.address || "",
          email: student.email,
          updatePassword: false,
          password: "",
        })

        // Fetch parents and classes
        const [parentsData, classesResult] = await Promise.all([getParents(), getClasses()])

        setParents(parentsData || [])

        if (classesResult.success) {
          setClasses(classesResult.data || [])
        }
      } catch (error) {
        console.error("Error loading data:", error)
        setError("Failed to load data. Please try again.")
      } finally {
        setIsLoadingData(false)
      }
    }

    loadData()
  }, [params.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, updatePassword: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const formDataObj = new FormData()
    formDataObj.append("fullName", formData.fullName)
    formDataObj.append("dateOfBirth", formData.dateOfBirth)
    formDataObj.append("gender", formData.gender)
    formDataObj.append("admissionNumber", formData.admissionNumber)
    formDataObj.append("classId", formData.classId)
    formDataObj.append("stream", formData.stream)
    formDataObj.append("parentId", formData.parentId)
    formDataObj.append("address", formData.address)
    formDataObj.append("email", formData.email)
    formDataObj.append("updatePassword", formData.updatePassword.toString())

    if (formData.updatePassword) {
      formDataObj.append("password", formData.password)
    }

    try {
      const result = await updateStudent(params.id, formDataObj)

      if (!result.success) {
        toast({
          title: "Error",
          description: result.error || "Failed to update student. Please try again.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Student updated successfully.",
        })
        router.push(`/dashboard/admin/students/${params.id}`)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg">Loading student data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-red-600">
              <p>{error}</p>
              <Button className="mt-4" onClick={() => router.push("/dashboard/admin/students")}>
                Return to Students
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="outline" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Student</h1>
          <p className="text-muted-foreground">Update student information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
          <CardDescription>Update the details for this student</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  name="gender"
                  value={formData.gender}
                  onValueChange={(value) => handleSelectChange("gender", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admissionNumber">Admission Number</Label>
                <Input
                  id="admissionNumber"
                  name="admissionNumber"
                  value={formData.admissionNumber}
                  onChange={handleChange}
                  placeholder="Enter admission number"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="classId">Class</Label>
                <Select
                  name="classId"
                  value={formData.classId}
                  onValueChange={(value) => handleSelectChange("classId", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} (Grade {cls.grade})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stream">Stream</Label>
                <Select
                  name="stream"
                  value={formData.stream}
                  onValueChange={(value) => handleSelectChange("stream", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select stream" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentId">Parent/Guardian</Label>
                <Select
                  name="parentId"
                  value={formData.parentId}
                  onValueChange={(value) => handleSelectChange("parentId", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent/guardian" />
                  </SelectTrigger>
                  <SelectContent>
                    {parents.map((parent) => (
                      <SelectItem key={parent.id} value={parent.parent?.id}>
                        {parent.name} ({parent.parent?.relationship || "Parent"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter address"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="updatePassword">Update Password</Label>
                  <Switch
                    id="updatePassword"
                    checked={formData.updatePassword}
                    onCheckedChange={handleSwitchChange}
                    disabled={isLoading}
                  />
                </div>
                {formData.updatePassword && (
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    required={formData.updatePassword}
                    disabled={isLoading}
                  />
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/dashboard/admin/students/${params.id}`)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Student"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

