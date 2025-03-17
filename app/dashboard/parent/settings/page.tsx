"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export default function ParentSettings() {
  const { toast } = useToast()
  
  const [accountSettings, setAccountSettings] = useState({
    email: "john.doe@example.com",
    phone: "+1 234-567-8901",
    language: "en"
  })
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    attendanceAlerts: true,
    gradeAlerts: true,
    eventReminders: true,
    behaviorAlerts: true
  })
  
  const [privacySettings, setPrivacySettings] = useState({
    shareContactInfo: false,
    allowPhotos: true,
    allowFieldTrips: true
  })
  
  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setAccountSettings(prev => ({ ...prev, [name]: value }))
  }
  
  const handleSelectChange = (name: string, value: string) => {
    setAccountSettings(prev => ({ ...prev, [name]: value }))
  }
  
  const handleNotificationToggle = (name: string) => {
    setNotificationSettings(prev => ({ ...prev, [name]: !prev[name as keyof typeof prev] }))
  }
  
  const handlePrivacyToggle = (name: string) => {
    setPrivacySettings(prev => ({ ...prev, [name]: !prev[name as keyof typeof prev] }))
  }
  
  const handleSaveSettings = (type: string) => {
    // In a real app, you would call your API to save the settings
    toast({
      title: "Settings Saved",
      description: `${type} settings have been updated successfully.`
    })
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>
      
      <Tabs defaultValue="account">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Update your account information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={accountSettings.email}
                    onChange={handleAccountChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={accountSettings.phone}
                    onChange={handleAccountChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="language">Preferred Language</Label>
                  <Select
                    value={accountSettings.language}
                    onValueChange={(value) => handleSelectChange("language", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="sw">Swahili</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={() => handleSaveSettings("Account")}>
                    Save Account Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Change your account password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={() => handleSaveSettings("Password")}>
                    Change Password
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how you receive notifications from the school
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
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
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via SMS
                      </p>
                    </div>
                    <Switch
                      id="smsNotifications"
                      checked={notificationSettings.smsNotifications}
                      onCheckedChange={() => handleNotificationToggle("smsNotifications")}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Notification Types</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="attendanceAlerts">Attendance Alerts</Label>
                      <Switch
                        id="attendanceAlerts"
                        checked={notificationSettings.attendanceAlerts}
                        onCheckedChange={() => handleNotificationToggle("attendanceAlerts")}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="gradeAlerts">Grade Alerts</Label>
                      <Switch
                        id="gradeAlerts"
                        checked={notificationSettings.gradeAlerts}
                        onCheckedChange={() => handleNotificationToggle("gradeAlerts")}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="eventReminders">Event Reminders</Label>
                      <Switch
                        id="eventReminders"
                        checked={notificationSettings.eventReminders}
                        onCheckedChange={() => handleNotificationToggle("eventReminders")}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="behaviorAlerts">Behavior Alerts</Label>
                      <Switch
                        id="behaviorAlerts"
                        checked={notificationSettings.behaviorAlerts}
                        onCheckedChange={() => handleNotificationToggle("behaviorAlerts")}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={() => handleSaveSettings("Notification")}>
                    Save Notification Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>
                Manage your privacy preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="shareContactInfo">Share Contact Information</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow teachers to share your contact information with other parents
                      </p>
                    </div>
                    <Switch
                      id="shareContactInfo"
                      checked={privacySettings.shareContactInfo}
                      onCheckedChange={() => handlePrivacyToggle("shareContactInfo")}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="allowPhotos">Photo Permission</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow the school to use photos of your child for school publications
                      </p>
                    </div>
                    <Switch
                      id="allowPhotos"
                      checked={privacySettings.allowPhotos}
                      onCheckedChange={() => handlePrivacyToggle("allowPhotos")}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="allowFieldTrips">Field Trip Permission</Label>
                      <p className="text-sm text-muted-foreground">
                        Give general permission for your child to attend school field trips
                      </p>
                    </div>
                    <Switch
                      id="allowFieldTrips"
                      checked={privacySettings.allowFieldTrips}
                      onCheckedChange={() => handlePrivacyToggle("allowFieldTrips")}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={() => handleSaveSettings("Privacy")}>
                    Save Privacy Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Manage your personal data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  You can request a copy of your personal data or request for it to be deleted from our systems.
                </p>
                
                <div className="flex gap-4">
                  <Button variant="outline">
                    Download My Data
                  </Button>
                  <Button variant="destructive">
                    Delete My Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
