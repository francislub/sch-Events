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

    // Check if the user is authorized to view this student's attendance
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
        return NextResponse.json({ error: "You are not authorized to view this student's attendance" }, { status: 403 })
      }
    }

    // Get current month
    const currentDate = new Date()
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

    // Get attendance records for current month
    const attendanceRecords = await db.attendance.findMany({
      where: {
        studentId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    })

    // Calculate statistics
    const present = attendanceRecords.filter((record) => record.status === "Present").length
    const absent = attendanceRecords.filter((record) => record.status === "Absent").length
    const late = attendanceRecords.filter((record) => record.status === "Late").length
    const total = attendanceRecords.length

    const rate = total > 0 ? `${Math.round((present / total) * 100)}%` : "N/A"

    return NextResponse.json({
      present,
      absent,
      late,
      rate,
    })
  } catch (error) {
    console.error("Error fetching attendance summary:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

