import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const eventId = params.id
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be logged in to view registrations" }, { status: 401 })
  }

  try {
    // Check if the event exists and if the user has permission to view registrations
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        organizerId: true,
      },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Only the organizer or an admin can view all registrations
    const isOrganizer = event.organizerId === session.user.id
    const isAdmin = session.user.role === "ADMIN"

    if (!isOrganizer && !isAdmin) {
      return NextResponse.json(
        { error: "You don't have permission to view registrations for this event" },
        { status: 403 },
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    // Build filter
    const filter: any = { eventId }

    if (status) {
      filter.status = status
    }

    // Get registrations
    const registrations = await prisma.registration.findMany({
      where: filter,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            studentId: true,
            grade: true,
            department: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Filter by search if provided
    let filteredRegistrations = registrations
    if (search) {
      const searchLower = search.toLowerCase()
      filteredRegistrations = registrations.filter(
        (reg) =>
          reg.user.name.toLowerCase().includes(searchLower) ||
          reg.user.email.toLowerCase().includes(searchLower) ||
          (reg.user.studentId && reg.user.studentId.toLowerCase().includes(searchLower)),
      )
    }

    // Transform the data for the frontend
    const transformedRegistrations = filteredRegistrations.map((reg) => ({
      id: reg.id,
      status: reg.status,
      createdAt: reg.createdAt.toISOString(),
      user: {
        id: reg.user.id,
        name: reg.user.name,
        email: reg.user.email,
        role: reg.user.role,
        studentId: reg.user.studentId,
        grade: reg.user.grade,
        department: reg.user.department,
      },
    }))

    return NextResponse.json(transformedRegistrations)
  } catch (error) {
    console.error("Error fetching registrations:", error)
    return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 })
  }
}

