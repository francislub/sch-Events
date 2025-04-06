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

    // Get parents of students in teacher's classes
    const parents = await db.parent.findMany({
      where: {
        students: {
          some: {
            classId: {
              in: classIds,
            },
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        students: {
          where: {
            classId: {
              in: classIds,
            },
          },
          include: {
            class: true,
          },
        },
      },
    })

    // Format the response
    const formattedParents = parents.map((parent) => ({
      id: parent.user.id,
      name: parent.user.name,
      email: parent.user.email,
      children: parent.students.map((student) => ({
        id: student.id,
        name: `${student.firstName} ${student.lastName}`,
        class: student.class ? student.class.name : "N/A",
      })),
    }))

    return NextResponse.json(formattedParents)
  } catch (error) {
    console.error("Error fetching teacher parents:", error)
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    })
  }
}

