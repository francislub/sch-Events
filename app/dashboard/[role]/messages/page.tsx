"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Send, Search, Plus, User, Edit, Trash2, Check, X } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"

interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  createdAt: string
  sender: {
    id: string
    name: string
    role: string
  }
  receiver: {
    id: string
    name: string
    role: string
  }
}

interface Contact {
  id: string
  name: string
  role: string
  email: string
  lastMessage?: string
  lastMessageTime?: string
  unreadCount?: number
}

export default function MessagesPage({ params }: { params: { role: string } }) {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const role = params.role

  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [newContactDialogOpen, setNewContactDialogOpen] = useState(false)
  const [availableUsers, setAvailableUsers] = useState<any[]>([])
  const [selectedUserId, setSelectedUserId] = useState("")
  const [editingMessage, setEditingMessage] = useState<string | null>(null)
  const [editedContent, setEditedContent] = useState("")

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Check if session is loading
  useEffect(() => {
    if (status === "loading") {
      setIsLoading(true)
    } else {
      setIsLoading(false)
    }
  }, [status])

  // Fetch contacts
  useEffect(() => {
    const fetchContacts = async () => {
      if (status !== "authenticated" || !session?.user?.id) return

      try {
        const response = await fetch(`/api/messages/contacts`)

        if (!response.ok) {
          throw new Error("Failed to fetch contacts")
        }

        const data = await response.json()
        setContacts(data)

        // Select first contact by default if available
        if (data.length > 0 && !selectedContact) {
          setSelectedContact(data[0])
        }
      } catch (error) {
        console.error("Error fetching contacts:", error)
        toast({
          title: "Error",
          description: "Failed to load contacts. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchContacts()
  }, [session, toast, selectedContact, status])

  // Fetch messages for selected contact
  useEffect(() => {
    const fetchMessages = async () => {
      if (status !== "authenticated" || !session?.user?.id || !selectedContact) return

      try {
        const response = await fetch(`/api/messages?contactId=${selectedContact.id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch messages")
        }

        const data = await response.json()
        setMessages(data)
      } catch (error) {
        console.error("Error fetching messages:", error)
        toast({
          title: "Error",
          description: "Failed to load messages. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchMessages()
  }, [session, selectedContact, toast, status])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Fetch available users for new contact
  const fetchAvailableUsers = async () => {
    if (status !== "authenticated" || !session?.user?.id) return

    try {
      const response = await fetch(`/api/users?exclude=${session.user.id}`)

      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }

      const data = await response.json()
      setAvailableUsers(data)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle sending a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !selectedContact || status !== "authenticated") return

    setIsSending(true)

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverId: selectedContact.id,
          content: newMessage,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      const data = await response.json()

      // Add new message to the list
      setMessages((prev) => [...prev, data])

      // Clear input
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  // Handle editing a message
  const handleEditMessage = async (messageId: string) => {
    if (!editedContent.trim()) return

    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: editedContent,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update message")
      }

      // Update the message in the list
      setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, content: editedContent } : msg)))
      setEditingMessage(null)
      setEditedContent("")

      toast({
        title: "Success",
        description: "Message updated successfully",
      })
    } catch (error) {
      console.error("Error updating message:", error)
      toast({
        title: "Error",
        description: "Failed to update message. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle deleting a message
  const handleDeleteMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete message")
      }

      // Remove the message from the list
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId))

      toast({
        title: "Success",
        description: "Message deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting message:", error)
      toast({
        title: "Error",
        description: "Failed to delete message. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle adding a new contact
  const handleAddContact = async () => {
    if (!selectedUserId || status !== "authenticated") return

    try {
      const response = await fetch("/api/messages/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUserId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add contact")
      }

      const newContact = await response.json()

      // Add new contact to the list
      setContacts((prev) => [...prev, newContact])

      // Select the new contact
      setSelectedContact(newContact)

      // Close dialog
      setNewContactDialogOpen(false)

      toast({
        title: "Contact Added",
        description: "New contact has been added successfully.",
      })
    } catch (error) {
      console.error("Error adding contact:", error)
      toast({
        title: "Error",
        description: "Failed to add contact. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Filter contacts based on search query
  const filteredContacts = contacts.filter((contact) => contact.name.toLowerCase().includes(searchQuery.toLowerCase()))

  // Group contacts by role
  const studentContacts = filteredContacts.filter((contact) => contact.role === "STUDENT")
  const teacherContacts = filteredContacts.filter((contact) => contact.role === "TEACHER")
  const parentContacts = filteredContacts.filter((contact) => contact.role === "PARENT")
  const adminContacts = filteredContacts.filter((contact) => contact.role === "ADMIN")

  // Format date for display
  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, "h:mm a, MMM d")
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Authentication Required</h2>
          <p className="text-muted-foreground mt-2">Please sign in to access messages</p>
        </div>
      </div>
    )
  }

  // Determine which tabs to show based on user role
  const getTabs = () => {
    switch (role) {
      case "admin":
        return (
          <TabsList className="w-full justify-start px-4 pt-2">
            <TabsTrigger value="students" className="flex items-center gap-1">
              <User className="h-4 w-4" />
              Students
            </TabsTrigger>
            <TabsTrigger value="teachers" className="flex items-center gap-1">
              <User className="h-4 w-4" />
              Teachers
            </TabsTrigger>
            <TabsTrigger value="parents" className="flex items-center gap-1">
              <User className="h-4 w-4" />
              Parents
            </TabsTrigger>
          </TabsList>
        )
      case "teacher":
        return (
          <TabsList className="w-full justify-start px-4 pt-2">
            <TabsTrigger value="students" className="flex items-center gap-1">
              <User className="h-4 w-4" />
              Students
            </TabsTrigger>
            <TabsTrigger value="parents" className="flex items-center gap-1">
              <User className="h-4 w-4" />
              Parents
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-1">
              <User className="h-4 w-4" />
              Admin
            </TabsTrigger>
          </TabsList>
        )
      case "parent":
        return (
          <TabsList className="w-full justify-start px-4 pt-2">
            <TabsTrigger value="teachers" className="flex items-center gap-1">
              <User className="h-4 w-4" />
              Teachers
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-1">
              <User className="h-4 w-4" />
              Admin
            </TabsTrigger>
          </TabsList>
        )
      case "student":
        return (
          <TabsList className="w-full justify-start px-4 pt-2">
            <TabsTrigger value="teachers" className="flex items-center gap-1">
              <User className="h-4 w-4" />
              Teachers
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-1">
              <User className="h-4 w-4" />
              Admin
            </TabsTrigger>
            <TabsTrigger value="parents" className="flex items-center gap-1">
              <User className="h-4 w-4" />
              Parents
            </TabsTrigger>
          </TabsList>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">
          {role === "admin"
            ? "Communicate with students, teachers, and parents"
            : role === "teacher"
              ? "Communicate with students, parents, and administrators"
              : role === "parent"
                ? "Communicate with teachers and administrators"
                : "Communicate with teachers, administrators, and parents"}
        </p>
      </div>

      <Card className="h-[calc(100vh-12rem)]">
        <div className="grid h-full grid-cols-1 md:grid-cols-3">
          <div className="border-r">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Contacts</h3>
                <Dialog open={newContactDialogOpen} onOpenChange={setNewContactDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={fetchAvailableUsers}>
                      <Plus className="h-4 w-4" />
                      <span className="sr-only">Add Contact</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Contact</DialogTitle>
                      <DialogDescription>Select a user to add to your contacts</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="user">Select User</Label>
                        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a user" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableUsers.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.name} ({user.role})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setNewContactDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddContact} disabled={!selectedUserId}>
                        Add Contact
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <Tabs defaultValue={role === "admin" ? "students" : "teachers"} className="w-full">
              {getTabs()}

              <ScrollArea className="h-[calc(100vh-16rem)]">
                {role === "admin" && (
                  <TabsContent value="students" className="m-0">
                    {studentContacts.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">No student contacts found</div>
                    ) : (
                      <div>
                        {studentContacts.map((contact) => (
                          <div
                            key={contact.id}
                            className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted transition-colors ${
                              selectedContact?.id === contact.id ? "bg-muted" : ""
                            }`}
                            onClick={() => setSelectedContact(contact)}
                          >
                            <Avatar>
                              <AvatarFallback>{contact.name.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium">{contact.name}</div>
                              <div className="text-xs text-muted-foreground truncate">Student</div>
                            </div>
                            {contact.unreadCount && contact.unreadCount > 0 && (
                              <div className="ml-2 bg-primary text-primary-foreground rounded-full h-5 min-w-5 flex items-center justify-center text-xs">
                                {contact.unreadCount}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                )}

                <TabsContent value="teachers" className="m-0">
                  {teacherContacts.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">No teacher contacts found</div>
                  ) : (
                    <div>
                      {teacherContacts.map((contact) => (
                        <div
                          key={contact.id}
                          className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted transition-colors ${
                            selectedContact?.id === contact.id ? "bg-muted" : ""
                          }`}
                          onClick={() => setSelectedContact(contact)}
                        >
                          <Avatar>
                            <AvatarFallback>{contact.name.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{contact.name}</div>
                            <div className="text-xs text-muted-foreground truncate">Teacher</div>
                          </div>
                          {contact.unreadCount && contact.unreadCount > 0 && (
                            <div className="ml-2 bg-primary text-primary-foreground rounded-full h-5 min-w-5 flex items-center justify-center text-xs">
                              {contact.unreadCount}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="parents" className="m-0">
                  {parentContacts.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">No parent contacts found</div>
                  ) : (
                    <div>
                      {parentContacts.map((contact) => (
                        <div
                          key={contact.id}
                          className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted transition-colors ${
                            selectedContact?.id === contact.id ? "bg-muted" : ""
                          }`}
                          onClick={() => setSelectedContact(contact)}
                        >
                          <Avatar>
                            <AvatarFallback>{contact.name.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{contact.name}</div>
                            <div className="text-xs text-muted-foreground truncate">Parent</div>
                          </div>
                          {contact.unreadCount && contact.unreadCount > 0 && (
                            <div className="ml-2 bg-primary text-primary-foreground rounded-full h-5 min-w-5 flex items-center justify-center text-xs">
                              {contact.unreadCount}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="admin" className="m-0">
                  {adminContacts.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">No admin contacts found</div>
                  ) : (
                    <div>
                      {adminContacts.map((contact) => (
                        <div
                          key={contact.id}
                          className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted transition-colors ${
                            selectedContact?.id === contact.id ? "bg-muted" : ""
                          }`}
                          onClick={() => setSelectedContact(contact)}
                        >
                          <Avatar>
                            <AvatarFallback>{contact.name.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{contact.name}</div>
                            <div className="text-xs text-muted-foreground truncate">Administrator</div>
                          </div>
                          {contact.unreadCount && contact.unreadCount > 0 && (
                            <div className="ml-2 bg-primary text-primary-foreground rounded-full h-5 min-w-5 flex items-center justify-center text-xs">
                              {contact.unreadCount}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>

          <div className="col-span-2 flex flex-col h-full">
            {selectedContact ? (
              <>
                <div className="p-4 border-b flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{selectedContact.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{selectedContact.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {selectedContact.role === "TEACHER"
                        ? "Teacher"
                        : selectedContact.role === "STUDENT"
                          ? "Student"
                          : selectedContact.role === "ADMIN"
                            ? "Administrator"
                            : "Parent"}
                    </div>
                  </div>
                </div>

                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      messages.map((message) => {
                        const isCurrentUser = message.senderId === session?.user.id

                        return (
                          <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                            <div className="max-w-[70%]">
                              <div
                                className={`p-3 rounded-lg ${
                                  isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
                                }`}
                              >
                                {editingMessage === message.id ? (
                                  <div className="space-y-2">
                                    <Textarea
                                      value={editedContent}
                                      onChange={(e) => setEditedContent(e.target.value)}
                                      className="min-h-[60px] bg-background"
                                    />
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                          setEditingMessage(null)
                                          setEditedContent("")
                                        }}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                      <Button size="sm" onClick={() => handleEditMessage(message.id)}>
                                        <Check className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="text-sm">{message.content}</div>
                                    <div
                                      className={`text-xs mt-1 ${
                                        isCurrentUser ? "text-primary-foreground/80" : "text-muted-foreground"
                                      }`}
                                    >
                                      {formatMessageDate(message.createdAt)}
                                    </div>
                                    {isCurrentUser && (
                                      <div className="flex justify-end gap-2 mt-1">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-6 w-6 p-0"
                                          onClick={() => {
                                            setEditingMessage(message.id)
                                            setEditedContent(message.content)
                                          }}
                                        >
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive">
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>Delete Message</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                Are you sure you want to delete this message? This action cannot be
                                                undone.
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                                              <AlertDialogAction
                                                onClick={() => handleDeleteMessage(message.id)}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                              >
                                                Delete
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <div className="p-4 border-t">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={isSending}
                    />
                    <Button type="submit" size="icon" disabled={isSending || !newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Select a contact to start messaging
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

