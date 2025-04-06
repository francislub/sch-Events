import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "TEACHER") {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      })
    }

    // Find teacher profile
    const teacher = await db.teacher.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    if (!teacher) {
      return new NextResponse(JSON.stringify({ error: "Teacher profile not found" }), {
        status: 404,
      })
    }

    const { searchParams } = new URL(request.url)

    const classId = searchParams.get("classId")
    const date = searchParams.get("date")
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    // Get teacher's classes
    const teacherClasses = await db.class.findMany({
      where: {
        teacherId: teacher.id,
      },
      select: {
        id: true,
      },
    })

    const classIds = teacherClasses.map((c) => c.id)

    // Build the query
    const whereClause: any = {
      classId: {
        in: classIds,
      },
    }

    if (classId && classId !== "all") {
      whereClause.classId = classId
    }

    if (date) {
      const selectedDate = new Date(date)
      whereClause.date = {
        gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
        lte: new Date(selectedDate.setHours(23, 59, 59, 999)),
      }
    }

    if (status && status !== "all") {
      whereClause.status = status
    }

    if (search) {
      whereClause.student = {
        OR: [
          {
            firstName: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            lastName: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      }
    }

    const attendance = await db.attendance.findMany({
      where: whereClause,
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
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    })
  }
}

