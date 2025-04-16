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
import { addClass } from "@/app/actions/class-actions"
import { Loader2 } from "lucide-react"

export default function AddClass() {
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
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(true)
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  // Available levels and sections
  const levels = ["O LEVEL", "A LEVEL"]
  const sections = {
    "A LEVEL": ["ARTS", "SCIENCES"],
    "O LEVEL": [],
  }

  // Fetch teachers from database
  useEffect(() => {
    const fetchTeachers = async () => {
      setIsLoadingTeachers(true)
      try {
        console.log("Fetching teachers...")
        const response = await fetch("/api/teachers")

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()
        console.log("Teachers API response:", data)

        if (Array.isArray(data)) {
          // The API returns teachers with user property containing name
          setTeachers(data)
          console.log(`Successfully loaded ${data.length} teachers`)
        } else {
          console.error("Teachers data is not an array:", data)
          setTeachers([])
          toast({
            title: "Error",
            description: "Failed to load teachers data. Unexpected format.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching teachers:", error)
        toast({
          title: "Error",
          description: "Failed to load teachers. Please try again.",
          variant: "destructive",
        })
        setTeachers([])
      } finally {
        setIsLoadingTeachers(false)
      }
    }

    fetchTeachers()
  }, [toast])

  // Log teachers state for debugging
  useEffect(() => {
    console.log("Teachers state updated:", teachers)
  }, [teachers])

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
                  disabled={isLoading || isLoadingTeachers}
                >
                  <SelectTrigger>
                    {isLoadingTeachers ? (
                      <div className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Loading teachers...</span>
                      </div>
                    ) : (
                      <SelectValue placeholder="Select teacher" />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingTeachers ? (
                      <SelectItem value="loading" disabled>
                        <div className="flex items-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          <span>Loading...</span>
                        </div>
                      </SelectItem>
                    ) : teachers && teachers.length > 0 ? (
                      teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {/* Display teacher name from the user property */}
                          {teacher.user?.name || "Unknown Teacher"} - {teacher.department || "Department not specified"}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-teachers" disabled>
                        No teachers available
                      </SelectItem>
                    )}
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
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Class"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
