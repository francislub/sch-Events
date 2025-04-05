import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get("studentId")

    if (!studentId) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 })
    }

    // Check if the user is authorized to view this student's grades
    if (session.user.role === "PARENT") {
      const parent = await db.parent.findUnique({
        where: {
          userId: session.user.id,
        },
      })

      if (!parent) {
        return NextResponse.json({ error: "Parent profile not found" }, { status: 404 })
      }

      const student = await db.student.findUnique({
        where: {
          id: studentId,
        },
      })

      if (!student || student.parentId !== parent.id) {
        return NextResponse.json({ error: "You are not authorized to view this student's grades" }, { status: 403 })
      }
    }

    // Get all grades for the student
    const grades = await db.grade.findMany({
      where: {
        studentId,
      },
    })

    if (grades.length === 0) {
      return NextResponse.json({
        gpa: "N/A",
        highestGrade: 0,
        highestSubject: "",
        averageScore: 0,
      })
    }

    // Calculate GPA
    const gradePoints: { [key: string]: number } = {
      A: 4.0,
      "A-": 3.7,
      "B+": 3.3,
      B: 3.0,
      "B-": 2.7,
      "C+": 2.3,
      C: 2.0,
      "C-": 1.7,
      "D+": 1.3,
      D: 1.0,
      F: 0.0,
    }

    const totalPoints = grades.reduce((sum, grade) => {
      return sum + (gradePoints[grade.grade] || 0)
    }, 0)

    const gpa = (totalPoints / grades.length).toFixed(2)

    // Find highest grade
    const highestGrade = Math.max(...grades.map((g) => g.score))
    const highestGradeSubject = grades.find((g) => g.score === highestGrade)?.subject || ""

    // Calculate average score
    const averageScore = Number.parseFloat(
      (grades.reduce((sum, grade) => sum + grade.score, 0) / grades.length).toFixed(1),
    )

    return NextResponse.json({
      gpa,
      highestGrade,
      highestSubject: highestGradeSubject,
      averageScore,
    })
  } catch (error) {
    console.error("Error fetching grade summary:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

