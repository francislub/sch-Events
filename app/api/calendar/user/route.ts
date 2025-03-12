import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be logged in to access your calendar" }, { status: 401 })
  }

  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const month = Number.parseInt(searchParams.get("month") || new Date().getMonth().toString())
    const year = Number.parseInt(searchParams.get("year") || new Date().getFullYear().toString())

    // Calculate start and end dates for the month
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0)

    // Get events the user is registered for
    const registrations = await prisma.registration.findMany({
      where: {
        userId: session.user.id,
        event: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            startTime: true,
            endTime: true,
            location: true,
            category: true,
          },
        },
      },
    })

    // Get events the user has created
    const createdEvents = await prisma.event.findMany({
      where: {
        organizerId: session.user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        title: true,
        date: true,
        startTime: true,
        endTime: true,
        location: true,
        category: true,
      },
    })

    // Transform registered events
    const registeredEvents = registrations.map((reg) => ({
      id: reg.event.id,
      title: reg.event.title,
      date: reg.event.date.toISOString(),
      time: `${reg.event.startTime} - ${reg.event.endTime}`,
      location: reg.event.location,
      category: reg.event.category,
      type: "registered",
      status: reg.status,
    }))

    // Transform created events
    const transformedCreatedEvents = createdEvents.map((event) => ({
      id: event.id,
      title: event.title,
      date: event.date.toISOString(),
      time: `${event.startTime} - ${event.endTime}`,
      location: event.location,
      category: event.category,
      type: "created",
    }))

    // Combine and sort by date
    const calendarEvents = [...registeredEvents, ...transformedCreatedEvents].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    )

    return NextResponse.json(calendarEvents)
  } catch (error) {
    console.error("Error fetching user calendar events:", error)
    return NextResponse.json({ error: "Failed to fetch calendar events" }, { status: 500 })
  }
}

