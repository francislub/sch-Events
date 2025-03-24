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
import { addClass } from "@/app/actions/class"
import { getTeachers } from "@/app/actions/teacher-actions"

export default function AddClass() {
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    grade: "",
    section: "",
    teacherId: "",
  })

  const [teachers, setTeachers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(true)
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  // Available grades and sections
  const grades = ["7", "8", "9", "10", "11", "12"]
  const sections = ["A", "B", "C", "D"]

  // Fetch teachers from database
  useEffect(() => {
    const fetchTeachers = async () => {
      setIsLoadingTeachers(true);
      try {
        const teachersData = await getTeachers();
        console.log("Fetched teachers:", teachersData); // Debugging
        if (teachersData && Array.isArray(teachersData)) {
          setTeachers(teachersData);
        } else {
          setTeachers([]); // Ensure it's an array
        }
      } catch (error) {
        console.error("Error fetching teachers:", error);
        toast({
          title: "Error",
          description: "Failed to load teachers. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingTeachers(false);
      }
    };
  
    fetchTeachers();
  }, [toast]);
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Auto-generate class name when grade and section are selected
    if (name === "grade" || name === "section") {
      const updatedData = { ...formData, [name]: value }
      if (updatedData.grade && updatedData.section) {
        setFormData((prev) => ({ ...prev, [name]: value, name: `${updatedData.grade}${updatedData.section}` }))
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
      const result = await addClass(formDataObj)

      if (!result.success) {
        setErrors(result.errors || {})
        toast({
          title: "Error",
          description: "Failed to add class. Please check the form for errors.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Class added successfully.",
        })

        // Redirect to classes list
        router.push("/dashboard/admin/classes")
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
        <h1 className="text-3xl font-bold tracking-tight">Add New Class</h1>
        <p className="text-muted-foreground">Create a new class and assign a teacher</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Class Information</CardTitle>
          <CardDescription>Fill in the details for the new class</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
                <Select
                  value={formData.grade}
                  onValueChange={(value) => handleSelectChange("grade", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        Grade {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.grade && <p className="text-sm text-red-500">{errors.grade[0]}</p>}
              </div>

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
                    {sections.map((section) => (
                      <SelectItem key={section} value={section}>
                        Section {section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.section && <p className="text-sm text-red-500">{errors.section[0]}</p>}
              </div>

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
                  disabled={isLoading || isLoadingTeachers}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingTeachers ? "Loading teachers..." : "Select teacher"} />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name} - {teacher.user?.name || "Teacher"}
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
                onClick={() => router.push("/dashboard/admin/classes")}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Class"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

