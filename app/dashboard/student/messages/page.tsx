"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { Send, Search, User, Users } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function StudentMessages() {
  const { data: session } = useSession()
  const { toast } = useToast()

  const [contacts, setContacts] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [selectedContact, setSelectedContact] = useState<any>(null)
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch contacts
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch("/api/messages/contacts")
        if (!response.ok) {
          throw new Error("Failed to fetch contacts")
        }
        const data = await response.json()
        // Ensure contacts is an array
        setContacts(Array.isArray(data) ? data : [])
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching contacts:", error)
        toast({
          title: "Using sample contacts",
          description: "We're showing sample contacts while we connect to your data.",
          variant: "default",
        })
        // Initialize with mock data on error
        setContacts(generateMockContacts())
        setIsLoading(false)
      }
    }

    if (session) {
      fetchContacts()
    }
  }, [session, toast])

  // Generate mock contacts for development and fallback
  function generateMockContacts() {
    return [
      { id: "teacher1", name: "Ms. Johnson", role: "TEACHER", department: "Mathematics" },
      { id: "teacher2", name: "Mr. Smith", role: "TEACHER", department: "Science" },
      { id: "teacher3", name: "Mrs. Davis", role: "TEACHER", department: "English" },
      { id: "admin1", name: "Principal Wilson", role: "ADMIN" },
      { id: "admin2", name: "Vice Principal Thompson", role: "ADMIN" },
      { id: "parent1", name: "Your Parent", role: "PARENT" },
    ]
  }

  // Fetch messages when a contact is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedContact) return

      try {
        const response = await fetch(`/api/messages?conversationWith=${selectedContact.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch messages")
        }
        const data = await response.json()
        setMessages(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Error fetching messages:", error)
        toast({
          title: "Using sample messages",
          description: "We're showing sample messages while we connect to your data.",
          variant: "default",
        })
        setMessages(generateMockMessages(selectedContact.id))
      }
    }

    fetchMessages()
  }, [selectedContact, toast])

  // Generate mock messages for development and fallback
  function generateMockMessages(contactId: string) {
    const mockMessages = [
      {
        id: `mock-1-${contactId}`,
        content: "Hello, how are you doing in class?",
        senderId: contactId,
        senderName: contacts.find((c) => c.id === contactId)?.name || "Contact",
        receiverId: "currentUser",
        receiverName: "You",
        isRead: true,
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        currentUserId: "currentUser",
      },
      {
        id: `mock-2-${contactId}`,
        content: "I'm doing well, thank you for asking!",
        senderId: "currentUser",
        senderName: "You",
        receiverId: contactId,
        receiverName: contacts.find((c) => c.id === contactId)?.name || "Contact",
        isRead: true,
        createdAt: new Date(Date.now() - 3600000 * 23).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 23).toISOString(),
        currentUserId: "currentUser",
      },
      {
        id: `mock-3-${contactId}`,
        content: "Do you have any questions about the recent assignment?",
        senderId: contactId,
        senderName: contacts.find((c) => c.id === contactId)?.name || "Contact",
        receiverId: "currentUser",
        receiverName: "You",
        isRead: true,
        createdAt: new Date(Date.now() - 3600000 * 22).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 22).toISOString(),
        currentUserId: "currentUser",
      },
    ]
    return mockMessages
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Filter contacts based on search term
  const filteredContacts = contacts.filter((contact) => contact.name.toLowerCase().includes(searchTerm.toLowerCase()))

  // Group contacts by role
  const teacherContacts = filteredContacts.filter((contact) => contact.role === "TEACHER")
  const adminContacts = filteredContacts.filter((contact) => contact.role === "ADMIN")
  const parentContacts = filteredContacts.filter((contact) => contact.role === "PARENT")

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !selectedContact) return

    setIsSending(true)

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientId: selectedContact.id,
          content: newMessage,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to send message")
      }

      const data = await response.json()

      // Add the new message to the list
      setMessages((prev) => [...prev, data])
      setNewMessage("")
    } catch (error) {
      console.error("Send message error:", error)

      // Add the message locally even if the API fails
      const mockMessage = {
        id: `local-${Date.now()}`,
        content: newMessage,
        senderId: session?.user.id || "currentUser",
        senderName: session?.user.name || "You",
        receiverId: selectedContact.id,
        receiverName: selectedContact.name,
        isRead: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        currentUserId: session?.user.id || "currentUser",
      }

      setMessages((prev) => [...prev, mockMessage])
      setNewMessage("")

      toast({
        title: "Message saved locally",
        description: "Your message was saved locally but couldn't be sent to the server.",
        variant: "default",
      })
    } finally {
      setIsSending(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground">Loading your messages...</p>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">Communicate with teachers, administrators, and parents</p>
      </div>

      <Card className="h-[calc(100vh-12rem)]">
        <div className="grid h-full grid-cols-1 md:grid-cols-3">
          <div className="border-r">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <Tabs defaultValue="teachers" className="w-full">
              <TabsList className="w-full justify-start px-4 pt-2">
                <TabsTrigger value="teachers" className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Teachers
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Admin
                </TabsTrigger>
                <TabsTrigger value="parents" className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Parents
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[calc(100vh-16rem)]">
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
                            <div className="text-xs text-muted-foreground truncate">
                              {contact.department || "Teacher"}
                            </div>
                          </div>
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
                        ? selectedContact.department || "Teacher"
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
                        const isCurrentUser =
                          message.senderId === session?.user.id || message.senderId === "currentUser"

                        return (
                          <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
                              }`}
                            >
                              <div className="text-sm">{message.content}</div>
                              <div
                                className={`text-xs mt-1 ${
                                  isCurrentUser ? "text-primary-foreground/80" : "text-muted-foreground"
                                }`}
                              >
                                {format(new Date(message.createdAt), "h:mm a, MMM d")}
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
