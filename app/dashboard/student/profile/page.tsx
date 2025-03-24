"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"

export default function StudentProfile() {
  const { data: session } = useSession()
  const { toast } = useToast()

  const [studentData, setStudentData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [isUpdating, setIsUpdating] = useState(false)

  // Fetch student profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/students/profile")
        const data = await response.json()
        setStudentData(data)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching profile:", error)
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    if (session) {
      fetchProfile()
    }
  }, [session, toast])

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      })
      return
    }

    setIsUpdating(true)

    try {
      const response = await fetch(`/api/users/${session?.user.id}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Password updated successfully.",
        })

        // Reset form
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update password.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Profile</h1>
          <p className="text-muted-foreground">Loading your profile...</p>
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
        <h1 className="text-3xl font-bold tracking-tight">Student Profile</h1>
        <p className="text-muted-foreground">View and manage your profile information</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>First Name</Label>
                    <div className="font-medium mt-1">{studentData.firstName}</div>
                  </div>

                  <div>
                    <Label>Last Name</Label>
                    <div className="font-medium mt-1">{studentData.lastName}</div>
                  </div>

                  <div>
                    <Label>Admission Number</Label>
                    <div className="font-medium mt-1">{studentData.admissionNumber}</div>
                  </div>

                  <div>
                    <Label>Date of Birth</Label>
                    <div className="font-medium mt-1">{format(new Date(studentData.dateOfBirth), "dd MMM yyyy")}</div>
                  </div>

                  <div>
                    <Label>Gender</Label>
                    <div className="font-medium mt-1 capitalize">{studentData.gender}</div>
                  </div>

                  <div>
                    <Label>Enrollment Date</Label>
                    <div className="font-medium mt-1">
                      {format(new Date(studentData.enrollmentDate), "dd MMM yyyy")}
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Address</Label>
                  <div className="font-medium mt-1">{studentData.address || "Not provided"}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Academic Information</CardTitle>
                <CardDescription>Your class and parent details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Grade & Section</Label>
                  <div className="font-medium mt-1">
                    Grade {studentData.grade}, Section {studentData.section}
                  </div>
                </div>

                <div>
                  <Label>Class</Label>
                  <div className="font-medium mt-1">{studentData.class.name}</div>
                </div>

                <div>
                  <Label>Class Teacher</Label>
                  <div className="font-medium mt-1">{studentData.class.teacher.user.name}</div>
                </div>

                <div>
                  <Label>Parent/Guardian</Label>
                  <div className="font-medium mt-1">{studentData.parent.user.name}</div>
                </div>

                <div>
                  <Label>Parent Contact</Label>
                  <div className="font-medium mt-1">{studentData.parent.contactNumber || "Not provided"}</div>
                </div>

                <div>
                  <Label>Parent Email</Label>
                  <div className="font-medium mt-1">{studentData.parent.user.email}</div>
                </div>
              </CardContent>
            </Card>

            {studentData.user && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Your login details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Email</Label>
                      <div className="font-medium mt-1">{studentData.user.email}</div>
                    </div>

                    <div>
                      <Label>Account Created</Label>
                      <div className="font-medium mt-1">{format(new Date(studentData.createdAt), "dd MMM yyyy")}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="security">
          {studentData.user ? (
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      disabled={isUpdating}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      disabled={isUpdating}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      disabled={isUpdating}
                    />
                  </div>

                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Account</CardTitle>
                <CardDescription>You don't have a user account</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  You don't have a user account associated with your student profile. Please contact the administrator
                  to create an account for you.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

