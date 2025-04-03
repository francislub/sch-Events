import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET messages
export async function GET(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const contactId = searchParams.get("contactId")

    if (!contactId) {
      return NextResponse.json({ error: "Contact ID is required" }, { status: 400 })
    }

    // Get messages between current user and contact
    const messages = await db.message.findMany({
      where: {
        OR: [
          {
            senderId: session.user.id,
            receiverId: contactId,
          },
          {
            senderId: contactId,
            receiverId: session.user.id,
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

    // Mark messages as read
    await db.message.updateMany({
      where: {
        senderId: contactId,
        receiverId: session.user.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error fetching messages:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

// POST new message
export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { receiverId, content } = await req.json()

    if (!receiverId || !content) {
      return NextResponse.json({ error: "Receiver ID and content are required" }, { status: 400 })
    }

    // Create new message
    const message = await db.message.create({
      data: {
        senderId: session.user.id,
        receiverId,
        content,
        isRead: false,
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
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error("Error sending message:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

