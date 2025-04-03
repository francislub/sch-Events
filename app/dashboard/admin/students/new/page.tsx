"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { registerStudent } from "@/app/actions/student-actions"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function NewStudentPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [gender, setGender] = useState("")
  const [classId, setClassId] = useState("")
  const [stream, setStream] = useState("")
  const [parentId, setParentId] = useState("")
  const [error, setError] = useState<string | null>(null)

  const [parents, setParents] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch parents
        const parentsRes = await fetch("/api/parents")
        if (!parentsRes.ok) throw new Error("Failed to fetch parents")
        const parentsData = await parentsRes.json()

        // Fetch classes
        const classesRes = await fetch("/api/classes")
        if (!classesRes.ok) throw new Error("Failed to fetch classes")
        const classesData = await classesRes.json()

        setParents(parentsData || [])
        setClasses(classesData || [])
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
  }, [toast])

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)

    try {
      const result = await registerStudent(formData)

      if (result.error) {
        setError(result.error)
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Student registered successfully",
      })

      router.push("/dashboard/admin/students")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong. Please try again."
      setError(message)
      toast({
        title: "Error",
        description: message,
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
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Register New Student</h1>

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
          <CardDescription>Enter the details of the new student</CardDescription>
        </CardHeader>
        <form action={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" name="fullName" placeholder="Enter full name" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input id="dateOfBirth" name="dateOfBirth" type="date" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select name="gender" value={gender} onValueChange={setGender} required>
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
                <Input id="admissionNumber" name="admissionNumber" placeholder="Enter admission number" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="classId">Class</Label>
                <Select name="classId" value={classId} onValueChange={setClassId} required>
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
                <Select name="stream" value={stream} onValueChange={setStream} required>
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
                <Select name="parentId" value={parentId} onValueChange={setParentId} required>
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
                        <SelectItem key={parent.id} value={parent.id}>
                          {parent.user?.name || parent.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" name="address" placeholder="Enter address" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="Enter email address" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" placeholder="Enter password" required />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                "Register Student"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

