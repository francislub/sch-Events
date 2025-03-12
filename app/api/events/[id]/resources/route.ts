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

    // Get resources
    const resources = await prisma.resource.findMany({
      where: { eventId },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(resources)
  } catch (error) {
    console.error("Error fetching resources:", error)
    return NextResponse.json({ error: "Failed to fetch resources" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const eventId = params.id
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be logged in to add resources" }, { status: 401 })
  }

  try {
    // Check if the event exists and if the user has permission to add resources
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        organizerId: true,
      },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Only the organizer or an admin can add resources
    const isOrganizer = event.organizerId === session.user.id
    const isAdmin = session.user.role === "ADMIN"

    if (!isOrganizer && !isAdmin) {
      return NextResponse.json({ error: "You don't have permission to add resources for this event" }, { status: 403 })
    }

    const body = await request.json()
    const { name, type, quantity } = body

    // Validate required fields
    if (!name || !type || quantity === undefined) {
      return NextResponse.json({ error: "Name, type, and quantity are required" }, { status: 400 })
    }

    // Create resource
    const resource = await prisma.resource.create({
      data: {
        name,
        type,
        quantity: Number.parseInt(quantity),
        eventId,
      },
    })

    return NextResponse.json({
      success: true,
      resource,
    })
  } catch (error) {
    console.error("Error adding resource:", error)
    return NextResponse.json({ error: "Failed to add resource" }, { status: 500 })
  }
}

