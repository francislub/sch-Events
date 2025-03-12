import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be logged in to access your events" }, { status: 401 })
  }

  try {
    // Get events created by the user
    const createdEvents = await prisma.event.findMany({
      where: {
        organizerId: session.user.id,
      },
      include: {
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    })

    // Get events the user is registered for
    const registeredEvents = await prisma.registration.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        event: {
          include: {
            organizer: {
              select: {
                name: true,
                email: true,
              },
            },
            _count: {
              select: {
                registrations: true,
              },
            },
          },
        },
      },
    })

    // Transform the data for the frontend
    const transformedCreatedEvents = createdEvents.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date.toISOString(),
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      category: event.category,
      image: event.image,
      registrations: event._count.registrations,
      isOrganizer: true,
    }))

    const transformedRegisteredEvents = registeredEvents.map((reg) => ({
      id: reg.event.id,
      title: reg.event.title,
      description: reg.event.description,
      date: reg.event.date.toISOString(),
      startTime: reg.event.startTime,
      endTime: reg.event.endTime,
      location: reg.event.location,
      category: reg.event.category,
      image: reg.event.image,
      registrations: reg.event._count.registrations,
      registrationStatus: reg.status,
      isOrganizer: false,
    }))

    // Combine and sort by date
    const allEvents = [...transformedCreatedEvents, ...transformedRegisteredEvents].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    )

    return NextResponse.json(allEvents)
  } catch (error) {
    console.error("Error fetching user events:", error)
    return NextResponse.json({ error: "Failed to fetch your events" }, { status: 500 })
  }
}

