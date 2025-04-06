import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "TEACHER") {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      })
    }

    // Find teacher profile
    const teacher = await db.teacher.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    if (!teacher) {
      return new NextResponse(JSON.stringify({ error: "Teacher profile not found" }), {
        status: 404,
      })
    }

    // Get classes taught by this teacher
    const teacherClasses = await db.class.findMany({
      where: {
        teacherId: teacher.id,
      },
      select: {
        id: true,
      },
    })

    const classIds = teacherClasses.map((c) => c.id)

    // Get students in teacher's classes
    const students = await db.student.findMany({
      where: {
        classId: {
          in: classIds,
        },
      },
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
        class: true,
      },
    })

    // Group students by parent
    const parentMap = new Map()

    students.forEach((student) => {
      if (!student.parent) return

      const parentId = student.parent.user.id
      if (!parentMap.has(parentId)) {
        parentMap.set(parentId, {
          id: parentId,
          name: student.parent.user.name,
          email: student.parent.user.email,
          children: [],
        })
      }

      parentMap.get(parentId).children.push({
        id: student.id,
        name: `${student.firstName} ${student.lastName}`,
        class: `${student.class.grade}-${student.class.section}`,
      })
    })

    // Convert map to array
    const formattedParents = Array.from(parentMap.values())

    return NextResponse.json(formattedParents)
  } catch (error) {
    console.error("Error fetching teacher parents:", error)
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    })
  }
}

