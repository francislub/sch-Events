"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Clock, Upload, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function EditEventPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState("details")
  const [date, setDate] = useState<Date>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [event, setEvent] = useState(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    startTime: "",
    endTime: "",
    capacity: "",
    registrationDeadline: "",
    isPublic: true,
    requiresApproval: false,
    image: "",
  })

  useEffect(() => {
    // Redirect if not authenticated
    if (status === "unauthenticated") {
      router.push(`/auth/login?callbackUrl=/events/${params.id}/edit`)
      return
    }

    if (status === "authenticated") {
      fetchEventDetails()
    }
  }, [status, router, params.id])

  const fetchEventDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/events/${params.id}`)

      if (!response.ok) {
        throw new Error("Failed to fetch event details")
      }

      const eventData = await response.json()

      // Check if user has permission to edit
      if (!eventData.canEdit) {
        router.push(`/events/${params.id}`)
        return
      }

      setEvent(eventData)

      // Set form data from event
      setFormData({
        title: eventData.title || "",
        description: eventData.description || "",
        category: eventData.category || "",
        location: eventData.location || "",
        startTime: eventData.startTime || "",
        endTime: eventData.endTime || "",
        capacity: eventData.capacity ? eventData.capacity.toString() : "",
        registrationDeadline: eventData.registrationDeadline
          ? new Date(eventData.registrationDeadline).toISOString().split("T")[0]
          : "",
        isPublic: eventData.isPublic !== undefined ? eventData.isPublic : true,
        requiresApproval: eventData.requiresApproval !== undefined ? eventData.requiresApproval : false,
        image: eventData.image || "",
      })

      // Set date
      if (eventData.date) {
        setDate(new Date(eventData.date))
      }

      setLoading(false)
    } catch (err) {
      console.error("Error fetching event details:", err)
      setError("Failed to load event details. Please try again later.")
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
  }

  const handleToggleChange = (name: string) => {
    setFormData((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    if (!date) {
      setError("Please select an event date")
      setIsSubmitting(false)
      return
    }

    try {
      const updateData = {
        ...formData,
        date: date.toISOString(),
        capacity: formData.capacity ? Number.parseInt(formData.capacity) : null,
      }

      const response = await fetch(`/api/events/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update event")
      }

      router.push(`/events/${params.id}?updated=true`)
    } catch (err) {
      console.error("Event update error:", err)
      setError(err.message || "Failed to update event. Please try again.")
      setIsSubmitting(false)
    }
  }

  const nextTab = () => {
    if (activeTab === "details") setActiveTab("schedule")
    else if (activeTab === "schedule") setActiveTab("settings")
  }

  const prevTab = () => {
    if (activeTab === "settings") setActiveTab("schedule")
    else if (activeTab === "schedule") setActiveTab("details")
  }

  if (loading) {
    return (
      <div className="container py-8 text-center">
        <p>Loading event details...</p>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertDescription>Event not found or you don't have permission to edit it.</AlertDescription>
        </Alert>
        <Button className="mt-4" variant="outline" onClick={() => router.push("/events")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="sm" className="mr-4" onClick={() => router.push(`/events/${params.id}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Event
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Edit Event</h1>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="details">Event Details</TabsTrigger>
            <TabsTrigger value="schedule">Schedule & Location</TabsTrigger>
            <TabsTrigger value="settings">Settings & Publish</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Event Details</CardTitle>
                  <CardDescription>Update the basic information about your event.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Event Title</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="e.g., Annual Sports Day"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Event Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe your event..."
                      rows={5}
                      value={formData.description}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Event Category</Label>
                    <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                        <SelectItem value="cultural">Cultural</SelectItem>
                        <SelectItem value="career">Career</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Event Image</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      {formData.image ? (
                        <div className="space-y-2">
                          <img
                            src={formData.image || "/placeholder.svg"}
                            alt="Event preview"
                            className="mx-auto max-h-40 object-contain"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setFormData((prev) => ({ ...prev, image: "" }))}
                          >
                            Remove Image
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground mb-2">
                            Drag and drop an image, or click to browse
                          </p>
                          <Button type="button" variant="outline" size="sm">
                            Upload Image
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button type="button" onClick={nextTab}>
                    Next: Schedule & Location
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="schedule">
              <Card>
                <CardHeader>
                  <CardTitle>Schedule & Location</CardTitle>
                  <CardDescription>Update when and where your event will take place.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Event Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={date} onSelect={handleDateChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Start Time</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="startTime"
                          name="startTime"
                          type="time"
                          className="pl-10"
                          value={formData.startTime}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endTime">End Time</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="endTime"
                          name="endTime"
                          type="time"
                          className="pl-10"
                          value={formData.endTime}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Event Location</Label>
                    <Input
                      id="location"
                      name="location"
                      placeholder="e.g., School Auditorium"
                      value={formData.location}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="capacity">Maximum Capacity</Label>
                    <Input
                      id="capacity"
                      name="capacity"
                      type="number"
                      placeholder="e.g., 100"
                      value={formData.capacity}
                      onChange={handleChange}
                    />
                    <p className="text-xs text-muted-foreground">Leave blank for unlimited capacity</p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevTab}>
                    Back: Event Details
                  </Button>
                  <Button type="button" onClick={nextTab}>
                    Next: Settings & Publish
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Settings & Publish</CardTitle>
                  <CardDescription>Configure additional settings for your event.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="registrationDeadline">Registration Deadline</Label>
                    <Input
                      id="registrationDeadline"
                      name="registrationDeadline"
                      type="date"
                      value={formData.registrationDeadline}
                      onChange={handleChange}
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave blank if registration is open until the event starts.
                    </p>
                  </div>

                  <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Public Event</h3>
                        <p className="text-sm text-muted-foreground">Make this event visible to everyone.</p>
                      </div>
                      <input
                        type="checkbox"
                        className="toggle"
                        checked={formData.isPublic}
                        onChange={() => handleToggleChange("isPublic")}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Require Approval</h3>
                        <p className="text-sm text-muted-foreground">Manually approve registration requests.</p>
                      </div>
                      <input
                        type="checkbox"
                        className="toggle"
                        checked={formData.requiresApproval}
                        onChange={() => handleToggleChange("requiresApproval")}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevTab}>
                    Back: Schedule & Location
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Updating Event..." : "Update Event"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </form>
        </Tabs>
      </div>
    </div>
  )
}

