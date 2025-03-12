import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const eventId = params.id
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be logged in to register for an event" }, { status: 401 })
  }

  try {
    // Check if the event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Check if registration is closed
    if (event.registrationDeadline && new Date() > event.registrationDeadline) {
      return NextResponse.json({ error: "Registration for this event has closed" }, { status: 400 })
    }

    // Check if the event is at capacity
    if (event.capacity && event._count.registrations >= event.capacity) {
      return NextResponse.json({ error: "This event has reached its maximum capacity" }, { status: 400 })
    }

    // Check if the user is already registered
    const existingRegistration = await prisma.registration.findUnique({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId,
        },
      },
    })

    if (existingRegistration) {
      return NextResponse.json({ error: "You are already registered for this event" }, { status: 400 })
    }

    // Create the registration
    const registration = await prisma.registration.create({
      data: {
        userId: session.user.id,
        eventId,
        status: event.requiresApproval ? "PENDING" : "APPROVED",
      },
    })

    // Create a notification for the event organizer
    await prisma.notification.create({
      data: {
        userId: event.organizerId,
        message: `${session.user.name} has registered for your event: ${event.title}`,
      },
    })

    return NextResponse.json({
      success: true,
      registration: {
        id: registration.id,
        status: registration.status,
      },
    })
  } catch (error) {
    console.error("Error registering for event:", error)
    return NextResponse.json({ error: "Failed to register for event" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const eventId = params.id
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be logged in to cancel registration" }, { status: 401 })
  }

  try {
    // Check if the registration exists
    const registration = await prisma.registration.findUnique({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId,
        },
      },
      include: {
        event: {
          select: {
            title: true,
            organizerId: true,
          },
        },
      },
    })

    if (!registration) {
      return NextResponse.json({ error: "You are not registered for this event" }, { status: 404 })
    }

    // Delete the registration
    await prisma.registration.delete({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId,
        },
      },
    })

    // Create a notification for the event organizer
    await prisma.notification.create({
      data: {
        userId: registration.event.organizerId,
        message: `${session.user.name} has cancelled their registration for your event: ${registration.event.title}`,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Registration cancelled successfully",
    })
  } catch (error) {
    console.error("Error cancelling registration:", error)
    return NextResponse.json({ error: "Failed to cancel registration" }, { status: 500 })
  }
}

