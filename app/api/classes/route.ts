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

    // Get all classes
    const classes = await db.class.findMany({
      include: {
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
      orderBy: {
        grade: "asc",
      },
    })

    return NextResponse.json(classes)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("Error fetching classes:", errorMessage)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

