import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function PUT(request: NextRequest, { params }: { params: { id: string; resourceId: string } }) {
  const { id: eventId, resourceId } = params
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be logged in to update resources" }, { status: 401 })
  }

  try {
    // Check if the event exists and if the user has permission to update resources
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        organizerId: true,
      },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Only the organizer or an admin can update resources
    const isOrganizer = event.organizerId === session.user.id
    const isAdmin = session.user.role === "ADMIN"

    if (!isOrganizer && !isAdmin) {
      return NextResponse.json(
        { error: "You don't have permission to update resources for this event" },
        { status: 403 },
      )
    }

    // Check if the resource exists
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
    })

    if (!resource || resource.eventId !== eventId) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 })
    }

    const body = await request.json()
    const { name, type, quantity } = body

    // Prepare update data
    const updateData: any = {}

    if (name !== undefined) updateData.name = name
    if (type !== undefined) updateData.type = type
    if (quantity !== undefined) updateData.quantity = Number.parseInt(quantity)

    // Update resource
    const updatedResource = await prisma.resource.update({
      where: { id: resourceId },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      resource: updatedResource,
    })
  } catch (error) {
    console.error("Error updating resource:", error)
    return NextResponse.json({ error: "Failed to update resource" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; resourceId: string } }) {
  const { id: eventId, resourceId } = params
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be logged in to delete resources" }, { status: 401 })
  }

  try {
    // Check if the event exists and if the user has permission to delete resources
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        organizerId: true,
      },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Only the organizer or an admin can delete resources
    const isOrganizer = event.organizerId === session.user.id
    const isAdmin = session.user.role === "ADMIN"

    if (!isOrganizer && !isAdmin) {
      return NextResponse.json(
        { error: "You don't have permission to delete resources for this event" },
        { status: 403 },
      )
    }

    // Check if the resource exists
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
    })

    if (!resource || resource.eventId !== eventId) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 })
    }

    // Delete resource
    await prisma.resource.delete({
      where: { id: resourceId },
    })

    return NextResponse.json({
      success: true,
      message: "Resource deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting resource:", error)
    return NextResponse.json({ error: "Failed to delete resource" }, { status: 500 })
  }
}

