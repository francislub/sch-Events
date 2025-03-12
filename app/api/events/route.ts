import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const date = searchParams.get("date")

    // Calculate pagination
    const skip = (page - 1) * limit

    // Build filter
    const filter: any = {}

    // Category filter
    if (category && category !== "all") {
      filter.category = category
    }

    // Search filter
    if (search) {
      filter.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ]
    }

    // Date filters
    if (date) {
      const selectedDate = new Date(date)
      const nextDay = new Date(selectedDate)
      nextDay.setDate(nextDay.getDate() + 1)

      filter.date = {
        gte: selectedDate,
        lt: nextDay,
      }
    } else if (startDate && endDate) {
      filter.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    // Get events
    const events = await prisma.event.findMany({
      where: filter,
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            registrations: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { date: "asc" },
    })

    // Get total count
    const totalEvents = await prisma.event.count({ where: filter })

    // Transform events for the frontend
    const transformedEvents = events.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date.toISOString(),
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      category: event.category,
      image: event.image,
      organizer: event.organizer.name,
      organizerId: event.organizer.id,
      registrations: event._count.registrations,
    }))

    return NextResponse.json(transformedEvents)
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
    return NextResponse.json({ error: "You don't have permission to create events" }, { status: 403 })
  }

  try {
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

    // Validate required fields
    if (!title || !description || !date || !startTime || !endTime || !location || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create event
    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        startTime,
        endTime,
        location,
        category,
        capacity: capacity ? Number.parseInt(capacity) : null,
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
        isPublic: isPublic !== undefined ? isPublic : true,
        requiresApproval: requiresApproval !== undefined ? requiresApproval : false,
        image,
        organizerId: session.user.id,
      },
    })

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        title: event.title,
        date: event.date.toISOString(),
      },
    })
  } catch (error) {
    console.error("Error creating event:", error)
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
  }
}

