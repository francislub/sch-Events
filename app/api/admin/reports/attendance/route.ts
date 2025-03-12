import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
    return NextResponse.json({ error: "You don't have permission to access this resource" }, { status: 403 })
  }

  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get("eventId")
    const format = searchParams.get("format") || "json"

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 })
    }

    // Check if the event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        title: true,
        date: true,
        location: true,
      },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Get registrations for the event
    const registrations = await prisma.registration.findMany({
      where: { eventId },
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
      orderBy: { createdAt: "asc" },
    })

    // Transform data for the report
    const attendanceData = registrations.map((reg) => ({
      id: reg.id,
      userId: reg.userId,
      name: reg.user.name,
      email: reg.user.email,
      role: reg.user.role,
      studentId: reg.user.studentId || "",
      grade: reg.user.grade || "",
      department: reg.user.department || "",
      status: reg.status,
      registeredAt: reg.createdAt.toISOString(),
    }))

    // Generate report based on format
    if (format === "csv") {
      // Generate CSV
      const headers = ["Name", "Email", "Role", "Student ID", "Grade/Department", "Status", "Registered At"]
      const rows = attendanceData.map((item) => [
        item.name,
        item.email,
        item.role,
        item.studentId,
        item.role === "STUDENT" ? item.grade : item.department,
        item.status,
        new Date(item.registeredAt).toLocaleString(),
      ])

      const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")

      // Set response headers for file download
      const csvHeaders = new Headers()
      csvHeaders.set("Content-Type", "text/csv")
      csvHeaders.set("Content-Disposition", `attachment; filename=attendance_${eventId}.csv`)

      return new NextResponse(csvContent, {
        status: 200,
        headers: csvHeaders,
      })
    }

    // Default: return JSON
    return NextResponse.json({
      event: {
        id: event.id,
        title: event.title,
        date: event.date.toISOString(),
        location: event.location,
      },
      attendance: attendanceData,
      summary: {
        total: attendanceData.length,
        approved: attendanceData.filter((item) => item.status === "APPROVED").length,
        pending: attendanceData.filter((item) => item.status === "PENDING").length,
        rejected: attendanceData.filter((item) => item.status === "REJECTED").length,
        attended: attendanceData.filter((item) => item.status === "ATTENDED").length,
      },
    })
  } catch (error) {
    console.error("Error generating attendance report:", error)
    return NextResponse.json({ error: "Failed to generate attendance report" }, { status: 500 })
  }
}

