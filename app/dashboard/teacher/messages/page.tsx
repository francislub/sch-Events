"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Send, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function TeacherMessages() {
  const [selectedParent, setSelectedParent] = useState("")
  const [message, setMessage] = useState("")
  const [parents, setParents] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Fetch parents of students taught by the teacher
  useEffect(() => {
    const fetchParents = async () => {
      try {
        const response = await fetch("/api/parents/teacher")
        if (!response.ok) throw new Error("Failed to fetch parents")
        const data = await response.json()
        setParents(data)
      } catch (error) {
        console.error("Error fetching parents:", error)
        toast({
          title: "Error",
          description: "Failed to load parents. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchParents()
  }, [toast])

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/messages")
        if (!response.ok) throw new Error("Failed to fetch messages")
        const data = await response.json()
        setMessages(data)
      } catch (error) {
        console.error("Error fetching messages:", error)
        toast({
          title: "Error",
          description: "Failed to load messages. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessages()
  }, [toast])

  const handleSendMessage = async () => {
    if (!selectedParent || !message.trim()) return

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientId: selectedParent,
          content: message,
        }),
      })

      if (!response.ok) throw new Error("Failed to send message")

      const newMessage = await response.json()

      setMessages((prev) => [...prev, newMessage])
      setMessage("")

      toast({
        title: "Success",
        description: "Message sent successfully",
      })
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">Communicate with parents of your students</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>New Message</CardTitle>
            <CardDescription>Send a message to a parent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="parent">Select Parent</Label>
                <Select value={selectedParent} onValueChange={setSelectedParent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a parent" />
                  </SelectTrigger>
                  <SelectContent>
                    {parents.map((parent) => (
                      <SelectItem key={parent.id} value={parent.id}>
                        {parent.name} - {parent.children?.join(", ")}
                      </SelectItem>
                    ))}
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
                  className="min-h-[150px]"
                />
              </div>

              <Button className="w-full" onClick={handleSendMessage} disabled={!selectedParent || !message.trim()}>
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Message History</CardTitle>
            <CardDescription>Your conversations with parents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {messages.length > 0 ? (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === "You" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.sender === "You" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{msg.sender}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(msg.timestamp)}</span>
                      </div>
                      <p>{msg.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No messages yet. Start a conversation with a parent.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

