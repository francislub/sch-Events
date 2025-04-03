import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET contacts
export async function GET(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all users who have exchanged messages with the current user
    const messageContacts = await db.message.findMany({
      where: {
        OR: [{ senderId: session.user.id }, { receiverId: session.user.id }],
      },
      select: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
        content: true,
        createdAt: true,
        read: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Extract unique contacts
    const contactsMap = new Map()

    messageContacts.forEach((message) => {
      const contact = message.sender.id === session.user.id ? message.receiver : message.sender

      if (!contactsMap.has(contact.id)) {
        contactsMap.set(contact.id, {
          id: contact.id,
          name: contact.name,
          image: contact.image,
          role: contact.role,
          lastMessage: message.content,
          lastMessageTime: message.createdAt.toISOString(),
          unreadCount: message.sender.id !== session.user.id && !message.read ? 1 : 0,
        })
      } else if (message.sender.id !== session.user.id && !message.read) {
        // Increment unread count for existing contact
        const existingContact = contactsMap.get(contact.id)
        existingContact.unreadCount += 1
        contactsMap.set(contact.id, existingContact)
      }
    })

    // Convert map to array and sort by last message time
    const contacts = Array.from(contactsMap.values()).sort(
      (a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime(),
    )

    return NextResponse.json(contacts)
  } catch (error) {
    console.error("Error fetching contacts:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

// POST new contact
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

    // Get user
    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        image: true,
        role: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Return user as contact
    return NextResponse.json({
      id: user.id,
      name: user.name,
      image: user.image,
      role: user.role,
    })
  } catch (error) {
    console.error("Error adding contact:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

