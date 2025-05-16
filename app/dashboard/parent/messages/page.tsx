"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send, User, Loader2, Search, Mail, Clock, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface Teacher {
  id: string
  userId: string
  firstName: string
  lastName: string
  department?: string
  subject?: string
  user?: {
    name: string
    email: string
    image?: string
  }
}

interface Conversation {
  user: {
    id: string
    name: string
    role: string
    image?: string
  }
  lastMessage: {
    id: string
    content: string
    createdAt: string
    senderId: string
    recipientId: string
  }
  unreadCount: number
}

interface Message {
  id: string
  content: string
  createdAt: string
  senderId: string
  recipientId: string
  read: boolean
}

export default function ParentMessages() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [selectedTeacherId, setSelectedTeacherId] = useState("")
  const [message, setMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([])
  const [currentMessages, setCurrentMessages] = useState<Message[]>([])
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [activeTab, setActiveTab] = useState("inbox")

  // Fetch teachers when component mounts
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    const fetchTeachers = async () => {
      setIsLoadingTeachers(true)
      try {
        const response = await fetch("/api/teachers")
        if (!response.ok) {
          throw new Error(`Failed to fetch teachers: ${response.status}`)
        }

        const data = await response.json()
        console.log("Teachers data:", data)

        if (Array.isArray(data)) {
          setTeachers(data)
        } else {
          console.error("Teachers data is not an array:", data)
          setTeachers([])
        }
      } catch (error) {
        console.error("Error fetching teachers:", error)
        toast({
          title: "Error",
          description: "Failed to load teachers. Please refresh the page.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingTeachers(false)
      }
    }

    const fetchConversations = async () => {
      try {
        const response = await fetch("/api/messages/contacts")
        if (!response.ok) {
          throw new Error(`Failed to fetch conversations: ${response.status}`)
        }

        const data = await response.json()
        console.log("Conversations data:", data)

        if (data.success && Array.isArray(data.data)) {
          setConversations(data.data)
          setFilteredConversations(data.data)
        } else {
          console.error("Conversations data is invalid:", data)
          setConversations([])
          setFilteredConversations([])
        }
      } catch (error) {
        console.error("Error fetching conversations:", error)
        toast({
          title: "Error",
          description: "Failed to load conversations. Please refresh the page.",
          variant: "destructive",
        })
      }
    }

    if (status === "authenticated") {
      fetchTeachers()
      fetchConversations()
    }
  }, [status, router, toast])

  // Filter conversations when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredConversations(conversations)
      return
    }

    const filtered = conversations.filter(
      (conv) =>
        conv.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (conv.lastMessage?.content && conv.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase())),
    )
    setFilteredConversations(filtered)
  }, [searchQuery, conversations])

  // Fetch messages when a teacher is selected
  useEffect(() => {
    if (!selectedTeacherId) {
      setCurrentMessages([])
      return
    }

    const fetchMessages = async () => {
      setIsLoadingMessages(true)
      try {
        const response = await fetch(`/api/messages?conversationWith=${selectedTeacherId}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch messages: ${response.status}`)
        }

        const data = await response.json()
        console.log("Messages data:", data)

        if (data.success && Array.isArray(data.data)) {
          setCurrentMessages(data.data)

          // Mark messages as read
          if (data.data.some((msg: Message) => !msg.read && msg.recipientId === session?.user.id)) {
            try {
              await fetch(`/api/messages/${selectedTeacherId}`, {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ read: true }),
              })

              // Update unread count in conversations
              setConversations((prev) =>
                prev.map((conv) => (conv.user.id === selectedTeacherId ? { ...conv, unreadCount: 0 } : conv)),
              )
              setFilteredConversations((prev) =>
                prev.map((conv) => (conv.user.id === selectedTeacherId ? { ...conv, unreadCount: 0 } : conv)),
              )
            } catch (error) {
              console.error("Error marking messages as read:", error)
            }
          }
        } else {
          console.error("Messages data is invalid:", data)
          setCurrentMessages([])
        }
      } catch (error) {
        console.error("Error fetching messages:", error)
        toast({
          title: "Error",
          description: "Failed to load messages. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingMessages(false)
      }
    }

    fetchMessages()
  }, [selectedTeacherId, toast, session?.user.id])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [currentMessages])

  const handleSendMessage = async () => {
    if (!selectedTeacherId || !message.trim()) {
      return
    }

    setIsSending(true)
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientId: selectedTeacherId,
          content: message.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to send message: ${response.status}`)
      }

      const data = await response.json()
      console.log("Message sent:", data)

      // Add the new message to the current messages
      if (data.success && data.message) {
        setCurrentMessages((prev) => [...prev, data.message])
        setMessage("")

        // Update conversations list
        const updatedConversations = [...conversations]
        const existingConversation = updatedConversations.find((conv) => conv.user.id === selectedTeacherId)

        if (existingConversation) {
          existingConversation.lastMessage = data.message
        } else {
          const teacher = teachers.find((t) => t.id === selectedTeacherId || t.userId === selectedTeacherId)
          if (teacher) {
            updatedConversations.push({
              user: {
                id: teacher.id || teacher.userId,
                name: teacher.user?.name || `${teacher.firstName || ""} ${teacher.lastName || ""}`,
                role: "TEACHER",
                image: teacher.user?.image,
              },
              lastMessage: data.message,
              unreadCount: 0,
            })
          }
        }

        setConversations(updatedConversations)
        setFilteredConversations(updatedConversations)
      }

      toast({
        title: "Success",
        description: "Message sent successfully.",
      })
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)

    // If today, show time only
    if (date.toDateString() === now.toDateString()) {
      return new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(date)
    }

    // If yesterday, show "Yesterday" and time
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(date)}`
    }

    // Otherwise show date and time
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find((t) => t.id === teacherId || t.userId === teacherId)
    if (teacher) {
      if (teacher.user?.name) {
        return teacher.user.name
      } else if (teacher.firstName || teacher.lastName) {
        return `${teacher.firstName || ""} ${teacher.lastName || ""}`
      }
    }
    return "Unknown Teacher"
  }

  const getTeacherImage = (teacherId: string) => {
    const teacher = teachers.find((t) => t.id === teacherId || t.userId === teacherId)
    return teacher?.user?.image || null
  }

  const getTeacherInitials = (teacherId: string) => {
    const teacher = teachers.find((t) => t.id === teacherId || t.userId === teacherId)
    if (teacher) {
      if (teacher.user?.name) {
        const nameParts = teacher.user.name.split(" ")
        return nameParts.length > 1
          ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
          : teacher.user.name.substring(0, 2).toUpperCase()
      } else if (teacher.firstName && teacher.lastName) {
        return `${teacher.firstName[0]}${teacher.lastName[0]}`
      } else if (teacher.firstName) {
        return teacher.firstName.substring(0, 2).toUpperCase()
      }
    }
    return "UN"
  }

  const getConversationName = (conversation: Conversation) => {
    if (conversation.user?.name) {
      return conversation.user.name
    } else if (conversation.user?.firstName || conversation.user?.lastName) {
      return `${conversation.user?.firstName || ""} ${conversation.user?.lastName || ""}`
    }
    return "Unknown Contact"
  }

  const getConversationInitials = (conversation: Conversation) => {
    if (conversation.user?.name) {
      const nameParts = conversation.user.name.split(" ")
      return nameParts.length > 1
        ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
        : conversation.user.name.substring(0, 2).toUpperCase()
    }
    return "UN"
  }

  const getTotalUnreadCount = () => {
    return conversations.reduce((total, conv) => total + (conv.unreadCount || 0), 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground">Communicate with your child's teachers</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
            {getTotalUnreadCount()} Unread Messages
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader className="bg-slate-50 rounded-t-lg">
            <CardTitle className="flex items-center">
              <Mail className="mr-2 h-5 w-5 text-slate-600" />
              New Message
            </CardTitle>
            <CardDescription>Send a message to a teacher</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teacher">Select Teacher</Label>
                <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId} disabled={isLoadingTeachers}>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingTeachers ? "Loading teachers..." : "Select a teacher"} />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingTeachers ? (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Loading teachers...
                      </div>
                    ) : teachers.length > 0 ? (
                      teachers.map((teacher) => (
                        <SelectItem key={teacher.id || teacher.userId} value={teacher.id || teacher.userId}>
                          {teacher.user?.name || `${teacher.firstName || ""} ${teacher.lastName || ""}`}
                          {teacher.subject
                            ? ` - ${teacher.subject}`
                            : teacher.department
                              ? ` - ${teacher.department}`
                              : ""}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-teachers" disabled>
                        No teachers available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Type your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[150px] resize-none"
                  disabled={!selectedTeacherId || isSending}
                />
              </div>

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={handleSendMessage}
                disabled={!selectedTeacherId || !message.trim() || isSending}
              >
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="bg-slate-50 rounded-t-lg">
            <div className="flex flex-col md:flex-row justify-between gap-2">
              <div>
                <CardTitle className="flex items-center">
                  {selectedTeacherId ? (
                    <>
                      <User className="mr-2 h-5 w-5 text-slate-600" />
                      Conversation with {getTeacherName(selectedTeacherId)}
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-5 w-5 text-slate-600" />
                      Message History
                    </>
                  )}
                </CardTitle>
                <CardDescription>
                  {selectedTeacherId ? "Your conversation history" : "Select a teacher to view or start a conversation"}
                </CardDescription>
              </div>
              {!selectedTeacherId && (
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search messages..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {!selectedTeacherId ? (
              <div>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="w-full rounded-none border-b">
                    <TabsTrigger value="inbox" className="flex-1 relative">
                      Inbox
                      {getTotalUnreadCount() > 0 && <Badge className="ml-2 bg-blue-500">{getTotalUnreadCount()}</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="recent" className="flex-1">
                      Recent
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="inbox" className="p-0">
                    <div className="max-h-[500px] overflow-y-auto">
                      {isLoadingMessages ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mr-2" />
                          <span>Loading conversations...</span>
                        </div>
                      ) : filteredConversations.length > 0 ? (
                        filteredConversations.map((conversation) => (
                          <div
                            key={conversation.user.id}
                            className={`p-4 border-b hover:bg-slate-50 cursor-pointer transition-colors ${
                              conversation.unreadCount > 0 ? "bg-blue-50" : ""
                            }`}
                            onClick={() => setSelectedTeacherId(conversation.user.id)}
                          >
                            <div className="flex items-start gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage
                                  src={conversation.user.image || "/placeholder.svg"}
                                  alt={getConversationName(conversation)}
                                />
                                <AvatarFallback className="bg-blue-100 text-blue-700">
                                  {getConversationInitials(conversation)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <h4
                                    className={`font-medium truncate ${conversation.unreadCount > 0 ? "text-blue-700" : ""}`}
                                  >
                                    {getConversationName(conversation)}
                                  </h4>
                                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                    {conversation.lastMessage?.createdAt
                                      ? formatDate(conversation.lastMessage.createdAt)
                                      : ""}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground truncate max-w-full">
                                  {conversation.lastMessage?.content || "No messages yet"}
                                </p>
                                <div className="flex items-center mt-1">
                                  {conversation.unreadCount > 0 ? (
                                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                                      {conversation.unreadCount} new
                                    </Badge>
                                  ) : (
                                    <span className="text-xs flex items-center text-green-600">
                                      <CheckCircle2 className="h-3 w-3 mr-1" /> Read
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                          <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                          <p className="text-muted-foreground mb-2">
                            {searchQuery ? "No conversations match your search" : "No conversations yet"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {searchQuery ? "Try a different search term" : "Start a new message by selecting a teacher"}
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="recent" className="p-0">
                    <div className="max-h-[500px] overflow-y-auto">
                      {filteredConversations.length > 0 ? (
                        [...filteredConversations]
                          .sort((a, b) => {
                            const dateA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt) : new Date(0)
                            const dateB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt) : new Date(0)
                            return dateB.getTime() - dateA.getTime()
                          })
                          .slice(0, 5)
                          .map((conversation) => (
                            <div
                              key={conversation.user.id}
                              className="p-4 border-b hover:bg-slate-50 cursor-pointer transition-colors"
                              onClick={() => setSelectedTeacherId(conversation.user.id)}
                            >
                              <div className="flex items-start gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage
                                    src={conversation.user.image || "/placeholder.svg"}
                                    alt={getConversationName(conversation)}
                                  />
                                  <AvatarFallback className="bg-blue-100 text-blue-700">
                                    {getConversationInitials(conversation)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start">
                                    <h4 className="font-medium truncate">{getConversationName(conversation)}</h4>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                      {conversation.lastMessage?.createdAt
                                        ? formatDate(conversation.lastMessage.createdAt)
                                        : ""}
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground truncate max-w-full">
                                    {conversation.lastMessage?.content || "No messages yet"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                          <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">No recent conversations</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="flex flex-col h-[600px]">
                <div className="flex-1 overflow-y-auto p-4">
                  {isLoadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Loading messages...</span>
                    </div>
                  ) : currentMessages.length > 0 ? (
                    <div className="space-y-4">
                      {currentMessages.map((msg, index) => {
                        const isFirstInGroup = index === 0 || currentMessages[index - 1].senderId !== msg.senderId
                        const isLastInGroup =
                          index === currentMessages.length - 1 || currentMessages[index + 1].senderId !== msg.senderId

                        return (
                          <div
                            key={msg.id}
                            className={`flex ${msg.senderId === session?.user.id ? "justify-end" : "justify-start"}`}
                          >
                            {msg.senderId !== session?.user.id && isFirstInGroup && (
                              <Avatar className="h-8 w-8 mr-2 mt-1">
                                <AvatarImage
                                  src={getTeacherImage(msg.senderId) || "/placeholder.svg"}
                                  alt={getTeacherName(msg.senderId)}
                                />
                                <AvatarFallback className="bg-slate-200 text-slate-700">
                                  {getTeacherInitials(msg.senderId)}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            {msg.senderId !== session?.user.id && !isFirstInGroup && <div className="w-8 mr-2"></div>}

                            <div
                              className={`max-w-[80%] rounded-lg p-3 ${
                                isFirstInGroup
                                  ? msg.senderId === session?.user.id
                                    ? "rounded-tr-none"
                                    : "rounded-tl-none"
                                  : msg.senderId === session?.user.id
                                    ? "rounded-r-none"
                                    : "rounded-l-none"
                              } ${
                                isLastInGroup
                                  ? msg.senderId === session?.user.id
                                    ? "rounded-br-none"
                                    : "rounded-bl-none"
                                  : msg.senderId === session?.user.id
                                    ? "rounded-r-none"
                                    : "rounded-l-none"
                              } ${
                                msg.senderId === session?.user.id
                                  ? "bg-blue-500 text-white"
                                  : "bg-slate-100 text-slate-800"
                              }`}
                            >
                              {isFirstInGroup && (
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm">
                                    {msg.senderId === session?.user.id ? "You" : getTeacherName(msg.senderId)}
                                  </span>
                                  <span
                                    className={`text-xs ${msg.senderId === session?.user.id ? "text-blue-100" : "text-slate-500"}`}
                                  >
                                    {formatDate(msg.createdAt)}
                                  </span>
                                </div>
                              )}
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                            </div>
                          </div>
                        )
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-2">No messages yet</p>
                      <p className="text-sm text-muted-foreground">
                        Start the conversation by sending a message to {getTeacherName(selectedTeacherId)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="border-t p-4 bg-slate-50">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder={`Message ${getTeacherName(selectedTeacherId)}...`}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="min-h-[80px] resize-none"
                      disabled={isSending}
                    />
                    <Button
                      className="self-end bg-blue-600 hover:bg-blue-700"
                      size="icon"
                      onClick={handleSendMessage}
                      disabled={!message.trim() || isSending}
                    >
                      {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          {!selectedTeacherId && (
            <CardFooter className="border-t bg-slate-50 flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {filteredConversations.length} conversation{filteredConversations.length !== 1 ? "s" : ""}
              </span>
              {searchQuery && (
                <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")}>
                  Clear search
                </Button>
              )}
            </CardFooter>
          )}
          {selectedTeacherId && (
            <CardFooter className="border-t bg-slate-50">
              <Button variant="outline" size="sm" onClick={() => setSelectedTeacherId("")}>
                Back to conversations
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}
