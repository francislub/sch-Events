import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be logged in to access dashboard statistics" }, { status: 401 })
  }

  try {
    // Get total events count
    const totalEvents = await prisma.event.count()

    // Get upcoming events count (events with date >= today)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const upcomingEvents = await prisma.event.count({
      where: {
        date: {
          gte: today,
        },
      },
    })

    // Get total users count
    const totalUsers = await prisma.user.count()

    // Get total registrations count
    const totalRegistrations = await prisma.registration.count()

    // Get user-specific stats if not an admin
    let userStats = {}

    if (session.user.role !== "ADMIN") {
      // Events created by the user
      const userEvents = await prisma.event.count({
        where: {
          organizerId: session.user.id,
        },
      })

      // Events the user is registered for
      const userRegistrations = await prisma.registration.count({
        where: {
          userId: session.user.id,
        },
      })

      userStats = {
        userEvents,
        userRegistrations,
      }
    }

    // Get recent events (for admins and teachers)
    let recentEvents = []

    if (session.user.role === "ADMIN" || session.user.role === "TEACHER") {
      recentEvents = await prisma.event.findMany({
        where: {
          date: {
            gte: today,
          },
        },
        orderBy: {
          date: "asc",
        },
        take: 5,
        include: {
          _count: {
            select: {
              registrations: true,
            },
          },
        },
      })
    }

    return NextResponse.json({
      totalEvents,
      upcomingEvents,
      totalUsers,
      totalRegistrations,
      ...userStats,
      recentEvents: recentEvents.map((event) => ({
        id: event.id,
        title: event.title,
        date: event.date.toISOString(),
        location: event.location,
        registrations: event._count.registrations,
      })),
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard statistics" }, { status: 500 })
  }
}

