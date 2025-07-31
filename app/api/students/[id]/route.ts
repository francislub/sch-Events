import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  console.log("🔍 Student detail API called for ID:", params.id)

  try {
    const session = await getServerSession(authOptions)
    console.log("📝 Session:", session?.user?.email, "Role:", session?.user?.role)

    if (!session) {
      console.log("❌ No session found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const studentId = params.id
    console.log("🎓 Fetching student with ID:", studentId)

    try {
      const student = await db.student.findUnique({
        where: {
          id: studentId,
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
          parent: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          class: {
            include: {
              teacher: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
          grades: {
            orderBy: {
              createdAt: "desc",
            },
            take: 10,
            include: {
              subject: {
                select: {
                  name: true,
                },
              },
            },
          },
          attendances: {
            orderBy: {
              date: "desc",
            },
            take: 10,
          },
        },
      })

      if (!student) {
        console.log("❌ Student not found with ID:", studentId)
        return NextResponse.json({ error: "Student not found" }, { status: 404 })
      }

      console.log("✅ Student found:", student.firstName, student.lastName)
      console.log("📊 Student data:", {
        grades: student.grades?.length || 0,
        attendances: student.attendances?.length || 0,
        hasParent: !!student.parent,
        hasClass: !!student.class,
      })

      // Check authorization
      if (session.user.role === "PARENT") {
        const parent = await db.parent.findUnique({
          where: {
            userId: session.user.id,
          },
        })

        if (!parent || student.parentId !== parent.id) {
          console.log("❌ Parent not authorized to view this student")
          return NextResponse.json({ error: "You are not authorized to view this student" }, { status: 403 })
        }
      }

      return NextResponse.json(student)
    } catch (dbError) {
      console.error("💥 Database error fetching student:", dbError)
      return NextResponse.json({ error: "Failed to fetch student data" }, { status: 500 })
    }
  } catch (error) {
    console.error("💥 Error in student API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  console.log("✏️ Student update API called for ID:", params.id)

  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      console.log("❌ Unauthorized update attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const body = await req.json()
    console.log("📝 Update data:", body)

    try {
      const updatedStudent = await db.student.update({
        where: { id },
        data: {
          firstName: body.firstName,
          lastName: body.lastName,
          dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
          gender: body.gender,
          grade: body.grade,
          section: body.section,
          address: body.address,
          classId: body.classId,
          parentId: body.parentId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          parent: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          class: {
            include: {
              teacher: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
      })

      console.log("✅ Student updated successfully")
      return NextResponse.json(updatedStudent)
    } catch (dbError) {
      console.error("💥 Database error updating student:", dbError)
      return NextResponse.json({ error: "Failed to update student" }, { status: 500 })
    }
  } catch (error) {
    console.error("💥 Error updating student:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  console.log("🗑️ Student delete API called for ID:", params.id)

  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      console.log("❌ Unauthorized delete attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    try {
      await db.student.delete({
        where: { id },
      })

      console.log("✅ Student deleted successfully")
      return NextResponse.json({ success: true })
    } catch (dbError) {
      console.error("💥 Database error deleting student:", dbError)
      return NextResponse.json({ error: "Failed to delete student" }, { status: 500 })
    }
  } catch (error) {
    console.error("💥 Error deleting student:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
