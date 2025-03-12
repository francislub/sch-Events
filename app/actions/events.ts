"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"

export async function createEvent(formData: FormData) {
  const session = await getServerSession(authOptions)

  // Only allow admins and teachers to create events
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
    return { success: false, error: "You don't have permission to create events" }
  }

  try {
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const date = formData.get("date") as string
    const startTime = formData.get("startTime") as string
    const endTime = formData.get("endTime") as string
    const location = formData.get("location") as string
    const category = formData.get("category") as string
    const capacity = formData.get("capacity") as string
    const registrationDeadline = formData.get("registrationDeadline") as string
    const isPublic = formData.get("isPublic") as string
    const requiresApproval = formData.get("requiresApproval") as string
    const image = formData.get("image") as string

    if (!title || !description || !date || !startTime || !endTime || !location || !category) {
      return { success: false, error: "All fields are required" }
    }

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
        isPublic: isPublic === "true",
        requiresApproval: requiresApproval === "true",
        image: image || null,
        organizerId: session.user.id,
      },
    })

    revalidatePath("/events")
    revalidatePath("/dashboard")

    return { success: true, eventId: event.id }
  } catch (error) {
    console.error("Error creating event:", error)
    return { success: false, error: "Failed to create event" }
  }
}

export async function registerForEvent(eventId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return { success: false, error: "You must be logged in to register for events" }
  }

  try {
    // Check if the user is already registered
    const existingRegistration = await prisma.registration.findUnique({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId: eventId,
        },
      },
    })

    if (existingRegistration) {
      return { success: false, error: "You are already registered for this event" }
    }

    // Get the event to check if approval is required
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      return { success: false, error: "Event not found" }
    }

    // Create the registration
    await prisma.registration.create({
      data: {
        userId: session.user.id,
        eventId: eventId,
        status: event.requiresApproval ? "PENDING" : "APPROVED",
      },
    })

    revalidatePath(`/events/${eventId}`)
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Error registering for event:", error)
    return { success: false, error: "Failed to register for event" }
  }
}

export async function cancelRegistration(eventId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return { success: false, error: "You must be logged in to cancel registration" }
  }

  try {
    // Delete the registration
    await prisma.registration.delete({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId: eventId,
        },
      },
    })

    revalidatePath(`/events/${eventId}`)
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Error cancelling registration:", error)
    return { success: false, error: "Failed to cancel registration" }
  }
}

// Update other functions to also check for admin/teacher permissions
export async function deleteEvent(eventId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
    return { success: false, error: "You don't have permission to delete events" }
  }

  try {
    // Get the event to check the organizer
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { organizer: { select: { id: true } } },
    })

    if (!event) {
      return { success: false, error: "Event not found" }
    }

    // Check if the user is the organizer or an admin
    if (event.organizer.id !== session.user.id && session.user.role !== "ADMIN") {
      return { success: false, error: "You don't have permission to delete this event" }
    }

    // Delete the event
    await prisma.event.delete({
      where: { id: eventId },
    })

    revalidatePath("/events")
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Error deleting event:", error)
    return { success: false, error: "Failed to delete event" }
  }
}

// Keep the registration functions as they are, since all users should be able to register

