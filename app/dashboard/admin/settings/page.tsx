"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

export default function AdminSettings() {
  const { toast } = useToast()

  const [generalSettings, setGeneralSettings] = useState({
    schoolName: "Wobulenzi High School",
    address: "123 School Road, Wobulenzi, Uganda",
    phone: "+256 123 456 789",
    email: "info@wobulenzihigh.edu",
    website: "https://wobulenzihigh.edu",
    logo: "/placeholder.svg?height=100&width=100",
  })

  const [academicSettings, setAcademicSettings] = useState({
    currentTerm: "Term 1",
    academicYear: "2025",
    gradesScale: "A (90-100), B (80-89), C (70-79), D (60-69), F (Below 60)",
    attendanceThreshold: "80",
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    parentNotifications: true,
    teacherNotifications: true,
    adminNotifications: true,
  })

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setGeneralSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleAcademicChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setAcademicSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleNotificationToggle = (name: string) => {
    setNotificationSettings((prev) => ({ ...prev, [name]: !prev[name as keyof typeof prev] }))
  }

  const handleSaveSettings = (type: string) => {
    // In a real app, you would call your API to save the settings
    toast({
      title: "Settings Saved",
      description: `${type} settings have been updated successfully.`,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground">Configure and manage school system settings</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic information about your school</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">School Name</Label>
                  <Input
                    id="schoolName"
                    name="schoolName"
                    value={generalSettings.schoolName}
                    onChange={handleGeneralChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={generalSettings.address}
                    onChange={handleGeneralChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" value={generalSettings.phone} onChange={handleGeneralChange} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={generalSettings.email}
                      onChange={handleGeneralChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" name="website" value={generalSettings.website} onChange={handleGeneralChange} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="logo">School Logo</Label>
                    <div className="flex items-center gap-4">
                      <img
                        src={generalSettings.logo || "/placeholder.svg"}
                        alt="School Logo"
                        className="h-16 w-16 object-contain border rounded"
                      />
                      <Button variant="outline">Change Logo</Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSaveSettings("General")}>Save General Settings</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Academic Settings</CardTitle>
              <CardDescription>Configure academic year, terms, and grading system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="currentTerm">Current Term</Label>
                    <Input
                      id="currentTerm"
                      name="currentTerm"
                      value={academicSettings.currentTerm}
                      onChange={handleAcademicChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="academicYear">Academic Year</Label>
                    <Input
                      id="academicYear"
                      name="academicYear"
                      value={academicSettings.academicYear}
                      onChange={handleAcademicChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gradesScale">Grading Scale</Label>
                  <Textarea
                    id="gradesScale"
                    name="gradesScale"
                    value={academicSettings.gradesScale}
                    onChange={handleAcademicChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attendanceThreshold">Minimum Attendance Threshold (%)</Label>
                  <Input
                    id="attendanceThreshold"
                    name="attendanceThreshold"
                    type="number"
                    min="0"
                    max="100"
                    value={academicSettings.attendanceThreshold}
                    onChange={handleAcademicChange}
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSaveSettings("Academic")}>Save Academic Settings</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how notifications are sent to users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send notifications via email</p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={() => handleNotificationToggle("emailNotifications")}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="smsNotifications">SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send notifications via SMS</p>
                    </div>
                    <Switch
                      id="smsNotifications"
                      checked={notificationSettings.smsNotifications}
                      onCheckedChange={() => handleNotificationToggle("smsNotifications")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Notification Recipients</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="parentNotifications">Parents</Label>
                      <Switch
                        id="parentNotifications"
                        checked={notificationSettings.parentNotifications}
                        onCheckedChange={() => handleNotificationToggle("parentNotifications")}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="teacherNotifications">Teachers</Label>
                      <Switch
                        id="teacherNotifications"
                        checked={notificationSettings.teacherNotifications}
                        onCheckedChange={() => handleNotificationToggle("teacherNotifications")}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="adminNotifications">Administrators</Label>
                      <Switch
                        id="adminNotifications"
                        checked={notificationSettings.adminNotifications}
                        onCheckedChange={() => handleNotificationToggle("adminNotifications")}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSaveSettings("Notification")}>Save Notification Settings</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

