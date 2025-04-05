import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only teachers can access this endpoint
    if (session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const classId = searchParams.get("classId")
    const date = searchParams.get("date")
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    // Find teacher profile
    const teacher = await db.teacher.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    if (!teacher) {
      return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 })
    }

    // Get classes taught by this teacher
    const classes = await db.class.findMany({
      where: {
        teacherId: teacher.id,
      },
      select: {
        id: true,
      },
    })

    const classIds = classes.map((cls) => cls.id)

    // Build filter
    const filter: any = {
      class: {
        id: {
          in: classIds,
        },
      },
    }

    if (classId) {
      filter.class.id = classId
    }

    if (date) {
      const selectedDate = new Date(date)
      filter.date = {
        gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
        lte: new Date(selectedDate.setHours(23, 59, 59, 999)),
      }
    }

    if (status) {
      filter.status = status
    }

    if (search) {
      filter.student = {
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
        ],
      }
    }

    // Get attendance records
    const attendance = await db.attendance.findMany({
      where: filter,
      include: {
        student: true,
        class: true,
      },
      orderBy: {
        date: "desc",
      },
    })

    return NextResponse.json(attendance)
  } catch (error) {
    console.error("Error fetching teacher attendance:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

