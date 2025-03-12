import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function PUT(request: NextRequest, { params }: { params: { id: string; registrationId: string } }) {
  const { id: eventId, registrationId } = params
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be logged in to update registration status" }, { status: 401 })
  }

  try {
    // Check if the event exists and if the user has permission to update registrations
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        organizerId: true,
        title: true,
      },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Only the organizer or an admin can update registration status
    const isOrganizer = event.organizerId === session.user.id
    const isAdmin = session.user.role === "ADMIN"

    if (!isOrganizer && !isAdmin) {
      return NextResponse.json(
        { error: "You don't have permission to update registrations for this event" },
        { status: 403 },
      )
    }

    // Get the registration
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!registration || registration.eventId !== eventId) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 })
    }

    const body = await request.json()
    const { status } = body

    if (!status || !["PENDING", "APPROVED", "REJECTED", "ATTENDED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be PENDING, APPROVED, REJECTED, or ATTENDED" },
        { status: 400 },
      )
    }

    // Update the registration
    const updatedRegistration = await prisma.registration.update({
      where: { id: registrationId },
      data: { status },
    })

    // Create a notification for the user
    let message = ""
    if (status === "APPROVED") {
      message = `Your registration for ${event.title} has been approved.`
    } else if (status === "REJECTED") {
      message = `Your registration for ${event.title} has been rejected.`
    } else if (status === "ATTENDED") {
      message = `Your attendance for ${event.title} has been recorded.`
    }

    if (message) {
      await prisma.notification.create({
        data: {
          userId: registration.userId,
          message,
        },
      })
    }

    return NextResponse.json({
      success: true,
      registration: {
        id: updatedRegistration.id,
        status: updatedRegistration.status,
      },
    })
  } catch (error) {
    console.error("Error updating registration:", error)
    return NextResponse.json({ error: "Failed to update registration" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; registrationId: string } }) {
  const { id: eventId, registrationId } = params
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be logged in to delete a registration" }, { status: 401 })
  }

  try {
    // Check if the event exists and if the user has permission to delete registrations
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        organizerId: true,
      },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Only the organizer or an admin can delete registrations
    const isOrganizer = event.organizerId === session.user.id
    const isAdmin = session.user.role === "ADMIN"

    if (!isOrganizer && !isAdmin) {
      return NextResponse.json(
        { error: "You don't have permission to delete registrations for this event" },
        { status: 403 },
      )
    }

    // Get the registration
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
    })

    if (!registration || registration.eventId !== eventId) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 })
    }

    // Delete the registration
    await prisma.registration.delete({
      where: { id: registrationId },
    })

    return NextResponse.json({
      success: true,
      message: "Registration deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting registration:", error)
    return NextResponse.json({ error: "Failed to delete registration" }, { status: 500 })
  }
}

