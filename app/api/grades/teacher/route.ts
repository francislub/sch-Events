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
    const { searchParams } = new URL(request.url)

    const classId = searchParams.get("classId")
    const subject = searchParams.get("subject")
    const term = searchParams.get("term")
    const search = searchParams.get("search")

    // Get teacher's classes
    const teacherClasses = await prisma.class.findMany({
      where: {
        teacherId,
      },
      select: {
        id: true,
      },
    })

    const classIds = teacherClasses.map((c) => c.id)

    // Build the query
    const whereClause: any = {
      OR: [
        {
          student: {
            classId: {
              in: classIds,
            },
          },
        },
        {
          classId: {
            in: classIds,
          },
        },
      ],
    }

    if (classId) {
      whereClause.classId = classId
    }

    if (subject) {
      whereClause.subject = subject
    }

    if (term) {
      whereClause.term = term
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

    const grades = await prisma.grade.findMany({
      where: whereClause,
      include: {
        student: {
          include: {
            class: true,
          },
        },
        class: true,
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

