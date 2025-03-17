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
    const status = searchParams.get("status")
    const grade = searchParams.get("grade")
    const section = searchParams.get("section")

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

    if (status) {
      filter.status = status
    }

    // If class ID is provided, get all students in that class
    if (classId) {
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

    // If grade and/or section is provided, filter students by grade/section
    if (grade || section) {
      const studentFilter: any = {}

      if (grade) {
        studentFilter.grade = grade
      }

      if (section) {
        studentFilter.section = section
      }

      const students = await db.student.findMany({
        where: studentFilter,
        select: {
          id: true,
        },
      })

      const studentIds = students.map((student) => student.id)

      // If studentId filter already exists, intersect with the new filter
      if (filter.studentId && filter.studentId.in) {
        filter.studentId.in = filter.studentId.in.filter((id: string) => studentIds.includes(id))
      } else {
        filter.studentId = {
          in: studentIds,
        }
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

      // If studentId filter already exists, intersect with the new filter
      if (filter.studentId && filter.studentId.in) {
        filter.studentId.in = filter.studentId.in.filter((id: string) => childrenIds.includes(id))
      } else if (studentId && !childrenIds.includes(studentId)) {
        // If specific studentId is requested but not a child of this parent
        return NextResponse.json({ error: "Unauthorized to view this student's attendance" }, { status: 403 })
      } else {
        filter.studentId = {
          in: childrenIds,
        }
      }
    }

    // If teacher, only show attendance for students they teach
    if (session.user.role === "TEACHER" && !studentId && !classId && !grade && !section) {
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

      // If studentId filter already exists, intersect with the new filter
      if (filter.studentId && filter.studentId.in) {
        filter.studentId.in = filter.studentId.in.filter((id: string) => studentIds.includes(id))
      } else {
        filter.studentId = {
          in: studentIds,
        }
      }
    }

    // Get attendance records with pagination
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const skip = (page - 1) * limit

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
                teacher: {
                  include: {
                    user: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        date: "desc",
      },
      skip,
      take: limit,
    })

    // Get total count for pagination
    const totalCount = await db.attendance.count({
      where: filter,
    })

    // Get attendance statistics
    const stats = await db.attendance.groupBy({
      by: ["status"],
      where: filter,
      _count: {
        status: true,
      },
    })

    const statistics = {
      total: totalCount,
      present: stats.find((s) => s.status === "Present")?._count.status || 0,
      absent: stats.find((s) => s.status === "Absent")?._count.status || 0,
      late: stats.find((s) => s.status === "Late")?._count.status || 0,
    }

    return NextResponse.json({
      attendance,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
      statistics,
    })
  } catch (error) {
    console.error("Error fetching attendance:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

// Add a DELETE method to allow admins to delete attendance records
export async function DELETE(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admins can delete attendance records
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing attendance record ID" }, { status: 400 })
    }

    // Delete the attendance record
    await db.attendance.delete({
      where: {
        id,
      },
    })

    return NextResponse.json({ message: "Attendance record deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting attendance record:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

