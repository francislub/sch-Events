"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Phone, Mail, GraduationCap, BookOpen, Clock, Users, Activity } from 'lucide-react'

export default function TeacherProfile() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [teacherData, setTeacherData] = useState<any>(null)
  
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    qualification: "",
    bio: ""
  })
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  
  // Fetch teacher profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // In a real app, this would fetch from your API
        // const response = await fetch('/api/teacher/profile')
        // const data = await response.json()
        // setTeacherData(data)
        // setProfileData({
        //   name: data.user.name,
        //   email: data.user.email,
        //   phone: data.contactNumber || "",
        //   department: data.department,
        //   qualification: data.qualification,
        //   bio: data.bio || ""
        // })

        // Mock data for demonstration
        setTimeout(() => {
          const mockTeacher = {
            id: "1",
            department: "Mathematics",
            qualification: "M.Sc. Mathematics, B.Ed.",
            contactNumber: "+1 234-567-8910",
            bio: "Experienced mathematics teacher with 8 years of teaching experience. Specialized in advanced mathematics and calculus.",
            user: {
              id: "1",
              name: "Ms. Johnson",
              email: "johnson@wobulenzihigh.edu",
              role: "TEACHER"
            },
            classes: [
              { id: "1", name: "10A", studentsCount: 32 },
              { id: "2", name: "10B", studentsCount: 30 },
              { id: "3", name: "9A", studentsCount: 28 },
              { id: "4", name: "9B", studentsCount: 27 },
              { id: "5", name: "10Adv", studentsCount: 10 }
            ],
            statistics: {
              totalStudents: 127,
              classesPerWeek: 15,
              averageAttendance: "92%",
              averageGrade: "B+"
            }
          }
          
          setTeacherData(mockTeacher)
          setProfileData({
            name: mockTeacher.user.name,
            email: mockTeacher.user.email,
            phone: mockTeacher.contactNumber || "",
            department: mockTeacher.department,
            qualification: mockTeacher.qualification,
            bio: mockTeacher.bio || ""
          })
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching profile:", error)
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again.",
          variant: "destructive"
        })
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [toast])
  
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault()

    // In a real app, you would call an API to update the profile
    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated successfully."
    })
  }
  
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirm password do not match.",
        variant: "destructive"
      })
      return
    }

    // In a real app, you would call an API to change the password
    toast({
      title: "Password Changed",
      description: "Your password has been changed successfully."
    })

    // Reset form
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    })
  }
  
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfileData(prev => ({ ...prev, [name]: value }))
  }
  
  const handlePasswordChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your profile information and account settings
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Card className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-4">
                <div className="h-24 w-24 rounded-full bg-muted"></div>
                <div className="space-y-2">
                  <div className="h-6 w-48 rounded bg-muted"></div>
                  <div className="h-4 w-32 rounded bg-muted"></div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-4 w-full rounded bg-muted"></div>
                <div className="h-4 w-full rounded bg-muted"></div>
                <div className="h-4 w-3/4 rounded bg-muted"></div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-24 rounded bg-muted"></div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-6 w-32 rounded bg-muted"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="h-4 w-20 rounded bg-muted"></div>
                    <div className="h-10 w-full rounded bg-muted"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-20 rounded bg-muted"></div>
                    <div className="h-10 w-full rounded bg-muted"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <Avatar className="h-32 w-32">
                <AvatarImage src="/placeholder.svg?height=128&width=128" alt="Profile picture" />
                <AvatarFallback>{profileData.name.charAt(0)}</AvatarFallback>
              </Avatar>

              <Button variant="outline" className="mt-4">
                Change Picture
              </Button>

              <div className="mt-6 text-center">
                <h3 className="font-medium text-lg">{profileData.name}</h3>
                <p className="text-muted-foreground">{profileData.email}</p>
                <p className="text-sm text-muted-foreground mt-1">{teacherData.department} Teacher</p>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{profileData.phone}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{profileData.email}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{profileData.qualification}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Update your profile information and password</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="profile">
                <TabsList className="mb-6">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="password">Password</TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={profileData.name}
                          onChange={handleProfileChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={profileData.email}
                          onChange={handleProfileChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleProfileChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Input
                          id="department"
                          name="department"
                          value={profileData.department}
                          onChange={handleProfileChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="qualification">Qualification</Label>
                      <Input
                        id="qualification"
                        name="qualification"
                        value={profileData.qualification}
                        onChange={handleProfileChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={profileData.bio}
                        onChange={handleProfileChange}
                        rows={4}
                        placeholder="Tell us about yourself"
                      />
                    </div>

                    <Button type="submit">Save Changes</Button>
                  </form>
                </TabsContent>

                <TabsContent value="password">
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange2}
                      />
                    </div>

                    <Button type="submit">Change Password</Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Teaching Statistics</CardTitle>
              <CardDescription>Overview of your teaching activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <Card className="bg-blue-50">
                  <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                    <Users className="h-8 w-8 text-blue-600 mb-2" />
                    <p className="text-2xl font-bold text-blue-700">{teacherData.statistics.totalStudents}</p>
                    <p className="text-sm text-blue-600">Total Students</p>
                  </CardContent>
                </Card>

                <Card className="bg-green-50">
                  <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                    <BookOpen className="h-8 w-8 text-green-600 mb-2" />
                    <p className="text-2xl font-bold text-green-700">{teacherData.classes.length}</p>
                    <p className="text-sm text-green-600">Classes</p>
                  </CardContent>
                </Card>

                <Card className="bg-purple-50">
                  <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                    <Clock className="h-8 w-8 text-purple-600 mb-2" />
                    <p className="text-2xl font-bold text-purple-700">{teacherData.statistics.classesPerWeek}</p>
                    <p className="text-sm text-purple-600">Hours per Week</p>
                  </CardContent>
                </Card>

                <Card className="bg-orange-50">
                  <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                    <Activity className="h-8 w-8 text-orange-600 mb-2" />
                    <p className="text-2xl font-bold text-orange-700">{teacherData.statistics.averageAttendance}</p>
                    <p className="text-sm text-orange-600">Avg. Attendance</p>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6 border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted">
                      <th className="p-2 text-left font-medium">Class Name</th>
                      <th className="p-2 text-left font-medium">Students</th>
                      <th className="p-2 text-left font-medium">Schedule</th>
                      <th className="p-2 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teacherData.classes.map((cls: any) => (
                      <tr key={cls.id} className="border-t">
                        <td className="p-2 font-medium">{cls.name}</td>
                        <td className="p-2">{cls.studentsCount} students</td>
                        <td className="p-2">View Schedule</td>
                        <td className="p-2">
                          <Button variant="outline" size="sm">View Class</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
