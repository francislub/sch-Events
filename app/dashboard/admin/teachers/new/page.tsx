"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { registerTeacher } from "@/app/actions/teacher-actions"

export default function AddTeacher() {
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    qualification: "",
    contactNumber: "",
    address: "",
  })

  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isLoading, setIsLoading] = useState(false)

  const departments = [
    "Mathematics",
    "Science",
    "English",
    "History",
    "Geography",
    "Physical Education",
    "Art",
    "Music",
    "Computer Science",
    "Languages",
    "Other",
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: ["Passwords do not match"] })
      setIsLoading(false)
      return
    }

    try {
      const formDataObj = new FormData()
      formDataObj.append("name", formData.name)
      formDataObj.append("email", formData.email)
      formDataObj.append("password", formData.password)
      formDataObj.append("department", formData.department)
      formDataObj.append("qualification", formData.qualification)
      formDataObj.append("contactNumber", formData.contactNumber)
      formDataObj.append("address", formData.address)

      const result = await registerTeacher(formDataObj)

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
        router.push("/dashboard/admin/teachers")
      } else {
        setErrors(result.errors || {})
        if (result.errors?._form) {
          toast({
            title: "Error",
            description: result.errors._form[0],
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Teacher</h1>
        <p className="text-muted-foreground">Enter the details of the new teacher</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teacher Information</CardTitle>
          <CardDescription>Fill in the teacher's personal and professional details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email[0]}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
                {errors.password && <p className="text-sm text-red-500">{errors.password[0]}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
                {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword[0]}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => handleSelectChange("department", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.department && <p className="text-sm text-red-500">{errors.department[0]}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="qualification">Qualification</Label>
                <Input
                  id="qualification"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
                {errors.qualification && <p className="text-sm text-red-500">{errors.qualification[0]}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number</Label>
                <Input
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.contactNumber && <p className="text-sm text-red-500">{errors.contactNumber[0]}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.address && <p className="text-sm text-red-500">{errors.address[0]}</p>}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/admin/teachers")}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Teacher"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

