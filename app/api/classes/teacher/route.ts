import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
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

    // Get the teacher profile
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
      include: {
        _count: {
          select: {
            students: true,
          },
        },
      },
      orderBy: [{ grade: "asc" }, { section: "asc" }],
    })

    // Format classes for response
    const formattedClasses = classes.map((cls) => ({
      id: cls.id,
      name: cls.name || `${cls.grade}${cls.section}`,
      grade: cls.grade,
      section: cls.section,
      studentCount: cls._count.students,
    }))

    return NextResponse.json(formattedClasses)
  } catch (error) {
    console.error("Error fetching teacher classes:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

