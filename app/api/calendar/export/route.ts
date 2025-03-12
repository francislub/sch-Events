import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be logged in to export calendar events" }, { status: 401 })
  }

  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get("eventId")

    let events = []

    if (eventId) {
      // Export a single event
      const event = await prisma.event.findUnique({
        where: { id: eventId },
      })

      if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 })
      }

      events = [event]
    } else {
      // Export all events the user is registered for
      const registrations = await prisma.registration.findMany({
        where: {
          userId: session.user.id,
          status: "APPROVED",
        },
        include: {
          event: true,
        },
      })

      events = registrations.map((reg) => reg.event)
    }

    // Generate iCalendar format
    const icalContent = generateICalendar(events)

    // Set response headers for file download
    const headers = new Headers()
    headers.set("Content-Type", "text/calendar")
    headers.set("Content-Disposition", "attachment; filename=events.ics")

    return new NextResponse(icalContent, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error("Error exporting calendar events:", error)
    return NextResponse.json({ error: "Failed to export calendar events" }, { status: 500 })
  }
}

// Helper function to generate iCalendar format
function generateICalendar(events) {
  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"

  let icalContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Wobulezi School Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ]

  events.forEach((event) => {
    const startDate = new Date(event.date)
    const [startHours, startMinutes] = event.startTime.split(":").map(Number)
    startDate.setHours(startHours, startMinutes)

    const endDate = new Date(event.date)
    const [endHours, endMinutes] = event.endTime.split(":").map(Number)
    endDate.setHours(endHours, endMinutes)

    const start = startDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
    const end = endDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"

    icalContent = icalContent.concat([
      "BEGIN:VEVENT",
      `UID:${event.id}@wobulezi.edu`,
      `DTSTAMP:${now}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description.replace(/\n/g, "\\n")}`,
      `LOCATION:${event.location}`,
      `CATEGORIES:${event.category}`,
      "END:VEVENT",
    ])
  })

  icalContent.push("END:VCALENDAR")

  return icalContent.join("\r\n")
}

