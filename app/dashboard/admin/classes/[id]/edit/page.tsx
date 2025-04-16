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
import { getClassById, updateClass } from "@/app/actions/class-actions"
import { getTeachers } from "@/app/actions/teacher-actions"
import { ArrowLeft, Loader2 } from "lucide-react"

export default function EditClassPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    grade: "", // This will now store the level (O LEVEL, A LEVEL)
    section: "", // This will now store ARTS or SCIENCES for A LEVEL
    teacherId: "",
  })

  const [teachers, setTeachers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  // Available levels and sections
  const levels = ["O LEVEL", "A LEVEL"]
  const sections = {
    "A LEVEL": ["ARTS", "SCIENCES"],
    "O LEVEL": [],
  }

  // Fetch class and teachers data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classResult, teachersData] = await Promise.all([getClassById(params.id), getTeachers()])

        if (classResult.success) {
          const classData = classResult.data
          setFormData({
            name: classData.name,
            grade: classData.grade,
            section: classData.section,
            teacherId: classData.teacherId,
          })
        } else {
          toast({
            title: "Error",
            description: "Failed to load class data. Please try again.",
            variant: "destructive",
          })
          router.push("/dashboard/admin/classes")
        }

        setTeachers(teachersData || [])
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchData()
  }, [params.id, router, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    if (name === "grade") {
      // If changing level, reset section if it's O LEVEL
      if (value === "O LEVEL") {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          section: "", // Clear section when O LEVEL is selected
        }))
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }))
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }

    // Auto-generate class name when level and section (if applicable) are selected
    if (name === "grade" || name === "section") {
      const updatedData = { ...formData, [name]: value }

      if (updatedData.grade === "O LEVEL") {
        // For O LEVEL, just use "O LEVEL" as the name
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          name: "O LEVEL",
        }))
      } else if (updatedData.grade === "A LEVEL" && updatedData.section) {
        // For A LEVEL, combine level and section (ARTS or SCIENCES)
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          name: `A LEVEL ${updatedData.section}`,
        }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    const formDataObj = new FormData()
    formDataObj.append("name", formData.name)
    formDataObj.append("grade", formData.grade)
    formDataObj.append("section", formData.section)
    formDataObj.append("teacherId", formData.teacherId)

    try {
      const result = await updateClass(params.id, formDataObj)

      if (!result.success) {
        setErrors(result.errors || {})
        toast({
          title: "Error",
          description: "Failed to update class. Please check the form for errors.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Class updated successfully.",
        })

        // Redirect to class details
        router.push(`/dashboard/admin/classes/${params.id}`)
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
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-lg">Loading class data...</p>
        </div>
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
          <h1 className="text-3xl font-bold tracking-tight">Edit Class</h1>
          <p className="text-muted-foreground">Update class information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Class Information</CardTitle>
          <CardDescription>Update the details for this class</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="grade">Level</Label>
                <Select
                  value={formData.grade}
                  onValueChange={(value) => handleSelectChange("grade", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.grade && <p className="text-sm text-red-500">{errors.grade[0]}</p>}
              </div>

              {formData.grade === "A LEVEL" && (
                <div className="space-y-2">
                  <Label htmlFor="section">Section</Label>
                  <Select
                    value={formData.section}
                    onValueChange={(value) => handleSelectChange("section", value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      {sections["A LEVEL"].map((section) => (
                        <SelectItem key={section} value={section}>
                          {section}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.section && <p className="text-sm text-red-500">{errors.section[0]}</p>}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Class Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name[0]}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="teacherId">Class Teacher</Label>
                <Select
                  value={formData.teacherId}
                  onValueChange={(value) => handleSelectChange("teacherId", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name} - {teacher.teacher?.specialization || "Teacher"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.teacherId && <p className="text-sm text-red-500">{errors.teacherId[0]}</p>}
              </div>
            </div>

            {errors._form && <div className="bg-red-50 p-3 rounded-md text-red-500 text-sm">{errors._form[0]}</div>}

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/dashboard/admin/classes/${params.id}`)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Class"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
