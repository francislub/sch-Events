import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
    return NextResponse.json({ error: "You don't have permission to access this resource" }, { status: 403 })
  }

  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "all"

    // Calculate date range based on period
    const now = new Date()
    let startDate = null

    if (period === "week") {
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 7)
    } else if (period === "month") {
      startDate = new Date(now)
      startDate.setMonth(now.getMonth() - 1)
    } else if (period === "year") {
      startDate = new Date(now)
      startDate.setFullYear(now.getFullYear() - 1)
    }

    // Build date filter
    const dateFilter = startDate ? { gte: startDate } : undefined

    // Get total counts
    const totalUsers = await prisma.user.count()
    const totalEvents = await prisma.event.count({
      where: startDate ? { createdAt: dateFilter } : undefined,
    })
    const totalRegistrations = await prisma.registration.count({
      where: startDate ? { createdAt: dateFilter } : undefined,
    })

    // Get user counts by role
    const usersByRole = await prisma.user.groupBy({
      by: ["role"],
      _count: true,
    })

    // Get event counts by category
    const eventsByCategory = await prisma.event.groupBy({
      by: ["category"],
      _count: true,
      where: startDate ? { createdAt: dateFilter } : undefined,
    })

    // Get registration counts by status
    const registrationsByStatus = await prisma.registration.groupBy({
      by: ["status"],
      _count: true,
      where: startDate ? { createdAt: dateFilter } : undefined,
    })

    // Get monthly event counts for the past year
    const monthlyEvents = []
    for (let i = 0; i < 12; i++) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)

      const count = await prisma.event.count({
        where: {
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      })

      monthlyEvents.push({
        month: monthStart.toLocaleString("default", { month: "short" }),
        year: monthStart.getFullYear(),
        count,
      })
    }

    // Get top events by registration
    const topEvents = await prisma.event.findMany({
      select: {
        id: true,
        title: true,
        date: true,
        category: true,
        _count: {
          select: {
            registrations: true,
          },
        },
      },
      orderBy: {
        registrations: {
          _count: "desc",
        },
      },
      take: 5,
    })

    return NextResponse.json({
      totalUsers,
      totalEvents,
      totalRegistrations,
      usersByRole: usersByRole.map((item) => ({
        role: item.role,
        count: item._count,
      })),
      eventsByCategory: eventsByCategory.map((item) => ({
        category: item.category,
        count: item._count,
      })),
      registrationsByStatus: registrationsByStatus.map((item) => ({
        status: item.status,
        count: item._count,
      })),
      monthlyEvents: monthlyEvents.reverse(),
      topEvents: topEvents.map((event) => ({
        id: event.id,
        title: event.title,
        date: event.date.toISOString(),
        category: event.category,
        registrations: event._count.registrations,
      })),
    })
  } catch (error) {
    console.error("Error fetching statistics:", error)
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 })
  }
}

