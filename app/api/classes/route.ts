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

    // Only admin can add classes
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { name, grade, section, teacherId } = await req.json()

    // Validate required fields
    if (!name || !grade || !section || !teacherId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create class
    const classData = await db.class.create({
      data: {
        name,
        grade,
        section,
        teacherId,
      },
    })

    return NextResponse.json({ message: "Class added successfully", class: classData }, { status: 201 })
  } catch (error) {
    console.error("Error adding class:", error)
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
    const grade = searchParams.get("grade")
    const teacherId = searchParams.get("teacherId")

    // Build filter
    const filter: any = {}

    if (grade) {
      filter.grade = grade
    }

    if (teacherId) {
      filter.teacherId = teacherId
    }

    // If teacher, only show their classes
    if (session.user.role === "TEACHER") {
      const teacher = await db.teacher.findUnique({
        where: {
          userId: session.user.id,
        },
      })

      if (!teacher) {
        return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 })
      }

      filter.teacherId = teacher.id
    }

    // Get classes
    const classes = await db.class.findMany({
      where: filter,
      include: {
        teacher: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        students: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            grade: true,
            section: true,
          },
        },
      },
    })

    return NextResponse.json(classes)
  } catch (error) {
    console.error("Error fetching classes:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

