"use server"

import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Define validation schema
const messageSchema = z.object({
  receiverId: z.string().min(1, { message: "Receiver ID is required" }),
  content: z.string().min(1, { message: "Message content is required" }),
})

export async function sendMessage(formData: FormData) {
  // Check authentication
  const session = await getServerSession(authOptions)

  if (!session) {
    return {
      success: false,
      errors: {
        _form: ["You must be logged in to send messages"],
      },
    }
  }

  // Extract and validate form data
  const rawData = {
    receiverId: formData.get("receiverId") as string,
    content: formData.get("content") as string,
  }

  // Validate data
  const validationResult = messageSchema.safeParse(rawData)

  if (!validationResult.success) {
    return {
      success: false,
      errors: validationResult.error.flatten().fieldErrors,
    }
  }

  try {
    // Create message
    await db.message.create({
      data: {
        senderId: session.user.id,
        receiverId: rawData.receiverId,
        content: rawData.content,
        isRead: false,
      },
    })

    // Revalidate paths
    revalidatePath("/dashboard/parent/messages")
    revalidatePath("/dashboard/teacher/messages")
    revalidatePath("/dashboard/admin/messages")
    revalidatePath("/dashboard/student/messages")

    return {
      success: true,
      message: "Message sent successfully",
    }
  } catch (error) {
    console.error("Error sending message:", error)
    return {
      success: false,
      errors: {
        _form: ["Something went wrong. Please try again."],
      },
    }
  }
}

export async function updateMessage(messageId: string, content: string) {
  // Check authentication
  const session = await getServerSession(authOptions)

  if (!session) {
    return {
      success: false,
      error: "You must be logged in to update messages",
    }
  }

  try {
    // Check if message exists and belongs to the current user
    const existingMessage = await db.message.findUnique({
      where: {
        id: messageId,
      },
    })

    if (!existingMessage) {
      return {
        success: false,
        error: "Message not found",
      }
    }

    if (existingMessage.senderId !== session.user.id) {
      return {
        success: false,
        error: "You can only edit your own messages",
      }
    }

    // Update message
    await db.message.update({
      where: {
        id: messageId,
      },
      data: {
        content,
      },
    })

    // Revalidate paths
    revalidatePath("/dashboard/parent/messages")
    revalidatePath("/dashboard/teacher/messages")
    revalidatePath("/dashboard/admin/messages")
    revalidatePath("/dashboard/student/messages")

    return {
      success: true,
      message: "Message updated successfully",
    }
  } catch (error) {
    console.error("Error updating message:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

export async function deleteMessage(messageId: string) {
  // Check authentication
  const session = await getServerSession(authOptions)

  if (!session) {
    return {
      success: false,
      error: "You must be logged in to delete messages",
    }
  }

  try {
    // Check if message exists and belongs to the current user
    const existingMessage = await db.message.findUnique({
      where: {
        id: messageId,
      },
    })

    if (!existingMessage) {
      return {
        success: false,
        error: "Message not found",
      }
    }

    // Allow admins to delete any message, but other users can only delete their own
    if (existingMessage.senderId !== session.user.id && session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "You can only delete your own messages",
      }
    }

    // Delete message
    await db.message.delete({
      where: {
        id: messageId,
      },
    })

    // Revalidate paths
    revalidatePath("/dashboard/parent/messages")
    revalidatePath("/dashboard/teacher/messages")
    revalidatePath("/dashboard/admin/messages")
    revalidatePath("/dashboard/student/messages")

    return {
      success: true,
      message: "Message deleted successfully",
    }
  } catch (error) {
    console.error("Error deleting message:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

export async function getMessages(conversationWith?: string) {
  // Check authentication
  const session = await getServerSession(authOptions)

  if (!session) {
    return {
      success: false,
      errors: {
        _form: ["You must be logged in to view messages"],
      },
    }
  }

  try {
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

    // If viewing a specific conversation, mark unread messages as read
    if (conversationWith) {
      await db.message.updateMany({
        where: {
          senderId: conversationWith,
          receiverId: session.user.id,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      })
    }

    return {
      success: true,
      data: messages,
    }
  } catch (error) {
    console.error("Error fetching messages:", error)
    return {
      success: false,
      errors: {
        _form: ["Something went wrong. Please try again."],
      },
    }
  }
}

export async function getConversations() {
  // Check authentication
  const session = await getServerSession(authOptions)

  if (!session) {
    return {
      success: false,
      errors: {
        _form: ["You must be logged in to view conversations"],
      },
    }
  }

  try {
    // Get all messages for current user
    const messages = await db.message.findMany({
      where: {
        OR: [{ senderId: session.user.id }, { receiverId: session.user.id }],
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
        createdAt: "desc",
      },
    })

    // Group messages by conversation
    const conversations = new Map()

    messages.forEach((message) => {
      const otherUser = message.senderId === session.user.id ? message.receiver : message.sender

      if (!conversations.has(otherUser.id)) {
        conversations.set(otherUser.id, {
          user: otherUser,
          lastMessage: message,
          unreadCount: message.receiverId === session.user.id && !message.isRead ? 1 : 0,
        })
      } else {
        const conversation = conversations.get(otherUser.id)

        // Only update unread count for messages received by current user
        if (message.receiverId === session.user.id && !message.isRead) {
          conversation.unreadCount += 1
        }
      }
    })

    return {
      success: true,
      data: Array.from(conversations.values()),
    }
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return {
      success: false,
      errors: {
        _form: ["Something went wrong. Please try again."],
      },
    }
  }
}

