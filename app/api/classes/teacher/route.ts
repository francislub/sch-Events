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
    const classes = await db.class.findMany({
      where: {
        teacherId: teacher.id,
      },
      include: {
        students: true,
        schedule: true,
      },
    })

    // Format the response
    const formattedClasses = classes.map((cls) => {
      // Get subjects from schedule
      const subjects = [...new Set(cls.schedule.map((s) => s.subject))]

      return {
        id: cls.id,
        name: cls.name,
        grade: cls.grade,
        section: cls.section,
        studentCount: cls.students.length,
        subjects: subjects,
        schedule: cls.schedule.map((s) => ({
          day: s.day,
          time: `${s.startTime} - ${s.endTime}`,
          room: s.room,
          subject: s.subject,
        })),
      }
    })

    return NextResponse.json(formattedClasses)
  } catch (error) {
    console.error("Error fetching teacher classes:", error)
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    })
  }
}

