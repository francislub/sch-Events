"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Send, User } from "lucide-react"

export default function ParentMessages() {
  const [selectedTeacher, setSelectedTeacher] = useState("")
  const [message, setMessage] = useState("")

  // Mock data for teachers
  const teachers = [
    { id: "1", name: "Ms. Johnson", subject: "Mathematics" },
    { id: "2", name: "Mr. Smith", subject: "Science" },
    { id: "3", name: "Mrs. Davis", subject: "English" },
    { id: "4", name: "Mr. Wilson", subject: "History" },
  ]

  // Mock data for messages
  const [messages, setMessages] = useState([
    {
      id: "1",
      sender: "You",
      recipient: "Ms. Johnson",
      content: "Hello, I wanted to discuss Sarah's recent math test.",
      timestamp: "2025-03-10T14:30:00",
    },
    {
      id: "2",
      sender: "Ms. Johnson",
      recipient: "You",
      content:
        "Hi there! I'd be happy to discuss Sarah's performance. She did well overall but struggled with some of the algebra problems.",
      timestamp: "2025-03-10T15:45:00",
    },
    {
      id: "3",
      sender: "You",
      recipient: "Ms. Johnson",
      content: "Thank you for the feedback. Is there anything we can do to help her improve in those areas?",
      timestamp: "2025-03-11T09:15:00",
    },
    {
      id: "4",
      sender: "Ms. Johnson",
      recipient: "You",
      content: "I'd recommend some additional practice with equations. I can provide some resources if you'd like.",
      timestamp: "2025-03-11T10:30:00",
    },
  ])

  const handleSendMessage = () => {
    if (!selectedTeacher || !message.trim()) return

    const newMessage = {
      id: Date.now().toString(),
      sender: "You",
      recipient: teachers.find((t) => t.id === selectedTeacher)?.name || "",
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
        <p className="text-muted-foreground">Communicate with your child's teachers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>New Message</CardTitle>
            <CardDescription>Send a message to a teacher</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teacher">Select Teacher</Label>
                <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name} - {teacher.subject}
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

              <Button className="w-full" onClick={handleSendMessage} disabled={!selectedTeacher || !message.trim()}>
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Message History</CardTitle>
            <CardDescription>Your conversations with teachers</CardDescription>
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
                  No messages yet. Start a conversation with a teacher.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

