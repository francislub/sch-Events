import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// PUT (update) message
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const { content } = await req.json()

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    // Check if message exists and belongs to the current user
    const message = await db.message.findUnique({
      where: {
        id,
      },
    })

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    if (message.senderId !== session.user.id) {
      return NextResponse.json({ error: "You can only edit your own messages" }, { status: 403 })
    }

    // Update message
    const updatedMessage = await db.message.update({
      where: {
        id,
      },
      data: {
        content,
      },
    })

    return NextResponse.json(updatedMessage)
  } catch (error) {
    console.error("Error updating message:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

// DELETE message
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    // Check if message exists
    const message = await db.message.findUnique({
      where: {
        id,
      },
    })

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    // Check if user is authorized to delete the message
    // Admin can delete any message, but other users can only delete their own
    if (message.senderId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "You can only delete your own messages" }, { status: 403 })
    }

    // Delete message
    await db.message.delete({
      where: {
        id,
      },
    })

    return NextResponse.json({ message: "Message deleted successfully" })
  } catch (error) {
    console.error("Error deleting message:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

