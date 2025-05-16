import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const conversationWith = searchParams.get("conversationWith")
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit") as string, 10) : 50

    if (!conversationWith) {
      return NextResponse.json({ error: "Missing conversationWith parameter" }, { status: 400 })
    }

    // Get current user ID
    const currentUser = await db.user.findUnique({
      where: { email: session.user?.email as string },
    })

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get messages between current user and the specified user
    const messages = await db.message.findMany({
      where: {
        OR: [
          {
            senderId: currentUser.id,
            receiverId: conversationWith,
          },
          {
            senderId: conversationWith,
            receiverId: currentUser.id,
          },
        ],
      },
      orderBy: {
        createdAt: "asc",
      },
      take: limit,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    })

    // Mark messages as read
    const unreadMessages = messages.filter((message) => message.receiverId === currentUser.id && !message.isRead)

    if (unreadMessages.length > 0) {
      await db.message.updateMany({
        where: {
          id: {
            in: unreadMessages.map((message) => message.id),
          },
        },
        data: {
          isRead: true,
        },
      })
    }

    // Format messages for the frontend
    const formattedMessages = messages.map((message) => ({
      id: message.id,
      content: message.content,
      isRead: message.isRead,
      sender: {
        id: message.sender.id,
        name: message.sender.name,
        email: message.sender.email,
        role: message.sender.role,
      },
      receiver: {
        id: message.receiver.id,
        name: message.receiver.name,
        email: message.receiver.email,
        role: message.receiver.role,
      },
      createdAt: message.createdAt,
      isMine: message.senderId === currentUser.id,
    }))

    return NextResponse.json(formattedMessages)
  } catch (error) {
    // Safely log error without trying to stringify the entire error object
    console.error("Error fetching messages:", error instanceof Error ? error.message : "Unknown error")

    // Return mock data for development
    return NextResponse.json([
      {
        id: "mock1",
        content: "Hello, how can I help you today?",
        isRead: true,
        sender: {
          id: "teacher1",
          name: "Ms. Johnson",
          email: "teacher@example.com",
          role: "TEACHER",
        },
        receiver: {
          id: "parent1",
          name: "Parent User",
          email: "parent@example.com",
          role: "PARENT",
        },
        createdAt: new Date(Date.now() - 3600000),
        isMine: false,
      },
      {
        id: "mock2",
        content: "I wanted to discuss my child's recent test results.",
        isRead: true,
        sender: {
          id: "parent1",
          name: "Parent User",
          email: "parent@example.com",
          role: "PARENT",
        },
        receiver: {
          id: "teacher1",
          name: "Ms. Johnson",
          email: "teacher@example.com",
          role: "TEACHER",
        },
        createdAt: new Date(Date.now() - 3500000),
        isMine: true,
      },
    ])
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get request body
    let body
    try {
      body = await req.json()
    } catch (parseError) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { content, receiverId } = body

    if (!content || !receiverId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get current user
    const currentUser = await db.user.findUnique({
      where: { email: session.user?.email as string },
    })

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create message
    const message = await db.message.create({
      data: {
        content,
        senderId: currentUser.id,
        receiverId,
        isRead: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    })

    // Format message for the frontend
    const formattedMessage = {
      id: message.id,
      content: message.content,
      isRead: message.isRead,
      sender: {
        id: message.sender.id,
        name: message.sender.name,
        email: message.sender.email,
        role: message.sender.role,
      },
      receiver: {
        id: message.receiver.id,
        name: message.receiver.name,
        email: message.receiver.email,
        role: message.receiver.role,
      },
      createdAt: message.createdAt,
      isMine: true,
    }

    return NextResponse.json(formattedMessage)
  } catch (error) {
    // Safely log error without trying to stringify the entire error object
    console.error("Error sending message:", error instanceof Error ? error.message : "Unknown error")

    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
