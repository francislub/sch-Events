import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET messages for the current user
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const { searchParams } = new URL(req.url)
    const conversationWith = searchParams.get("conversationWith")

    // If no conversationWith parameter, return an empty array
    if (!conversationWith) {
      return NextResponse.json([])
    }

    try {
      // Get all messages between the current user and the specified user
      const messages = await db.message.findMany({
        where: {
          OR: [
            {
              senderId: userId,
              receiverId: conversationWith,
            },
            {
              senderId: conversationWith,
              receiverId: userId,
            },
          ],
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
          receiver: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      })

      // Format messages for the frontend
      const formattedMessages = messages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        senderId: msg.senderId,
        senderName: msg.sender.name,
        receiverId: msg.receiverId,
        receiverName: msg.receiver.name,
        isRead: msg.isRead,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt,
        currentUserId: userId, // Add this to help frontend determine message direction
      }))

      return NextResponse.json(formattedMessages)
    } catch (dbError) {
      console.error("Database error:", dbError)

      // Return mock data for development
      return NextResponse.json(generateMockMessages(userId, conversationWith))
    }
  } catch (error) {
    console.error("Error fetching messages:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

// POST a new message
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Safely parse the request body
    let body
    try {
      body = await req.json()
    } catch (parseError) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { recipientId, content } = body || {}

    if (!recipientId || !content) {
      return NextResponse.json({ error: "Recipient ID and content are required" }, { status: 400 })
    }

    const senderId = session.user.id

    try {
      // Create the message
      const message = await db.message.create({
        data: {
          content,
          senderId,
          receiverId: recipientId,
          isRead: false,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
            },
          },
          receiver: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      // Format the message for the frontend
      const formattedMessage = {
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        senderName: message.sender.name,
        receiverId: message.receiverId,
        receiverName: message.receiver.name,
        isRead: message.isRead,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
        currentUserId: senderId,
      }

      return NextResponse.json(formattedMessage)
    } catch (dbError) {
      console.error("Database error:", dbError)

      // Return mock data for development
      const mockMessage = {
        id: `mock-${Date.now()}`,
        content,
        senderId,
        senderName: session.user.name || "Current User",
        receiverId: recipientId,
        receiverName: "Recipient",
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        currentUserId: senderId,
      }

      return NextResponse.json(mockMessage)
    }
  } catch (error) {
    // Safely log error
    console.error("Error sending message:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}

// Helper function to generate mock messages
function generateMockMessages(userId: string, otherUserId: string) {
  return [
    {
      id: `mock-1-${otherUserId}`,
      content: "Hello, how are you doing in class?",
      senderId: otherUserId,
      senderName: "Teacher",
      receiverId: userId,
      receiverName: "Student",
      isRead: true,
      createdAt: new Date(Date.now() - 3600000 * 24),
      updatedAt: new Date(Date.now() - 3600000 * 24),
      currentUserId: userId,
    },
    {
      id: `mock-2-${otherUserId}`,
      content: "I'm doing well, thank you for asking!",
      senderId: userId,
      senderName: "Student",
      receiverId: otherUserId,
      receiverName: "Teacher",
      isRead: true,
      createdAt: new Date(Date.now() - 3600000 * 23),
      updatedAt: new Date(Date.now() - 3600000 * 23),
      currentUserId: userId,
    },
    {
      id: `mock-3-${otherUserId}`,
      content: "Do you have any questions about the recent assignment?",
      senderId: otherUserId,
      senderName: "Teacher",
      receiverId: userId,
      receiverName: "Student",
      isRead: true,
      createdAt: new Date(Date.now() - 3600000 * 22),
      updatedAt: new Date(Date.now() - 3600000 * 22),
      currentUserId: userId,
    },
  ]
}
