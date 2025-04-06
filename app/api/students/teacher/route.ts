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

    // Get URL parameters
    const url = new URL(req.url)
    const classId = url.searchParams.get("classId")
    const searchTerm = url.searchParams.get("search") || ""

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
        name: true,
        grade: true,
        section: true,
      },
    })

    // If no classes found, return empty array
    if (classes.length === 0) {
      return NextResponse.json({ students: [], classes: [] })
    }

    // Get class IDs
    const classIds = classes.map((cls) => cls.id)

    // Build where clause for students query
    let whereClause: any = {
      classId: {
        in: classIds,
      },
    }

    // Add class filter if provided
    if (classId && classId !== "all") {
      whereClause.classId = classId
    }

    // Add search filter if provided
    if (searchTerm) {
      whereClause = {
        ...whereClause,
        OR: [
          { firstName: { contains: searchTerm, mode: "insensitive" } },
          { lastName: { contains: searchTerm, mode: "insensitive" } },
          { admissionNumber: { contains: searchTerm, mode: "insensitive" } },
        ],
      }
    }

    // Get students in these classes
    const students = await db.student.findMany({
      where: whereClause,
      include: {
        class: true,
        parent: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        user: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        lastName: "asc",
      },
    })

    // Format students for response
    const formattedStudents = students.map((student) => ({
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      name: `${student.firstName} ${student.lastName}`,
      email: student.user?.email || "",
      admissionNumber: student.admissionNumber,
      grade: student.grade,
      gender: student.gender,
      class: {
        id: student.class.id,
        name: student.class.name,
        grade: student.class.grade,
        section: student.class.section,
      },
      parent: student.parent
        ? {
            id: student.parent.id,
            name: student.parent.user.name,
            email: student.parent.user.email,
          }
        : null,
    }))

    return NextResponse.json({
      students: formattedStudents,
      classes,
    })
  } catch (error) {
    console.error("Error fetching teacher students:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

