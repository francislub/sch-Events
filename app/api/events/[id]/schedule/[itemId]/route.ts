import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function PUT(request: NextRequest, { params }: { params: { id: string; itemId: string } }) {
  const { id: eventId, itemId } = params
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be logged in to update schedule items" }, { status: 401 })
  }

  try {
    // Check if the event exists and if the user has permission to update schedule items
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        organizerId: true,
      },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Only the organizer or an admin can update schedule items
    const isOrganizer = event.organizerId === session.user.id
    const isAdmin = session.user.role === "ADMIN"

    if (!isOrganizer && !isAdmin) {
      return NextResponse.json(
        { error: "You don't have permission to update schedule items for this event" },
        { status: 403 },
      )
    }

    // Check if the schedule item exists
    const scheduleItem = await prisma.scheduleItem.findUnique({
      where: { id: itemId },
    })

    if (!scheduleItem || scheduleItem.eventId !== eventId) {
      return NextResponse.json({ error: "Schedule item not found" }, { status: 404 })
    }

    const body = await request.json()
    const { title, startTime, endTime, location } = body

    // Prepare update data
    const updateData: any = {}

    if (title !== undefined) updateData.title = title
    if (startTime !== undefined) updateData.startTime = startTime
    if (endTime !== undefined) updateData.endTime = endTime
    if (location !== undefined) updateData.location = location

    // Update schedule item
    const updatedScheduleItem = await prisma.scheduleItem.update({
      where: { id: itemId },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      scheduleItem: updatedScheduleItem,
    })
  } catch (error) {
    console.error("Error updating schedule item:", error)
    return NextResponse.json({ error: "Failed to update schedule item" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; itemId: string } }) {
  const { id: eventId, itemId } = params
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be logged in to delete schedule items" }, { status: 401 })
  }

  try {
    // Check if the event exists and if the user has permission to delete schedule items
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        organizerId: true,
      },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Only the organizer or an admin can delete schedule items
    const isOrganizer = event.organizerId === session.user.id
    const isAdmin = session.user.role === "ADMIN"

    if (!isOrganizer && !isAdmin) {
      return NextResponse.json(
        { error: "You don't have permission to delete schedule items for this event" },
        { status: 403 },
      )
    }

    // Check if the schedule item exists
    const scheduleItem = await prisma.scheduleItem.findUnique({
      where: { id: itemId },
    })

    if (!scheduleItem || scheduleItem.eventId !== eventId) {
      return NextResponse.json({ error: "Schedule item not found" }, { status: 404 })
    }

    // Delete schedule item
    await prisma.scheduleItem.delete({
      where: { id: itemId },
    })

    return NextResponse.json({
      success: true,
      message: "Schedule item deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting schedule item:", error)
    return NextResponse.json({ error: "Failed to delete schedule item" }, { status: 500 })
  }
}

