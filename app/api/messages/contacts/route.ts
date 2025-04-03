import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all users except the current user
    const users = await db.user.findMany({
      where: {
        id: {
          not: session.user.id,
        },
      },
      select: {
        id: true,
        name: true,
        role: true,
        email: true,
      },
    })

    // Get the last message for each user
    const contacts = await Promise.all(
      users.map(async (user) => {
        const lastMessage = await db.message.findFirst({
          where: {
            OR: [
              {
                senderId: session.user.id,
                receiverId: user.id,
              },
              {
                senderId: user.id,
                receiverId: session.user.id,
              },
            ],
          },
          orderBy: {
            createdAt: "desc",
          },
        })

        // Count unread messages
        const unreadCount = await db.message.count({
          where: {
            senderId: user.id,
            receiverId: session.user.id,
            isRead: false,
          },
        })

        return {
          id: user.id,
          name: user.name,
          role: user.role,
          email: user.email,
          lastMessage: lastMessage?.content,
          lastMessageTime: lastMessage?.createdAt,
          unreadCount,
        }
      }),
    )

    return NextResponse.json(contacts)
  } catch (error) {
    console.error("Error fetching contacts:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        role: true,
        email: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Return the user as a contact
    return NextResponse.json({
      id: user.id,
      name: user.name,
      role: user.role,
      email: user.email,
    })
  } catch (error) {
    console.error("Error adding contact:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

