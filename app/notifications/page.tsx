"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bell, Check, Trash2 } from "lucide-react"

export default function NotificationsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [markingAll, setMarkingAll] = useState(false)

  useEffect(() => {
    // Redirect if not authenticated
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/notifications")
      return
    }

    if (status === "authenticated") {
      fetchNotifications()
    }
  }, [status, router])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/notifications")

      if (!response.ok) {
        throw new Error("Failed to fetch notifications")
      }

      const data = await response.json()
      setNotifications(data)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching notifications:", err)
      setError("Failed to load notifications. Please try again later.")
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isRead: true }),
      })

      if (!response.ok) {
        throw new Error("Failed to mark notification as read")
      }

      // Update the notification in the state
      setNotifications(
        notifications.map((notification) =>
          notification.id === notificationId ? { ...notification, isRead: true } : notification,
        ),
      )
    } catch (err) {
      console.error("Error marking notification as read:", err)
      setError("Failed to mark notification as read. Please try again.")
    }
  }

  const handleDeleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete notification")
      }

      // Remove the notification from the state
      setNotifications(notifications.filter((notification) => notification.id !== notificationId))
    } catch (err) {
      console.error("Error deleting notification:", err)
      setError("Failed to delete notification. Please try again.")
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAll(true)
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read")
      }

      // Update all notifications in the state
      setNotifications(notifications.map((notification) => ({ ...notification, isRead: true })))
    } catch (err) {
      console.error("Error marking all notifications as read:", err)
      setError("Failed to mark all notifications as read. Please try again.")
    } finally {
      setMarkingAll(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
      // Today
      return `Today at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    } else if (diffInDays === 1) {
      // Yesterday
      return `Yesterday at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    } else if (diffInDays < 7) {
      // Within a week
      return `${diffInDays} days ago`
    } else {
      // More than a week
      return date.toLocaleDateString()
    }
  }

  if (loading) {
    return (
      <div className="container py-8 text-center">
        <p>Loading notifications...</p>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground">Stay updated with your events and activities</p>
          </div>
          {notifications.length > 0 && notifications.some((notification) => !notification.isRead) && (
            <Button variant="outline" onClick={handleMarkAllAsRead} disabled={markingAll}>
              <Check className="mr-2 h-4 w-4" />
              {markingAll ? "Marking..." : "Mark All as Read"}
            </Button>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {notifications.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Notifications</h2>
              <p className="text-muted-foreground">You don't have any notifications at the moment. Check back later!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={notification.isRead ? "bg-card" : "bg-primary/5 border-primary/20"}
              >
                <CardContent className="p-4 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {!notification.isRead && <div className="h-2 w-2 rounded-full bg-primary" />}
                      <p className="text-sm font-medium">{notification.message}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatDate(notification.createdAt)}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {!notification.isRead && (
                      <Button variant="ghost" size="sm" onClick={() => handleMarkAsRead(notification.id)}>
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteNotification(notification.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

