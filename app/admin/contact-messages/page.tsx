"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
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
import { Mail, Eye, Trash2 } from "lucide-react"
import { markContactMessageAsRead, deleteContactMessage } from "@/app/actions/contact"

export default function ContactMessagesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    // Redirect if not admin
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/admin/contact-messages")
      return
    }

    if (status === "authenticated") {
      if (session.user.role !== "ADMIN" && session.user.role !== "TEACHER") {
        router.push("/dashboard")
        return
      }

      fetchContactMessages()
    }
  }, [status, session, router])

  const fetchContactMessages = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/contact-messages")

      if (!response.ok) {
        throw new Error("Failed to fetch contact messages")
      }

      const data = await response.json()
      setMessages(data)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching contact messages:", err)
      setError("Failed to load contact messages. Please try again later.")
      setLoading(false)
    }
  }

  const handleViewMessage = async (message) => {
    setSelectedMessage(message)

    if (message.status === "UNREAD") {
      try {
        await markContactMessageAsRead(message.id)
        // Update the local state to reflect the change
        setMessages(messages.map((msg) => (msg.id === message.id ? { ...msg, status: "READ" } : msg)))
      } catch (err) {
        console.error("Error marking message as read:", err)
      }
    }
  }

  const handleDeleteMessage = async () => {
    if (!selectedMessage) return

    setIsProcessing(true)

    try {
      const result = await deleteContactMessage(selectedMessage.id)

      if (result.success) {
        // Remove the message from the local state
        setMessages(messages.filter((msg) => msg.id !== selectedMessage.id))
        setSelectedMessage(null)
        setShowDeleteDialog(false)
      } else if (result.error) {
        setError(result.error)
      }
    } catch (err) {
      console.error("Error deleting message:", err)
      setError("Failed to delete message. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-8 text-center">
        <p>Loading contact messages...</p>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">Contact Messages</CardTitle>
              <CardDescription>View and manage messages from the contact form</CardDescription>
            </div>
            <Badge variant="outline">{messages.filter((msg) => msg.status === "UNREAD").length} Unread</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {messages.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No contact messages found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map((message) => (
                  <TableRow key={message.id}>
                    <TableCell>
                      {message.status === "UNREAD" ? (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">Unread</Badge>
                      ) : (
                        <Badge variant="outline">Read</Badge>
                      )}
                    </TableCell>
                    <TableCell>{message.name}</TableCell>
                    <TableCell>{message.email}</TableCell>
                    <TableCell>{message.subject}</TableCell>
                    <TableCell>{new Date(message.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewMessage(message)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedMessage(message)
                            setShowDeleteDialog(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Message View Dialog */}
      {selectedMessage && (
        <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedMessage.subject}</DialogTitle>
              <DialogDescription>
                From: {selectedMessage.name} ({selectedMessage.email})
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 border-t border-b">
              <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
            </div>
            <div className="text-sm text-muted-foreground">
              Received on {new Date(selectedMessage.createdAt).toLocaleString()}
            </div>
            <DialogFooter>
              <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                Delete Message
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Message</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteMessage} disabled={isProcessing}>
              {isProcessing ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

