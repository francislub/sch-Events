import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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
        students: {
          include: {
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
          },
        },
      },
    })

    // Extract unique parents
    const parentsMap = new Map()

    classes.forEach((cls) => {
      cls.students.forEach((student) => {
        if (student.parent && student.parent.user) {
          const parentId = student.parent.user.id

          if (!parentsMap.has(parentId)) {
            parentsMap.set(parentId, {
              id: parentId,
              name: student.parent.user.name,
              email: student.parent.user.email,
              children: [],
            })
          }

          // Add this student to the parent's children list
          const parent = parentsMap.get(parentId)
          const childExists = parent.children.some((child: any) => child.id === student.id)

          if (!childExists) {
            parent.children.push({
              id: student.id,
              firstName: student.firstName,
              lastName: student.lastName,
              grade: student.grade,
              section: student.section,
            })
          }
        }
      })
    })

    // Convert map to array
    const parents = Array.from(parentsMap.values())

    return NextResponse.json(parents)
  } catch (error) {
    console.error("Error fetching parents:", error)
    return NextResponse.json({ error: "Failed to fetch parents" }, { status: 500 })
  }
}

