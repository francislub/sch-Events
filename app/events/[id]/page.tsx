"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock, MapPin, Users, Share2, Calendar, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { registerForEvent, cancelRegistration, deleteEvent } from "@/app/actions/events"

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (params.id) {
      fetchEventDetails(params.id);
    }
  }, [params.id]);

  const fetchEventDetails = async (eventId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/events/${eventId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch event details");
      }
      
      const data = await response.json();
      setEvent(data);
      setRegistrationStatus(data.registrationStatus);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching event details:", err);
      setError("Failed to load event details. Please try again later.");
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!session) {
      router.push(`/auth/login?callbackUrl=/events/${params.id}`);
      return;
    }
    
    setIsRegistering(true);
    setActionError("");
    
    try {
      const result = await registerForEvent(params.id);
      
      if (result.success) {
        setRegistrationStatus("APPROVED");
        // Refresh event data to update registration count
        fetchEventDetails(params.id);
      } else if (result.error) {
        setActionError(result.error);
      }
    } catch (err) {
      console.error("Registration error:", err);
      setActionError("Failed to register for event. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    setIsRegistering(true);
    setActionError("");
    
    try {
      const result = await cancelRegistration(params.id);
      
      if (result.success) {
        setRegistrationStatus(null);
        // Refresh event data to update registration count
        fetchEventDetails(params.id);
      } else if (result.error) {
        setActionError(result.error);
      }
    } catch (err) {
      console.error("Registration cancellation error:", err);
      setActionError("Failed to cancel registration. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleDeleteEvent = async () => {
    setIsDeleting(true);
    setActionError("");
    
    try {
      const result = await deleteEvent(params.id);
      
      if (result.success) {
        router.push("/events?deleted=true");
      } else if (result.error) {
        setActionError(result.error);
      }
    } catch (err) {
      console.error("Event deletion error:", err);
      setActionError("Failed to delete event. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-8 text-center">
        <p>Loading event details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
        <p className="mb-6">The event you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link href="/events">Browse Events</Link>
        </Button>
      </div>
    );
  }

  // Format the date
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Check if the current user can edit this event
  const canEdit = event.canEdit;

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        {actionError && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{actionError}</AlertDescription>
          </Alert>
        )}
        
        {/* Event Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">{event.category}</Badge>
                <span className="text-sm text-muted-foreground">
                  {event.registrations} / {event.capacity || "∞"} Registered
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              
              {canEdit && (
                <>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/events/${event.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
          
          <div className="aspect-[21/9] overflow-hidden rounded-lg mb-6">
            <img 
              src={event.image || "/placeholder.svg?height=300&width=800"} 
              alt={event.title} 
              className="object-cover w-full h-full"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Date</p>
                  <p className="text-sm text-muted-foreground">{formattedDate}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Time</p>
                  <p className="text-sm text-muted-foreground">{event.startTime} - {event.endTime}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">{event.location}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Event Content */}
        <Tabs defaultValue="details" className="mb-8">
          <TabsList className="mb-6">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="attendees">Attendees</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Event Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  {event.description.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">{paragraph}</p>
                  ))}
                
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Organizer</h3>
                    <p className="text-muted-foreground">{event.organizer}</p>
                    <p className="text-muted-foreground">{event.contact}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Registration</h3>
                    <p className="text-muted-foreground">
                      Registration Deadline: {event.registrationDeadline ? 
                        new Date(event.registrationDeadline).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        }) : 
                        'Open until event starts'
                      }
                    </p>
                    <p className="text-muted-foreground">
                      Available Spots: {event.capacity ? 
                        `${event.capacity - event.registrations} of ${event.capacity}` : 
                        'Unlimited'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                {registrationStatus ? (
                  <div className="w-full">
                    <div className="flex items-center justify-center mb-4">
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        {registrationStatus === "PENDING" ? "Registration Pending Approval" : "Registered"}
                      </Badge>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleCancelRegistration}
                      disabled={isRegistering}
                    >
                      {isRegistering ? "Processing..." : "Cancel Registration"}
                    </Button>
                  </div>
                ) : (
                  <Button 
                    className="w-full"
                    onClick={handleRegister}
                    disabled={isRegistering}
                  >
                    {isRegistering ? "Processing..." : "Register for this Event"}
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle>Event Schedule</CardTitle>
                <CardDescription>
                  Detailed timeline of activities for the day
                </CardDescription>
              </CardHeader>
              <CardContent>
                {event.schedule && event.schedule.length > 0 ? (
                  <div className="space-y-6">
                    {event.schedule.map((item, index) => (
                      <div key={item.id} className="flex">
                        <div className="mr-4 flex flex-col items-center">
                          <div className="h-2 w-2 rounded-full bg-primary"></div>
                          {index < event.schedule.length - 1 && <div className="h-full w-px bg-border"></div>}
                        </div>
                        <div className="pb-6">
                          <h3 className="font-medium">{item.title}</h3>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{item.startTime} - {item.endTime}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              <span>{item.location}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No detailed schedule available for this event.</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Add to Calendar
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="attendees">
            <Card>
              <CardHeader>
                <CardTitle>Registered Attendees</CardTitle>
                <CardDescription>
                  {event.registrations} people have registered for this event
                </CardDescription>
              </CardHeader>
              <CardContent>
                {event.attendees && event.attendees.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-3 font-medium">Name</th>
                          <th className="text-left p-3 font-medium">Role</th>
                          <th className="text-left p-3 font-medium">Class/Dept</th>
                          <th className="text-left p-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {event.attendees.map((attendee) => (
                          <tr key={attendee.id} className="border-t">
                            <td className="p-3">{attendee.name}</td>
                            <td className="p-3">{attendee.role}</td>
                            <td className="p-3">{attendee.class || attendee.department || "-"}</td>
                            <td className="p-3">
                              <Badge variant="outline" className={
                                attendee.status === "APPROVED" ? "bg-green-50 text-green-700 border-green-200" :
                                attendee.status === "PENDING" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                                "bg-red-50 text-red-700 border-red-200"
                              }>
                                {attendee.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No attendees have registered for this event yet.</p>
                  </div>
                )}
                
                {event.attendees && event.attendees.length > 0 && event.registrations > event.attendees.length && (
                  <div className="text-center mt-4 text-sm text-muted-foreground">
                    Showing {event.attendees.length} of {event.registrations} attendees
                  </div>
                )}
              </CardContent>
              {canEdit && event.attendees && event.attendees.length > 0 && (
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/dashboard/events/${event.id}/attendees`}>
                      <Users className="h-4 w-4 mr-2" />
                      Manage Attendees
                    </Link>
                  </Button>
                </CardFooter>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteEvent}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

