"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, User, Mail, School, BookOpen, Building, Key, Calendar, Users } from "lucide-react"

export default function EditUserPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [user, setUser] = useState(null)

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    role: "",
    studentId: "",
    grade: "",
    department: "",
  })

  const [passwordData, setPasswordData] = useState({
    password: "",
    confirmPassword: "",
  })

  useEffect(() => {
    // Redirect if not admin
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/admin/users")
      return
    }

    if (status === "authenticated") {
      if (session.user.role !== "ADMIN") {
        router.push("/dashboard")
        return
      }

      fetchUser()
    }
  }, [status, session, router, params.id])

  const fetchUser = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/users/${params.id}`)

      if (!response.ok) {
        throw new Error("Failed to fetch user")
      }

      const userData = await response.json()
      setUser(userData)

      setUserData({
        name: userData.name || "",
        email: userData.email || "",
        role: userData.role || "",
        studentId: userData.studentId || "",
        grade: userData.grade || "",
        department: userData.department || "",
      })

      setLoading(false)
    } catch (err) {
      console.error("Error fetching user:", err)
      setError("Failed to load user data. Please try again later.")
      setLoading(false)
    }
  }

  const handleUserDataChange = (e) => {
    const { name, value } = e.target
    setUserData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRoleChange = (value) => {
    setUserData((prev) => ({ ...prev, role: value }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
  }

  const handleUserDataSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch(`/api/admin/users/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update user")
      }

      setSuccess("User updated successfully")
    } catch (err) {
      console.error("Error updating user:", err)
      setError(err.message || "Failed to update user. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess("")

    // Validate passwords
    if (passwordData.password !== passwordData.confirmPassword) {
      setError("Passwords do not match")
      setSaving(false)
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: passwordData.password,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update password")
      }

      setSuccess("Password updated successfully")
      setPasswordData({
        password: "",
        confirmPassword: "",
      })
    } catch (err) {
      console.error("Error updating password:", err)
      setError(err.message || "Failed to update password. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-8 text-center">
        <p>Loading user data...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertDescription>User not found</AlertDescription>
        </Alert>
        <Button className="mt-4" variant="outline" onClick={() => router.push("/admin/users")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="sm" className="mr-4" onClick={() => router.push("/admin/users")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary/10 p-6 rounded-full mb-4">
                  <User className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">{user.name}</h2>
                <p className="text-muted-foreground">{user.email}</p>
                <div className="mt-2 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {user.role}
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  <p>Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                  <p>Events Created: {user._count?.events || 0}</p>
                  <p>Event Registrations: {user._count?.registrations || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-2">
            <Tabs defaultValue="profile" className="mb-8">
              <TabsList className="mb-6">
                <TabsTrigger value="profile">User Information</TabsTrigger>
                <TabsTrigger value="password">Change Password</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>User Information</CardTitle>
                    <CardDescription>Update user details and role</CardDescription>
                  </CardHeader>
                  <form onSubmit={handleUserDataSubmit}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="name"
                            name="name"
                            className="pl-10"
                            value={userData.name}
                            onChange={handleUserDataChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            className="pl-10"
                            value={userData.email}
                            onChange={handleUserDataChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select value={userData.role} onValueChange={handleRoleChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ADMIN">Administrator</SelectItem>
                            <SelectItem value="TEACHER">Teacher</SelectItem>
                            <SelectItem value="STUDENT">Student</SelectItem>
                            <SelectItem value="PARENT">Parent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {userData.role === "STUDENT" && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="studentId">Student ID</Label>
                            <div className="relative">
                              <School className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="studentId"
                                name="studentId"
                                className="pl-10"
                                value={userData.studentId}
                                onChange={handleUserDataChange}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="grade">Grade/Class</Label>
                            <div className="relative">
                              <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="grade"
                                name="grade"
                                className="pl-10"
                                value={userData.grade}
                                onChange={handleUserDataChange}
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {userData.role === "TEACHER" && (
                        <div className="space-y-2">
                          <Label htmlFor="department">Department</Label>
                          <div className="relative">
                            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="department"
                              name="department"
                              className="pl-10"
                              value={userData.department}
                              onChange={handleUserDataChange}
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>

              <TabsContent value="password">
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Set a new password for this user</CardDescription>
                  </CardHeader>
                  <form onSubmit={handlePasswordSubmit}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">New Password</Label>
                        <div className="relative">
                          <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="password"
                            name="password"
                            type="password"
                            className="pl-10"
                            value={passwordData.password}
                            onChange={handlePasswordChange}
                            required
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">Password must be at least 6 characters long</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <div className="relative">
                          <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            className="pl-10"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            required
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" disabled={saving}>
                        {saving ? "Updating..." : "Update Password"}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex gap-4">
              <Card className="flex-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Recent Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {user.events && user.events.length > 0 ? (
                    <ul className="space-y-2">
                      {user.events.map((event) => (
                        <li key={event.id} className="text-sm">
                          <Button
                            variant="link"
                            className="p-0 h-auto"
                            onClick={() => router.push(`/events/${event.id}`)}
                          >
                            {event.title}
                          </Button>
                          <p className="text-xs text-muted-foreground">{new Date(event.date).toLocaleDateString()}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No events created</p>
                  )}
                </CardContent>
              </Card>

              <Card className="flex-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Recent Registrations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {user.registrations && user.registrations.length > 0 ? (
                    <ul className="space-y-2">
                      {user.registrations.map((reg) => (
                        <li key={reg.id} className="text-sm">
                          <Button
                            variant="link"
                            className="p-0 h-auto"
                            onClick={() => router.push(`/events/${reg.event.id}`)}
                          >
                            {reg.event.title}
                          </Button>
                          <p className="text-xs text-muted-foreground">
                            Status: {reg.status} • {new Date(reg.event.date).toLocaleDateString()}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No event registrations</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

