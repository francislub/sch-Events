import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "TEACHER") {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      })
    }

    const teacherId = session.user.id

    // Get classes taught by the teacher
    const classes = await prisma.class.findMany({
      where: {
        teacherId,
      },
      include: {
        students: true,
        subjects: true,
      },
    })

    // Format the response
    const formattedClasses = classes.map((cls) => ({
      id: cls.id,
      name: cls.name,
      section: cls.section,
      studentCount: cls.students.length,
      subjects: cls.subjects.map((subject) => subject.name),
    }))

    return NextResponse.json(formattedClasses)
  } catch (error) {
    console.error("Error fetching teacher classes:", error)
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    })
  }
}

