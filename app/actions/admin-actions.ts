"use server"

import { hash } from "bcrypt"
import { db } from "@/lib/db"
import { z } from "zod"

// Define validation schema for admin registration
const adminSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  position: z.string().min(2, { message: "Position must be at least 2 characters" }),
  contactNumber: z.string().optional(),
})

export async function registerAdmin(data: any) {
  try {
    // Validate data
    const validatedData = adminSchema.parse(data)

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: {
        email: validatedData.email,
      },
    })

    if (existingUser) {
      return {
        success: false,
        message: "User with this email already exists",
      }
    }

    // Hash password
    const hashedPassword = await hash(validatedData.password, 10)

    // Create user with ADMIN role
    const user = await db.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: "ADMIN",
      },
    })

    // Create admin profile
    await db.admin.create({
      data: {
        userId: user.id,
        position: validatedData.position,
        contactNumber: validatedData.contactNumber || null,
      },
    })

    return {
      success: true,
      message: "Admin registered successfully",
    }
  } catch (error) {
    console.error("Admin registration error:", error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validation error",
        errors: error.errors,
      }
    }

    return {
      success: false,
      message: "Failed to register admin. Please try again.",
    }
  }
}

export async function getAdminStats() {
  try {
    // Get counts from database
    const studentsCount = await db.student.count()
    const teachersCount = await db.teacher.count()
    const classesCount = await db.class.count()
    const parentsCount = await db.parent.count()

    // Calculate attendance rate
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    const totalAttendanceRecords = await db.attendance.count({
      where: {
        date: {
          gte: startOfMonth,
        },
      },
    })

    const presentAttendanceRecords = await db.attendance.count({
      where: {
        date: {
          gte: startOfMonth,
        },
        status: "Present",
      },
    })

    const attendanceRate =
      totalAttendanceRecords > 0 ? Math.round((presentAttendanceRecords / totalAttendanceRecords) * 100) : 0

    // Get recent activities
    const recentActivities = await getRecentActivities()

    return {
      success: true,
      data: {
        studentsCount,
        teachersCount,
        classesCount,
        parentsCount,
        attendanceRate,
        recentActivities,
      },
    }
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return {
      success: false,
      message: "Failed to fetch admin statistics",
    }
  }
}

async function getRecentActivities() {
  try {
    // Get recent students
    const recentStudents = await db.student.findMany({
      take: 3,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        class: true,
      },
    })

    // Get recent teachers
    const recentTeachers = await db.teacher.findMany({
      take: 2,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: true,
      },
    })

    // Get recent attendance records
    const recentAttendance = await db.attendance.findMany({
      take: 2,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        student: true,
      },
    })

    // Format activities
    const activities = [
      ...recentStudents.map((student) => ({
        action: "New Student Registered",
        details: `${student.firstName} ${student.lastName} - Grade ${student.grade}${student.section}`,
        time: formatTime(student.createdAt),
      })),
      ...recentTeachers.map((teacher) => ({
        action: "Teacher Added",
        details: `${teacher.user.name} - ${teacher.department}`,
        time: formatTime(teacher.createdAt),
      })),
      ...recentAttendance.map((attendance) => ({
        action: "Attendance Marked",
        details: `${attendance.student.firstName} ${attendance.student.lastName} - ${attendance.status}`,
        time: formatTime(attendance.createdAt),
      })),
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

    return activities.slice(0, 5)
  } catch (error) {
    console.error("Error fetching recent activities:", error)
    return []
  }
}

function formatTime(date: Date) {
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  // Less than 24 hours
  if (diff < 24 * 60 * 60 * 1000) {
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric", hour12: true })
  }

  // Less than 48 hours
  if (diff < 48 * 60 * 60 * 1000) {
    return "Yesterday"
  }

  // Format as date
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

