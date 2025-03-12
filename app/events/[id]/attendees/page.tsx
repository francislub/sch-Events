"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ArrowLeft, Search, Check, X, Trash2, Download } from "lucide-react"

export default function EventAttendeesPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session, status } = useSession()
  const [event, setEvent] = useState(null)
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedRegistration, setSelectedRegistration] = useState(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    // Redirect if not authenticated
    if (status === "unauthenticated") {
      router.push(`/auth/login?callbackUrl=/events/${params.id}/attendees`)
      return
    }

    if (status === "authenticated") {
      fetchEventDetails()
      fetchRegistrations()
    }
  }, [status, router, params.id])

  const fetchEventDetails = async () => {
    try {
      const response = await fetch(`/api/events/${params.id}`)

      if (!response.ok) {
        throw new Error("Failed to fetch event details")
      }

      const eventData = await response.json()

      // Check if user has permission to manage attendees
      if (!eventData.canEdit) {
        router.push(`/events/${params.id}`)
        return
      }

      setEvent(eventData)
    } catch (err) {
      console.error("Error fetching event details:", err)
      setError("Failed to load event details. Please try again later.")
    }
  }

  const fetchRegistrations = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/events/${params.id}/registrations`)

      if (!response.ok) {
        throw new Error("Failed to fetch registrations")
      }

      const data = await response.json()
      setRegistrations(data)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching registrations:", err)
      setError("Failed to load registrations. Please try again later.")
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value)
  }

  const handleUpdateStatus = async (registrationId, newStatus) => {
    setIsProcessing(true)

    try {
      const response = await fetch(`/api/events/${params.id}/registrations/${registrationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update registration status")
      }

      // Update the registration in the state
      setRegistrations(registrations.map((reg) => (reg.id === registrationId ? { ...reg, status: newStatus } : reg)))
    } catch (err) {
      console.error("Error updating registration status:", err)
      setError(err.message || "Failed to update registration status. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeleteRegistration = async () => {
    if (!selectedRegistration) return

    setIsProcessing(true)

    try {
      const response = await fetch(`/api/events/${params.id}/registrations/${selectedRegistration.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete registration")
      }

      // Remove the registration from the state
      setRegistrations(registrations.filter((reg) => reg.id !== selectedRegistration.id))
      setShowDeleteDialog(false)
      setSelectedRegistration(null)
    } catch (err) {
      console.error("Error deleting registration:", err)
      setError(err.message || "Failed to delete registration. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExportAttendance = () => {
    // Generate CSV export URL
    const exportUrl = `/api/admin/reports/attendance?eventId=${params.id}&format=csv`
    window.open(exportUrl, "_blank")
  }

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-200"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200"
      case "ATTENDED":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  // Filter registrations based on search and status filter
  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch =
      reg.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (reg.user.studentId && reg.user.studentId.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus = statusFilter === "all" || reg.status === statusFilter

    return matchesSearch && matchesStatus
  })

  if (loading && registrations.length === 0) {
    return (
      <div className="container py-8 text-center">
        <p>Loading registrations...</p>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertDescription>Event not found or you don't have permission to manage attendees.</AlertDescription>
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
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="sm" className="mr-4" onClick={() => router.push(`/events/${params.id}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Event
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Manage Attendees</h1>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold">{event.title}</h2>
          <p className="text-muted-foreground">
            {new Date(event.date).toLocaleDateString()} • {event.location}
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle>Registrations</CardTitle>
                <CardDescription>
                  {registrations.length} {registrations.length === 1 ? "person" : "people"} registered for this event
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleExportAttendance}>
                <Download className="mr-2 h-4 w-4" />
                Export Attendance
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or ID..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
              <div>
                <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="ATTENDED">Attended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {filteredRegistrations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No registrations found matching your criteria.</p>
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRegistrations.map((registration) => (
                      <TableRow key={registration.id}>
                        <TableCell className="font-medium">{registration.user.name}</TableCell>
                        <TableCell>{registration.user.email}</TableCell>
                        <TableCell>{registration.user.role}</TableCell>
                        <TableCell>
                          {registration.user.role === "STUDENT" && (
                            <span className="text-sm text-muted-foreground">
                              {registration.user.studentId && `ID: ${registration.user.studentId}`}
                              {registration.user.grade && `, Grade: ${registration.user.grade}`}
                            </span>
                          )}
                          {registration.user.role === "TEACHER" && registration.user.department && (
                            <span className="text-sm text-muted-foreground">Dept: {registration.user.department}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(registration.status)}>{registration.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {registration.status !== "APPROVED" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUpdateStatus(registration.id, "APPROVED")}
                                disabled={isProcessing}
                                title="Approve"
                              >
                                <Check className="h-4 w-4 text-green-600" />
                              </Button>
                            )}
                            {registration.status !== "REJECTED" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUpdateStatus(registration.id, "REJECTED")}
                                disabled={isProcessing}
                                title="Reject"
                              >
                                <X className="h-4 w-4 text-red-600" />
                              </Button>
                            )}
                            {registration.status === "APPROVED" && registration.status !== "ATTENDED" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUpdateStatus(registration.id, "ATTENDED")}
                                disabled={isProcessing}
                                title="Mark as Attended"
                              >
                                <Check className="h-4 w-4 text-blue-600" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedRegistration(registration)
                                setShowDeleteDialog(true)
                              }}
                              disabled={isProcessing}
                              title="Delete Registration"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Registration</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the registration for "{selectedRegistration?.user.name}"? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isProcessing}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteRegistration} disabled={isProcessing}>
                {isProcessing ? "Deleting..." : "Delete Registration"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

