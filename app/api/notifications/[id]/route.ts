import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const notificationId = params.id
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be logged in to update notifications" }, { status: 401 })
  }

  try {
    // Check if the notification exists and belongs to the user
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    })

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    if (notification.userId !== session.user.id) {
      return NextResponse.json({ error: "You don't have permission to update this notification" }, { status: 403 })
    }

    const body = await request.json()
    const { isRead } = body

    if (isRead === undefined) {
      return NextResponse.json({ error: "isRead field is required" }, { status: 400 })
    }

    // Update notification
    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead },
    })

    return NextResponse.json({
      success: true,
      notification: updatedNotification,
    })
  } catch (error) {
    console.error("Error updating notification:", error)
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const notificationId = params.id
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be logged in to delete notifications" }, { status: 401 })
  }

  try {
    // Check if the notification exists and belongs to the user
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    })

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    if (notification.userId !== session.user.id) {
      return NextResponse.json({ error: "You don't have permission to delete this notification" }, { status: 403 })
    }

    // Delete notification
    await prisma.notification.delete({
      where: { id: notificationId },
    })

    return NextResponse.json({
      success: true,
      message: "Notification deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting notification:", error)
    return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 })
  }
}

