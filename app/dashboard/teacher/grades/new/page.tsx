"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { addGrade } from "@/app/actions/grade-actions"
import { Loader2 } from "lucide-react"

export default function AddGrade() {
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    subject: "",
    term: "",
    score: "",
    grade: "",
    remarks: "",
    studentId: "",
    classId: "",
  })

  const [students, setStudents] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [subjects, setSubjects] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  const terms = ["Term 1", "Term 2", "Term 3", "Final"]

  // Fetch classes taught by the teacher
  useEffect(() => {
    const fetchClasses = async () => {
      setIsLoadingData(true)
      try {
        const response = await fetch("/api/classes/teacher")
        if (!response.ok) throw new Error("Failed to fetch classes")
        const data = await response.json()
        setClasses(data)

        // Extract unique subjects from all classes
        const allSubjects = data.flatMap((cls) => cls.subjects || [])
        const uniqueSubjects = [...new Set(allSubjects)]
        setSubjects(uniqueSubjects)
      } catch (error) {
        console.error("Error fetching classes:", error)
        toast({
          title: "Error",
          description: "Failed to load classes. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchClasses()
  }, [toast])

  // Load students when class is selected
  useEffect(() => {
    if (!formData.classId) {
      setStudents([])
      return
    }

    const fetchStudents = async () => {
      setIsLoadingData(true)
      try {
        const response = await fetch(`/api/students/teacher?classId=${formData.classId}`)
        if (!response.ok) throw new Error("Failed to fetch students")
        const data = await response.json()
        setStudents(data.students || [])
      } catch (error) {
        console.error("Error fetching students:", error)
        toast({
          title: "Error",
          description: "Failed to load students. Please try again.",
          variant: "destructive",
        })
        setStudents([])
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchStudents()
  }, [formData.classId, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // If grade is selected, set a default letter grade based on score
    if (name === "score") {
      const score = Number.parseFloat(value)
      let grade = ""

      if (score >= 90) grade = "A"
      else if (score >= 80) grade = "B"
      else if (score >= 70) grade = "C"
      else if (score >= 60) grade = "D"
      else grade = "F"

      setFormData((prev) => ({ ...prev, grade }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    const formDataObj = new FormData()
    formDataObj.append("subject", formData.subject)
    formDataObj.append("term", formData.term)
    formDataObj.append("score", formData.score)
    formDataObj.append("grade", formData.grade)
    formDataObj.append("remarks", formData.remarks)
    formDataObj.append("studentId", formData.studentId)

    try {
      const result = await addGrade(formDataObj)

      if (!result.success) {
        setErrors(result.errors || {})
        toast({
          title: "Error",
          description: "Failed to add grade. Please check the form for errors.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Grade added successfully.",
        })

        // Redirect to grades list
        router.push("/dashboard/teacher/grades")
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Grade</h1>
        <p className="text-muted-foreground">Enter grade details for a student</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Grade Information</CardTitle>
          <CardDescription>Fill in the grade details for the student</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingData ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="classId">Class</Label>
                  <Select
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
                          {cls.name} ({cls.grade}-{cls.section})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.classId && <p className="text-sm text-red-500">{errors.classId[0]}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studentId">Student</Label>
                  <Select
                    value={formData.studentId}
                    onValueChange={(value) => handleSelectChange("studentId", value)}
                    disabled={isLoading || !formData.classId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.studentId && <p className="text-sm text-red-500">{errors.studentId[0]}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select
                    value={formData.subject}
                    onValueChange={(value) => handleSelectChange("subject", value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.length > 0 ? (
                        subjects.map((subject) => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="default">No subjects available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.subject && <p className="text-sm text-red-500">{errors.subject[0]}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="term">Term</Label>
                  <Select
                    value={formData.term}
                    onValueChange={(value) => handleSelectChange("term", value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select term" />
                    </SelectTrigger>
                    <SelectContent>
                      {terms.map((term) => (
                        <SelectItem key={term} value={term}>
                          {term}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.term && <p className="text-sm text-red-500">{errors.term[0]}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="score">Score (0-100)</Label>
                  <Input
                    id="score"
                    name="score"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.score}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  {errors.score && <p className="text-sm text-red-500">{errors.score[0]}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grade">Letter Grade</Label>
                  <Select
                    value={formData.grade}
                    onValueChange={(value) => handleSelectChange("grade", value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A (90-100)</SelectItem>
                      <SelectItem value="B">B (80-89)</SelectItem>
                      <SelectItem value="C">C (70-79)</SelectItem>
                      <SelectItem value="D">D (60-69)</SelectItem>
                      <SelectItem value="F">F (Below 60)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.grade && <p className="text-sm text-red-500">{errors.grade[0]}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks (Optional)</Label>
                <Textarea
                  id="remarks"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  placeholder="Add any comments or feedback for the student"
                  disabled={isLoading}
                />
                {errors.remarks && <p className="text-sm text-red-500">{errors.remarks[0]}</p>}
              </div>

              {errors._form && <div className="bg-red-50 p-3 rounded-md text-red-500 text-sm">{errors._form[0]}</div>}

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard/teacher/grades")}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Grade"
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

