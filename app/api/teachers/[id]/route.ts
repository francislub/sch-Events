import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    try {
      const teacher = await db.teacher.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          classes: {
            include: {
              students: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      })

      if (!teacher) {
        return NextResponse.json({ error: "Teacher not found" }, { status: 404 })
      }

      return NextResponse.json({
        ...teacher,
        createdAt: teacher.user.createdAt,
        updatedAt: teacher.user.updatedAt,
      })
    } catch (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json({ error: "Failed to fetch teacher data" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error fetching teacher:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const body = await req.json()

    try {
      const updatedTeacher = await db.teacher.update({
        where: { id },
        data: {
          department: body.department,
          qualification: body.qualification,
          contactNumber: body.contactNumber,
          address: body.address,
          user: {
            update: {
              name: body.name,
              email: body.email,
            },
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          classes: {
            include: {
              students: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      })

      return NextResponse.json(updatedTeacher)
    } catch (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json({ error: "Failed to update teacher" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error updating teacher:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    try {
      // Check if teacher has classes assigned
      const teacher = await db.teacher.findUnique({
        where: { id },
        include: {
          classes: true,
        },
      })

      if (!teacher) {
        return NextResponse.json({ error: "Teacher not found" }, { status: 404 })
      }

      if (teacher.classes.length > 0) {
        return NextResponse.json(
          { error: "Cannot delete teacher with assigned classes. Please reassign classes first." },
          { status: 400 },
        )
      }

      // Delete the teacher (this will cascade delete the user due to onDelete: Cascade)
      await db.teacher.delete({
        where: { id },
      })

      return NextResponse.json({ success: true })
    } catch (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json({ error: "Failed to delete teacher" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error deleting teacher:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
