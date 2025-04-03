import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only teachers and admins can add grades
    if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { subject, term, score, grade, remarks, studentId } = await req.json()

    // Validate required fields
    if (!subject || !term || score === undefined || !grade || !studentId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // If teacher, verify they teach the student
    if (session.user.role === "TEACHER") {
      const teacher = await db.teacher.findUnique({
        where: {
          userId: session.user.id,
        },
        include: {
          classes: {
            include: {
              students: {
                where: {
                  id: studentId,
                },
              },
            },
          },
        },
      })

      if (!teacher) {
        return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 })
      }

      // Check if student is in one of the teacher's classes
      const hasStudent = teacher.classes.some((cls) => cls.students.some((student) => student.id === studentId))

      if (!hasStudent) {
        return NextResponse.json({ error: "You are not authorized to grade this student" }, { status: 403 })
      }
    }

    // Create grade
    const gradeRecord = await db.grade.create({
      data: {
        subject,
        term,
        score,
        grade,
        remarks,
        studentId,
      },
    })

    return NextResponse.json({ message: "Grade added successfully", grade: gradeRecord }, { status: 201 })
  } catch (error) {
    console.error("Error adding grade:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get("studentId")
    const subject = searchParams.get("subject")
    const term = searchParams.get("term")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    // Build filter
    const filter: any = {}

    if (studentId) {
      filter.studentId = studentId
    }

    if (subject) {
      filter.subject = subject
    }

    if (term) {
      filter.term = term
    }

    // If student role, only show their own grades
    if (session.user.role === "STUDENT") {
      const student = await db.student.findUnique({
        where: {
          userId: session.user.id,
        },
      })

      if (!student) {
        return NextResponse.json({ error: "Student profile not found" }, { status: 404 })
      }

      // Override any other filters to only show this student's grades
      filter.studentId = student.id
    }
    // If parent, only show grades for their children
    else if (session.user.role === "PARENT") {
      const parent = await db.parent.findUnique({
        where: {
          userId: session.user.id,
        },
        include: {
          children: {
            select: {
              id: true,
            },
          },
        },
      })

      if (!parent) {
        return NextResponse.json({ error: "Parent profile not found" }, { status: 404 })
      }

      const childrenIds = parent.children.map((child) => child.id)

      if (studentId && !childrenIds.includes(studentId)) {
        // If specific studentId is requested but not a child of this parent
        return NextResponse.json({ error: "Unauthorized to view this student's grades" }, { status: 403 })
      }

      if (studentId) {
        // Keep the specific student filter if it's one of the parent's children
        filter.studentId = studentId
      } else {
        // Otherwise, show grades for all children
        filter.studentId = {
          in: childrenIds,
        }
      }
    }
    // If teacher, only show grades for students they teach
    else if (session.user.role === "TEACHER" && !studentId) {
      const teacher = await db.teacher.findUnique({
        where: {
          userId: session.user.id,
        },
        include: {
          classes: {
            include: {
              students: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      })

      if (!teacher) {
        return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 })
      }

      const studentIds = teacher.classes.flatMap((cls) => cls.students.map((student) => student.id))

      filter.studentId = {
        in: studentIds,
      }
    }

    // Get grades with pagination
    const page = Number.parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    const grades = await db.grade.findMany({
      where: filter,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            grade: true,
            section: true,
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    })

    // Get total count for pagination
    const totalCount = await db.grade.count({
      where: filter,
    })

    // Return the grades array directly to fix the "grades.map is not a function" error
    return NextResponse.json(grades)
  } catch (error) {
    console.error("Error fetching grades:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

