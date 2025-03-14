import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// Add a new model to prisma/schema.prisma:
// model Message {
//   id        String   @id @default(auto()) @map("_id") @db.ObjectId
//   senderId  String   @db.ObjectId
//   receiverId String  @db.ObjectId
//   content   String
//   isRead    Boolean  @default(false)
//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt
// }

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { receiverId, content } = await req.json()

    // Validate required fields
    if (!receiverId || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create message
    const message = await db.message.create({
      data: {
        senderId: session.user.id,
        receiverId,
        content,
      },
    })

    return NextResponse.json({ message: "Message sent successfully", data: message }, { status: 201 })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const conversationWith = searchParams.get("with")

    // Build filter
    let filter: any = {}

    if (conversationWith) {
      // Get conversation between current user and specified user
      filter = {
        OR: [
          {
            senderId: session.user.id,
            receiverId: conversationWith,
          },
          {
            senderId: conversationWith,
            receiverId: session.user.id,
          },
        ],
      }
    } else {
      // Get all conversations for current user
      filter = {
        OR: [{ senderId: session.user.id }, { receiverId: session.user.id }],
      }
    }

    // Get messages
    const messages = await db.message.findMany({
      where: filter,
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
      orderBy: {
        createdAt: "asc",
      },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

