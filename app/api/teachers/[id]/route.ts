import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  console.log("🔍 Teacher detail API called for ID:", id)

  try {
    const session = await getServerSession(authOptions)
    console.log("📝 Session:", session?.user?.email, "Role:", session?.user?.role)

    if (!session) {
      console.log("❌ No session found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const teacherId = id
    console.log("👨‍🏫 Fetching teacher with ID:", teacherId)

    try {
      const teacher = await db.teacher.findUnique({
        where: {
          id: teacherId,
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
          subjects: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      if (!teacher) {
        console.log("❌ Teacher not found with ID:", teacherId)
        return NextResponse.json({ error: "Teacher not found" }, { status: 404 })
      }

      console.log("✅ Teacher found:", teacher.firstName, teacher.lastName)
      console.log("📊 Teacher data:", {
        classes: teacher.classes?.length || 0,
        subjects: teacher.subjects?.length || 0,
        totalStudents: teacher.classes?.reduce((acc, cls) => acc + cls.students.length, 0) || 0,
      })

      return NextResponse.json(teacher)
    } catch (dbError) {
      console.log("💥 Database error fetching teacher:", dbError instanceof Error ? dbError.message : String(dbError))
      return NextResponse.json({ error: "Failed to fetch teacher data" }, { status: 500 })
    }
  } catch (error) {
    console.log("💥 Error in teacher API:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  console.log("✏️ Teacher update API called for ID:", id)

  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      console.log("❌ Unauthorized update attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    console.log("📝 Update data:", body)

    try {
      const updatedTeacher = await db.teacher.update({
        where: { id },
        data: {
          firstName: body.firstName,
          lastName: body.lastName,
          dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
          gender: body.gender,
          phone: body.phone,
          address: body.address,
          qualification: body.qualification,
          experience: body.experience,
          salary: body.salary ? Number.parseFloat(body.salary) : undefined,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
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
          subjects: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      console.log("✅ Teacher updated successfully")
      return NextResponse.json(updatedTeacher)
    } catch (dbError) {
      console.log("💥 Database error updating teacher:", dbError instanceof Error ? dbError.message : String(dbError))
      return NextResponse.json({ error: "Failed to update teacher" }, { status: 500 })
    }
  } catch (error) {
    console.log("💥 Error updating teacher:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  console.log("🗑️ Teacher delete API called for ID:", id)

  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      console.log("❌ Unauthorized delete attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
      await db.teacher.delete({
        where: { id },
      })

      console.log("✅ Teacher deleted successfully")
      return NextResponse.json({ success: true })
    } catch (dbError) {
      console.log("💥 Database error deleting teacher:", dbError instanceof Error ? dbError.message : String(dbError))
      return NextResponse.json({ error: "Failed to delete teacher" }, { status: 500 })
    }
  } catch (error) {
    console.log("💥 Error deleting teacher:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
