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
import { useToast } from "@/hooks/use-toast"
import { getStudentById, updateStudent } from "@/app/actions/student-actions"
import { getParents } from "@/app/actions/parent-actions"
import { getClasses } from "@/app/actions/class-actions"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { format } from "date-fns"

export default function EditStudentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [student, setStudent] = useState<any>(null)

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [gender, setGender] = useState("")
  const [admissionNumber, setAdmissionNumber] = useState("")
  const [classId, setClassId] = useState("")
  const [stream, setStream] = useState("")
  const [parentId, setParentId] = useState("")
  const [address, setAddress] = useState("")
  const [updatePassword, setUpdatePassword] = useState(false)
  const [password, setPassword] = useState("")

  const [parents, setParents] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch student data
        const studentData = await getStudentById(params.id)
        setStudent(studentData)

        if (studentData) {
          setFullName(studentData.name || "")
          setEmail(studentData.email || "")
          setDateOfBirth(
            studentData.student?.dateOfBirth ? format(new Date(studentData.student.dateOfBirth), "yyyy-MM-dd") : "",
          )
          setGender(studentData.student?.gender || "")
          setAdmissionNumber(studentData.student?.admissionNumber || "")
          setClassId(studentData.student?.classId || "")
          setStream(studentData.student?.stream || "")
          setParentId(studentData.student?.parentId || "")
          setAddress(studentData.student?.address || "")
        }

        // Fetch parents
        const parentsData = await getParents()
        setParents(parentsData || [])

        // Fetch classes
        const classesResult = await getClasses()
        if (classesResult.success) {
          setClasses(classesResult.data || [])
        }
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error",
          description: "Failed to load data. Please refresh the page.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingData(false)
      }
    }

    loadData()
  }, [params.id, toast])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("fullName", fullName)
      formData.append("email", email)
      formData.append("dateOfBirth", dateOfBirth)
      formData.append("gender", gender)
      formData.append("admissionNumber", admissionNumber)
      formData.append("classId", classId)
      formData.append("stream", stream)
      formData.append("parentId", parentId)
      formData.append("address", address)
      formData.append("updatePassword", updatePassword.toString())

      if (updatePassword) {
        formData.append("password", password)
      }

      const result = await updateStudent(params.id, formData)

      if (!result.success) {
        setError(result.error || "Failed to update student")
        toast({
          title: "Error",
          description: result.error || "Failed to update student",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Student updated successfully",
      })

      router.push(`/dashboard/admin/students/${params.id}`)
    } catch (error) {
      setError("Something went wrong. Please try again.")
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Student not found</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => router.push("/dashboard/admin/students")}>Back to Students</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Edit Student</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
          <CardDescription>Update the details of the student</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={gender} onValueChange={setGender} required>
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
                  value={admissionNumber}
                  onChange={(e) => setAdmissionNumber(e.target.value)}
                  placeholder="Enter admission number"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="classId">Class</Label>
                <Select value={classId} onValueChange={setClassId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.length === 0 ? (
                      <SelectItem value="no-classes" disabled>
                        No classes available
                      </SelectItem>
                    ) : (
                      classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name} (Grade {cls.grade})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stream">Stream</Label>
                <Select value={stream} onValueChange={setStream} required>
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
                <Select value={parentId} onValueChange={setParentId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent/guardian" />
                  </SelectTrigger>
                  <SelectContent>
                    {parents.length === 0 ? (
                      <SelectItem value="no-parents" disabled>
                        No parents available
                      </SelectItem>
                    ) : (
                      parents.map((parent) => (
                        <SelectItem key={parent.id} value={parent.parent?.id || parent.id}>
                          {parent.name} ({parent.parent?.relationship || "Parent"})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter address"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 mb-2">
                  <Checkbox
                    id="updatePassword"
                    checked={updatePassword}
                    onCheckedChange={(checked) => setUpdatePassword(checked as boolean)}
                  />
                  <Label htmlFor="updatePassword">Update Password</Label>
                </div>
                {updatePassword && (
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    required={updatePassword}
                  />
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.back()}>
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

