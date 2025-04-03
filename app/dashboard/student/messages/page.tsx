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
          title: "Error",
          description: "Failed to load contacts. Please try again.",
          variant: "destructive",
        })
        // Initialize with empty array on error
        setContacts([])
        setIsLoading(false)
      }
    }

    if (session) {
      fetchContacts()
    }
  }, [session, toast])

  // Fetch messages when a contact is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedContact) return

      try {
        const response = await fetch(`/api/messages?contactId=${selectedContact.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch messages")
        }
        const data = await response.json()
        setMessages(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Error fetching messages:", error)
        toast({
          title: "Error",
          description: "Failed to load messages. Please try again.",
          variant: "destructive",
        })
        setMessages([])
      }
    }

    fetchMessages()
  }, [selectedContact, toast])

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
          receiverId: selectedContact.id,
          content: newMessage,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      const data = await response.json()

      // Add the new message to the list
      setMessages((prev) => [...prev, data])
      setNewMessage("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
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
                        const isCurrentUser = message.senderId === session?.user.id

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

