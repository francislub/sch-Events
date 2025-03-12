import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const month = Number.parseInt(searchParams.get("month") || new Date().getMonth().toString())
    const year = Number.parseInt(searchParams.get("year") || new Date().getFullYear().toString())
    const category = searchParams.get("category")

    // Calculate start and end dates for the month
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0)

    // Build filter
    const filter: any = {
      date: {
        gte: startDate,
        lte: endDate,
      },
    }

    if (category && category !== "all") {
      filter.category = category
    }

    // Get events for the month
    const events = await prisma.event.findMany({
      where: filter,
      select: {
        id: true,
        title: true,
        date: true,
        startTime: true,
        endTime: true,
        location: true,
        category: true,
      },
      orderBy: { date: "asc" },
    })

    // Transform events for the calendar
    const calendarEvents = events.map((event) => ({
      id: event.id,
      title: event.title,
      date: event.date.toISOString(),
      time: `${event.startTime} - ${event.endTime}`,
      location: event.location,
      category: event.category,
    }))

    return NextResponse.json(calendarEvents)
  } catch (error) {
    console.error("Error fetching calendar events:", error)
    return NextResponse.json({ error: "Failed to fetch calendar events" }, { status: 500 })
  }
}

