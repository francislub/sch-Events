import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only teachers and admins can mark attendance
    if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { date, status, studentId } = await req.json()

    // Validate required fields
    if (!date || !status || !studentId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // If teacher, verify they teach the student
    if (session.user.role === "TEACHER") {
      const teacher = await db.teacher.findUnique({
        where: {
          userId: session.user.id,
        },
        include: {
          classes: {
            include: {
              students: {
                where: {
                  id: studentId,
                },
              },
            },
          },
        },
      })

      if (!teacher) {
        return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 })
      }

      // Check if student is in one of the teacher's classes
      const hasStudent = teacher.classes.some((cls) => cls.students.some((student) => student.id === studentId))

      if (!hasStudent) {
        return NextResponse.json(
          { error: "You are not authorized to mark attendance for this student" },
          { status: 403 },
        )
      }
    }

    // Check if attendance record already exists for this date and student
    const existingAttendance = await db.attendance.findFirst({
      where: {
        date: new Date(date),
        studentId,
      },
    })

    if (existingAttendance) {
      // Update existing record
      const updatedAttendance = await db.attendance.update({
        where: {
          id: existingAttendance.id,
        },
        data: {
          status,
        },
      })

      return NextResponse.json(
        { message: "Attendance updated successfully", attendance: updatedAttendance },
        { status: 200 },
      )
    }

    // Create new attendance record
    const attendance = await db.attendance.create({
      data: {
        date: new Date(date),
        status,
        studentId,
      },
    })

    return NextResponse.json({ message: "Attendance marked successfully", attendance }, { status: 201 })
  } catch (error) {
    console.error("Error marking attendance:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get("studentId")
    const classId = searchParams.get("classId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Build filter
    const filter: any = {}

    if (studentId) {
      filter.studentId = studentId
    }

    if (startDate || endDate) {
      filter.date = {}

      if (startDate) {
        filter.date.gte = new Date(startDate)
      }

      if (endDate) {
        filter.date.lte = new Date(endDate)
      }
    }

    // If class ID is provided, get all students in that class
    if (classId && !studentId) {
      const students = await db.student.findMany({
        where: {
          classId,
        },
        select: {
          id: true,
        },
      })

      const studentIds = students.map((student) => student.id)

      filter.studentId = {
        in: studentIds,
      }
    }

    // If parent, only show attendance for their children
    if (session.user.role === "PARENT") {
      const parent = await db.parent.findUnique({
        where: {
          userId: session.user.id,
        },
        include: {
          children: {
            select: {
              id: true,
            },
          },
        },
      })

      if (!parent) {
        return NextResponse.json({ error: "Parent profile not found" }, { status: 404 })
      }

      const childrenIds = parent.children.map((child) => child.id)

      if (!studentId || !childrenIds.includes(studentId)) {
        filter.studentId = {
          in: childrenIds,
        }
      }
    }

    // If teacher, only show attendance for students they teach
    if (session.user.role === "TEACHER" && !studentId && !classId) {
      const teacher = await db.teacher.findUnique({
        where: {
          userId: session.user.id,
        },
        include: {
          classes: {
            include: {
              students: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      })

      if (!teacher) {
        return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 })
      }

      const studentIds = teacher.classes.flatMap((cls) => cls.students.map((student) => student.id))

      filter.studentId = {
        in: studentIds,
      }
    }

    // Get attendance records
    const attendance = await db.attendance.findMany({
      where: filter,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            grade: true,
            section: true,
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    })

    return NextResponse.json(attendance)
  } catch (error) {
    console.error("Error fetching attendance:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

