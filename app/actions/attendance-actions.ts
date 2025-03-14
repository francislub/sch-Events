"use server"

import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Define validation schema
const attendanceSchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  studentId: z.string(),
  status: z.enum(["Present", "Absent", "Late"], {
    message: "Status must be one of: Present, Absent, Late",
  }),
})

export async function markAttendance(formData: FormData) {
  // Check authentication
  const session = await getServerSession(authOptions)

  if (!session) {
    return {
      success: false,
      errors: {
        _form: ["You must be logged in to mark attendance"],
      },
    }
  }

  // Only teachers and admins can mark attendance
  if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN") {
    return {
      success: false,
      errors: {
        _form: ["You do not have permission to mark attendance"],
      },
    }
  }

  // Extract and validate form data
  const rawData = {
    date: formData.get("date") as string,
    studentId: formData.get("studentId") as string,
    status: formData.get("status") as string,
  }

  // Validate data
  const validationResult = attendanceSchema.safeParse(rawData)

  if (!validationResult.success) {
    return {
      success: false,
      errors: validationResult.error.flatten().fieldErrors,
    }
  }

  try {
    // Check if attendance record already exists for this student on this date
    const existingAttendance = await db.attendance.findFirst({
      where: {
        studentId: rawData.studentId,
        date: new Date(rawData.date),
      },
    })

    if (existingAttendance) {
      // Update existing record
      await db.attendance.update({
        where: {
          id: existingAttendance.id,
        },
        data: {
          status: rawData.status,
        },
      })
    } else {
      // Create new record
      await db.attendance.create({
        data: {
          date: new Date(rawData.date),
          studentId: rawData.studentId,
          status: rawData.status,
        },
      })
    }

    // Revalidate the attendance page
    revalidatePath("/dashboard/teacher/attendance")
    revalidatePath("/dashboard/admin/attendance")
    revalidatePath("/dashboard/parent/attendance")

    return {
      success: true,
      message: "Attendance marked successfully",
    }
  } catch (error) {
    console.error("Error marking attendance:", error)
    return {
      success: false,
      errors: {
        _form: ["Something went wrong. Please try again."],
      },
    }
  }
}

export async function getAttendance(studentId: string, month: string) {
  // Check authentication
  const session = await getServerSession(authOptions)

  if (!session) {
    return {
      success: false,
      errors: {
        _form: ["You must be logged in to view attendance"],
      },
    }
  }

  try {
    // Parse month (format: YYYY-MM)
    const [year, monthNum] = month.split("-").map(Number)

    // Create date range for the month
    const startDate = new Date(year, monthNum - 1, 1)
    const endDate = new Date(year, monthNum, 0) // Last day of the month

    // Get attendance records
    const attendance = await db.attendance.findMany({
      where: {
        studentId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: "asc",
      },
    })

    return {
      success: true,
      data: attendance,
    }
  } catch (error) {
    console.error("Error fetching attendance:", error)
    return {
      success: false,
      errors: {
        _form: ["Something went wrong. Please try again."],
      },
    }
  }
}

