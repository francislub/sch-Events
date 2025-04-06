import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: Request, { params }: { params: { id: string } }) {
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
        include: {
          classes: {
            where: {
              id: classId,
            },
          },
        },
      })

      if (!teacher) {
        return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 })
      }

      if (teacher.classes.length === 0) {
        return NextResponse.json({ error: "You do not teach this class" }, { status: 403 })
      }
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
        gender: true,
        grade: true,
        section: true,
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    })

    return NextResponse.json(students)
  } catch (error) {
    console.error("Error fetching students by class:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

