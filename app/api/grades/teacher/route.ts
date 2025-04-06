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

    const { searchParams } = new URL(request.url)

    const classId = searchParams.get("classId")
    const subjectId = searchParams.get("subjectId")
    const term = searchParams.get("term")
    const search = searchParams.get("search")

    // Get teacher's classes
    const teacherClasses = await db.class.findMany({
      where: {
        teacherId: teacher.id,
      },
      select: {
        id: true,
      },
    })

    const classIds = teacherClasses.map((c) => c.id)

    // Build the query
    const whereClause: any = {
      classId: {
        in: classIds,
      },
    }

    if (classId && classId !== "all") {
      whereClause.classId = classId
    }

    if (subjectId && subjectId !== "all") {
      whereClause.subjectId = subjectId
    }

    if (term && term !== "all") {
      whereClause.termId = term
    }

    if (search) {
      whereClause.student = {
        OR: [
          {
            firstName: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            lastName: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      }
    }

    const grades = await db.grade.findMany({
      where: whereClause,
      include: {
        student: true,
        class: true,
        subject: true,
        term: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(grades)
  } catch (error) {
    console.error("Error fetching teacher grades:", error)
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    })
  }
}

