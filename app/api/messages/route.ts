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

    // Get all messages where the user is either sender or receiver
    const messages = await db.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
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
  } catch (error) {
    console.error("Error fetching messages:", error)
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

    const { recipientId, content } = await req.json()

    if (!recipientId || !content) {
      return NextResponse.json({ error: "Recipient ID and content are required" }, { status: 400 })
    }

    const senderId = session.user.id

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
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}

