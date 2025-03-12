import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const eventId = params.id
  const session = await getServerSession(authOptions)

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        registrations: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
                studentId: true,
                grade: true,
                department: true,
              },
            },
          },
        },
        scheduleItems: true,
        resources: true,
      },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Check if the event is public or if the user is the organizer or an admin
    if (
      !event.isPublic &&
      (!session?.user?.id || (event.organizer.id !== session.user.id && session.user.role !== "ADMIN"))
    ) {
      return NextResponse.json({ error: "You don't have permission to view this event" }, { status: 403 })
    }

    // Check if the current user is registered
    let isRegistered = false
    let registrationStatus = null

    if (session?.user?.id) {
      const userRegistration = event.registrations.find((reg) => reg.userId === session.user.id)

      if (userRegistration) {
        isRegistered = true
        registrationStatus = userRegistration.status
      }
    }

    // Transform the data for the frontend
    const transformedEvent = {
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date.toISOString(),
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      category: event.category,
      image: event.image,
      capacity: event.capacity,
      registrationDeadline: event.registrationDeadline?.toISOString(),
      isPublic: event.isPublic,
      requiresApproval: event.requiresApproval,
      organizer: event.organizer.name,
      organizerId: event.organizer.id,
      contact: event.organizer.email,
      registrations: event.registrations.length,
      schedule: event.scheduleItems.map((item) => ({
        id: item.id,
        title: item.title,
        startTime: item.startTime,
        endTime: item.endTime,
        location: item.location,
      })),
      resources: event.resources,
      attendees: event.registrations.map((reg) => ({
        id: reg.id,
        userId: reg.userId,
        name: reg.user.name,
        role: reg.user.role,
        class: reg.user.grade,
        department: reg.user.department,
        status: reg.status,
      })),
      isRegistered,
      registrationStatus,
      canEdit: session?.user?.id && (event.organizer.id === session.user.id || session.user.role === "ADMIN"),
    }

    return NextResponse.json(transformedEvent)
  } catch (error) {
    console.error("Error fetching event:", error)
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const eventId = params.id
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be logged in to update an event" }, { status: 401 })
  }

  try {
    // Check if the event exists and if the user has permission to update it
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizer: {
          select: {
            id: true,
          },
        },
      },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Check if the user is the organizer or an admin
    if (event.organizer.id !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "You don't have permission to update this event" }, { status: 403 })
    }

    const body = await request.json()
    const {
      title,
      description,
      date,
      startTime,
      endTime,
      location,
      category,
      capacity,
      registrationDeadline,
      isPublic,
      requiresApproval,
      image,
    } = body

    // Prepare update data
    const updateData: any = {}

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (date !== undefined) updateData.date = new Date(date)
    if (startTime !== undefined) updateData.startTime = startTime
    if (endTime !== undefined) updateData.endTime = endTime
    if (location !== undefined) updateData.location = location
    if (category !== undefined) updateData.category = category
    if (capacity !== undefined) updateData.capacity = capacity ? Number.parseInt(capacity) : null
    if (registrationDeadline !== undefined) {
      updateData.registrationDeadline = registrationDeadline ? new Date(registrationDeadline) : null
    }
    if (isPublic !== undefined) updateData.isPublic = isPublic
    if (requiresApproval !== undefined) updateData.requiresApproval = requiresApproval
    if (image !== undefined) updateData.image = image

    // Update the event
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      event: {
        id: updatedEvent.id,
        title: updatedEvent.title,
        date: updatedEvent.date.toISOString(),
      },
    })
  } catch (error) {
    console.error("Error updating event:", error)
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const eventId = params.id
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be logged in to delete an event" }, { status: 401 })
  }

  try {
    // Check if the event exists and if the user has permission to delete it
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizer: {
          select: {
            id: true,
          },
        },
      },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Check if the user is the organizer or an admin
    if (event.organizer.id !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "You don't have permission to delete this event" }, { status: 403 })
    }

    // Delete the event
    await prisma.event.delete({
      where: { id: eventId },
    })

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting event:", error)
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 })
  }
}

