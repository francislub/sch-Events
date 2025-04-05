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
    const months = searchParams.get("months") ? Number.parseInt(searchParams.get("months") as string) : 3

    if (!studentId) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 })
    }

    // Get current date
    const currentDate = new Date()

    // Generate monthly summary for the past X months
    const monthlyData = []

    for (let i = 0; i < months; i++) {
      const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0)

      // Get attendance records for this month
      const attendanceRecords = await db.attendance.findMany({
        where: {
          studentId,
          date: {
            gte: month,
            lte: nextMonth,
          },
        },
      })

      // Calculate statistics
      const present = attendanceRecords.filter((record) => record.status === "Present").length
      const absent = attendanceRecords.filter((record) => record.status === "Absent").length
      const late = attendanceRecords.filter((record) => record.status === "Late").length
      const total = attendanceRecords.length

      const rate = total > 0 ? `${Math.round((present / total) * 100)}%` : "N/A"

      monthlyData.push({
        month: month.toLocaleString("default", { month: "long", year: "numeric" }),
        present,
        absent,
        late,
        rate,
      })
    }

    return NextResponse.json(monthlyData)
  } catch (error) {
    console.error("Error fetching attendance summary:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

