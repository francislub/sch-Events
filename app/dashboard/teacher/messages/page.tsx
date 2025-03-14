"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Send, User } from "lucide-react"

export default function TeacherMessages() {
  const [selectedParent, setSelectedParent] = useState("")
  const [message, setMessage] = useState("")

  // Mock data for parents
  const parents = [
    { id: "1", name: "John Doe", children: ["Sarah Doe (Grade 10A)"] },
    { id: "2", name: "Jane Smith", children: ["Michael Smith (Grade 10A)"] },
    { id: "3", name: "Robert Johnson", children: ["Emily Johnson (Grade 9B)"] },
    { id: "4", name: "Mary Wilson", children: ["David Wilson (Grade 11C)"] },
  ]

  // Mock data for messages
  const [messages, setMessages] = useState([
    {
      id: "1",
      sender: "John Doe",
      recipient: "You",
      content: "Hello, I wanted to discuss Sarah's recent math test.",
      timestamp: "2025-03-10T14:30:00",
    },
    {
      id: "2",
      sender: "You",
      recipient: "John Doe",
      content:
        "Hi there! I'd be happy to discuss Sarah's performance. She did well overall but struggled with some of the algebra problems.",
      timestamp: "2025-03-10T15:45:00",
    },
    {
      id: "3",
      sender: "John Doe",
      recipient: "You",
      content: "Thank you for the feedback. Is there anything we can do to help her improve in those areas?",
      timestamp: "2025-03-11T09:15:00",
    },
    {
      id: "4",
      sender: "You",
      recipient: "John Doe",
      content: "I'd recommend some additional practice with equations. I can provide some resources if you'd like.",
      timestamp: "2025-03-11T10:30:00",
    },
  ])

  const handleSendMessage = () => {
    if (!selectedParent || !message.trim()) return

    const newMessage = {
      id: Date.now().toString(),
      sender: "You",
      recipient: parents.find((p) => p.id === selectedParent)?.name || "",
      content: message,
      timestamp: new Date().toISOString(),
    }

    setMessages([...messages, newMessage])
    setMessage("")
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
                        {parent.name} - {parent.children.join(", ")}
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

