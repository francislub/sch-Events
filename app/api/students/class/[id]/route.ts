import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only teachers and admins can access this endpoint
    if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const classId = params.id

    // If teacher, verify they teach this class
    if (session.user.role === "TEACHER") {
      const teacher = await db.teacher.findUnique({
        where: {
          userId: session.user.id,
        },
      })

      if (!teacher) {
        return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 })
      }

      const classExists = await db.class.findFirst({
        where: {
          id: classId,
          teacherId: teacher.id,
        },
      })

      if (!classExists) {
        return NextResponse.json({ error: "Class not found or not assigned to this teacher" }, { status: 404 })
      }
    }

    // Get class details
    const classDetails = await db.class.findUnique({
      where: {
        id: classId,
      },
      select: {
        id: true,
        name: true,
        grade: true,
        section: true,
      },
    })

    if (!classDetails) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 })
    }

    // Get students in this class
    const students = await db.student.findMany({
      where: {
        classId: classId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        admissionNumber: true,
        grade: true,
        section: true,
        gender: true,
        user: {
          select: {
            email: true,
          },
        },
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    })

    // Check if there are any existing attendance records for today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const existingAttendance = await db.attendance.findMany({
      where: {
        studentId: {
          in: students.map((student) => student.id),
        },
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    })

    // Map existing attendance to student IDs
    const attendanceMap = new Map()
    existingAttendance.forEach((record) => {
      attendanceMap.set(record.studentId, record.status)
    })

    // Format students for response
    const formattedStudents = students.map((student) => ({
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      name: `${student.firstName} ${student.lastName}`,
      admissionNumber: student.admissionNumber,
      grade: student.grade,
      section: student.section,
      gender: student.gender,
      email: student.user?.email || "",
      existingAttendance: attendanceMap.get(student.id) || null,
    }))

    return NextResponse.json({
      class: classDetails,
      students: formattedStudents,
      hasExistingAttendance: existingAttendance.length > 0,
    })
  } catch (error) {
    console.error("Error fetching students by class:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

