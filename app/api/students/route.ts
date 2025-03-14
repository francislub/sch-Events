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

    // Only admin can add students
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { firstName, lastName, dateOfBirth, gender, enrollmentDate, grade, section, parentId, classId } =
      await req.json()

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !dateOfBirth ||
      !gender ||
      !enrollmentDate ||
      !grade ||
      !section ||
      !parentId ||
      !classId
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create student
    const student = await db.student.create({
      data: {
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        enrollmentDate: new Date(enrollmentDate),
        grade,
        section,
        parentId,
        classId,
      },
    })

    return NextResponse.json({ message: "Student added successfully", student }, { status: 201 })
  } catch (error) {
    console.error("Error adding student:", error)
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
    const section = searchParams.get("section")

    // Build filter
    const filter: any = {}

    if (grade) {
      filter.grade = grade
    }

    if (section) {
      filter.section = section
    }

    // If parent, only show their children
    if (session.user.role === "PARENT") {
      const parent = await db.parent.findUnique({
        where: {
          userId: session.user.id,
        },
      })

      if (!parent) {
        return NextResponse.json({ error: "Parent profile not found" }, { status: 404 })
      }

      filter.parentId = parent.id
    }

    // Get students
    const students = await db.student.findMany({
      where: filter,
      include: {
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
        class: true,
      },
    })

    return NextResponse.json(students)
  } catch (error) {
    console.error("Error fetching students:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

