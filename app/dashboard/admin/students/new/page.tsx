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
import { Checkbox } from "@/components/ui/checkbox"
import { registerStudent } from "@/app/actions/student-actions"
import { getParents } from "@/app/actions/parent-actions"
import { getClasses } from "@/app/actions/class-actions"

export default function AddStudent() {
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    admissionNumber: "",
    dateOfBirth: "",
    gender: "",
    enrollmentDate: new Date().toISOString().split("T")[0],
    grade: "",
    section: "",
    address: "",
    parentId: "",
    classId: "",
    createAccount: false,
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [parents, setParents] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const parentsData = await getParents()
        const classesData = await getClasses()

        setParents(parentsData)
        setClasses(classesData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load required data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchData()
  }, [toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    // Validate password match if creating account
    if (formData.createAccount && formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: ["Passwords do not match"] })
      setIsLoading(false)
      return
    }

    try {
      const formDataObj = new FormData()
      formDataObj.append("firstName", formData.firstName)
      formDataObj.append("lastName", formData.lastName)
      formDataObj.append("admissionNumber", formData.admissionNumber)
      formDataObj.append("dateOfBirth", formData.dateOfBirth)
      formDataObj.append("gender", formData.gender)
      formDataObj.append("enrollmentDate", formData.enrollmentDate)
      formDataObj.append("grade", formData.grade)
      formDataObj.append("section", formData.section)
      formDataObj.append("address", formData.address)
      formDataObj.append("parentId", formData.parentId)
      formDataObj.append("classId", formData.classId)
      formDataObj.append("createAccount", formData.createAccount.toString())

      if (formData.createAccount) {
        formDataObj.append("email", formData.email)
        formDataObj.append("password", formData.password)
      }

      const result = await registerStudent(formDataObj)

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
        router.push("/dashboard/admin/students")
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

  if (isLoadingData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Student</h1>
          <p className="text-muted-foreground">Loading required data...</p>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Student</h1>
        <p className="text-muted-foreground">Enter the details of the new student</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
          <CardDescription>Fill in the student's personal and academic details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
                {errors.firstName && <p className="text-sm text-red-500">{errors.firstName[0]}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
                {errors.lastName && <p className="text-sm text-red-500">{errors.lastName[0]}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="admissionNumber">Admission Number</Label>
                <Input
                  id="admissionNumber"
                  name="admissionNumber"
                  value={formData.admissionNumber}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
                {errors.admissionNumber && <p className="text-sm text-red-500">{errors.admissionNumber[0]}</p>}
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
                {errors.dateOfBirth && <p className="text-sm text-red-500">{errors.dateOfBirth[0]}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleSelectChange("gender", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && <p className="text-sm text-red-500">{errors.gender[0]}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="enrollmentDate">Enrollment Date</Label>
                <Input
                  id="enrollmentDate"
                  name="enrollmentDate"
                  type="date"
                  value={formData.enrollmentDate}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
                {errors.enrollmentDate && <p className="text-sm text-red-500">{errors.enrollmentDate[0]}</p>}
              </div>

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
                    <SelectItem value="7">Grade 7</SelectItem>
                    <SelectItem value="8">Grade 8</SelectItem>
                    <SelectItem value="9">Grade 9</SelectItem>
                    <SelectItem value="10">Grade 10</SelectItem>
                    <SelectItem value="11">Grade 11</SelectItem>
                    <SelectItem value="12">Grade 12</SelectItem>
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
                    <SelectItem value="A">Section A</SelectItem>
                    <SelectItem value="B">Section B</SelectItem>
                    <SelectItem value="C">Section C</SelectItem>
                  </SelectContent>
                </Select>
                {errors.section && <p className="text-sm text-red-500">{errors.section[0]}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentId">Parent/Guardian</Label>
                <Select
                  value={formData.parentId}
                  onValueChange={(value) => handleSelectChange("parentId", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent" />
                  </SelectTrigger>
                  <SelectContent>
                    {parents.map((parent) => (
                      <SelectItem key={parent.id} value={parent.id}>
                        {parent.user.name} ({parent.relationship || "Parent"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.parentId && <p className="text-sm text-red-500">{errors.parentId[0]}</p>}
              </div>

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
                        {cls.name} (Grade {cls.grade}, Section {cls.section})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.classId && <p className="text-sm text-red-500">{errors.classId[0]}</p>}
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

              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="createAccount"
                    name="createAccount"
                    checked={formData.createAccount}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, createAccount: checked === true }))}
                    disabled={isLoading}
                  />
                  <Label htmlFor="createAccount">Create login account for student</Label>
                </div>
              </div>

              {formData.createAccount && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required={formData.createAccount}
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
                      required={formData.createAccount}
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
                      required={formData.createAccount}
                      disabled={isLoading}
                    />
                    {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword[0]}</p>}
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/admin/students")}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Student"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

