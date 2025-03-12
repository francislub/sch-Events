import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const eventId = params.id

  try {
    // Check if the event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
      },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Get schedule items
    const scheduleItems = await prisma.scheduleItem.findMany({
      where: { eventId },
      orderBy: { startTime: "asc" },
    })

    return NextResponse.json(scheduleItems)
  } catch (error) {
    console.error("Error fetching schedule:", error)
    return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const eventId = params.id
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be logged in to add schedule items" }, { status: 401 })
  }

  try {
    // Check if the event exists and if the user has permission to add schedule items
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        organizerId: true,
      },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Only the organizer or an admin can add schedule items
    const isOrganizer = event.organizerId === session.user.id
    const isAdmin = session.user.role === "ADMIN"

    if (!isOrganizer && !isAdmin) {
      return NextResponse.json(
        { error: "You don't have permission to add schedule items for this event" },
        { status: 403 },
      )
    }

    const body = await request.json()
    const { title, startTime, endTime, location } = body

    // Validate required fields
    if (!title || !startTime || !endTime) {
      return NextResponse.json({ error: "Title, start time, and end time are required" }, { status: 400 })
    }

    // Create schedule item
    const scheduleItem = await prisma.scheduleItem.create({
      data: {
        title,
        startTime,
        endTime,
        location: location || "",
        eventId,
      },
    })

    return NextResponse.json({
      success: true,
      scheduleItem,
    })
  } catch (error) {
    console.error("Error adding schedule item:", error)
    return NextResponse.json({ error: "Failed to add schedule item" }, { status: 500 })
  }
}

