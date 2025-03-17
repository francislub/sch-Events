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

// Define bulk attendance schema
const bulkAttendanceSchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  classId: z.string(),
  attendanceData: z.record(z.string(), z.enum(["Present", "Absent", "Late"])),
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

export async function markBulkAttendance(formData: FormData) {
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
  const date = formData.get("date") as string
  const classId = formData.get("classId") as string

  // Extract attendance data from form
  const attendanceData: Record<string, string> = {}
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("student-")) {
      const studentId = key.replace("student-", "")
      attendanceData[studentId] = value as string
    }
  }

  // Validate data
  const validationResult = bulkAttendanceSchema.safeParse({
    date,
    classId,
    attendanceData,
  })

  if (!validationResult.success) {
    return {
      success: false,
      errors: validationResult.error.flatten().fieldErrors,
    }
  }

  try {
    // Process each student's attendance
    for (const [studentId, status] of Object.entries(attendanceData)) {
      // Check if attendance record already exists for this student on this date
      const existingAttendance = await db.attendance.findFirst({
        where: {
          studentId,
          date: new Date(date),
        },
      })

      if (existingAttendance) {
        // Update existing record
        await db.attendance.update({
          where: {
            id: existingAttendance.id,
          },
          data: {
            status,
          },
        })
      } else {
        // Create new record
        await db.attendance.create({
          data: {
            date: new Date(date),
            studentId,
            status,
          },
        })
      }
    }

    // Revalidate the attendance page
    revalidatePath("/dashboard/teacher/attendance")
    revalidatePath("/dashboard/admin/attendance")
    revalidatePath("/dashboard/parent/attendance")

    return {
      success: true,
      message: "Attendance marked successfully for all students",
    }
  } catch (error) {
    console.error("Error marking bulk attendance:", error)
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

export async function getAttendanceStatistics(
  classId?: string,
  grade?: string,
  section?: string,
  startDate?: string,
  endDate?: string,
) {
  // Check authentication
  const session = await getServerSession(authOptions)

  if (!session) {
    return {
      success: false,
      errors: {
        _form: ["You must be logged in to view attendance statistics"],
      },
    }
  }

  try {
    // Build student filter
    const studentFilter: any = {}

    if (classId) {
      studentFilter.classId = classId
    }

    if (grade) {
      studentFilter.grade = grade
    }

    if (section) {
      studentFilter.section = section
    }

    // Get students based on filter
    const students = await db.student.findMany({
      where: studentFilter,
      select: {
        id: true,
      },
    })

    const studentIds = students.map((student) => student.id)

    // Build attendance filter
    const attendanceFilter: any = {
      studentId: {
        in: studentIds,
      },
    }

    if (startDate || endDate) {
      attendanceFilter.date = {}

      if (startDate) {
        attendanceFilter.date.gte = new Date(startDate)
      }

      if (endDate) {
        attendanceFilter.date.lte = new Date(endDate)
      }
    }

    // Get attendance statistics
    const stats = await db.attendance.groupBy({
      by: ["status"],
      where: attendanceFilter,
      _count: {
        status: true,
      },
    })

    // Calculate total attendance records
    const totalAttendance = stats.reduce((sum, stat) => sum + stat._count.status, 0)

    // Calculate attendance rate
    const presentCount = stats.find((s) => s.status === "Present")?._count.status || 0
    const attendanceRate = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0

    return {
      success: true,
      data: {
        total: totalAttendance,
        present: presentCount,
        absent: stats.find((s) => s.status === "Absent")?._count.status || 0,
        late: stats.find((s) => s.status === "Late")?._count.status || 0,
        attendanceRate: Math.round(attendanceRate * 100) / 100,
      },
    }
  } catch (error) {
    console.error("Error fetching attendance statistics:", error)
    return {
      success: false,
      errors: {
        _form: ["Something went wrong. Please try again."],
      },
    }
  }
}

export async function deleteAttendanceRecord(id: string) {
  // Check authentication
  const session = await getServerSession(authOptions)

  if (!session) {
    return {
      success: false,
      errors: {
        _form: ["You must be logged in to delete attendance records"],
      },
    }
  }

  // Only admins can delete attendance records
  if (session.user.role !== "ADMIN") {
    return {
      success: false,
      errors: {
        _form: ["You do not have permission to delete attendance records"],
      },
    }
  }

  try {
    // Delete the attendance record
    await db.attendance.delete({
      where: {
        id,
      },
    })

    // Revalidate the attendance page
    revalidatePath("/dashboard/admin/attendance")

    return {
      success: true,
      message: "Attendance record deleted successfully",
    }
  } catch (error) {
    console.error("Error deleting attendance record:", error)
    return {
      success: false,
      errors: {
        _form: ["Something went wrong. Please try again."],
      },
    }
  }
}

