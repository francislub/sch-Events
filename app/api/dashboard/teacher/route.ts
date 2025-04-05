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

    // Only teachers can access this endpoint
    if (session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Find teacher profile
    const teacher = await db.teacher.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    if (!teacher) {
      return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 })
    }

    // Get classes taught by this teacher
    const classes = await db.class.findMany({
      where: {
        teacherId: teacher.id,
      },
      include: {
        students: true,
      },
    })

    // Get total students
    const totalStudents = classes.reduce((acc, cls) => acc + cls.students.length, 0)

    // Get pending assignments to grade
    const pendingAssignments = await db.assignment.count({
      where: {
        teacherId: teacher.id,
        submissions: {
          some: {
            gradedAt: null,
          },
        },
      },
    })

    // Get today's schedule
    const today = new Date()
    const dayOfWeek = today.getDay()
    const schedules = await db.schedule.findMany({
      where: {
        classId: {
          in: classes.map((cls) => cls.id),
        },
        dayOfWeek: dayOfWeek.toString(),
      },
      include: {
        class: true,
      },
      orderBy: {
        startTime: "asc",
      },
    })

    // Format today's schedule
    const todaySchedule = schedules.map((schedule) => ({
      time: `${schedule.startTime} - ${schedule.endTime}`,
      class: schedule.class.name,
      room: schedule.room,
    }))

    // Get recent activities (grades, attendance, etc.)
    const recentGrades = await db.grade.findMany({
      where: {
        teacherId: teacher.id,
      },
      include: {
        student: true,
        subject: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
    })

    const recentAttendance = await db.attendance.findMany({
      where: {
        markedById: session.user.id,
      },
      include: {
        student: true,
        class: true,
      },
      orderBy: {
        date: "desc",
      },
      take: 5,
    })

    // Format recent activities
    const recentActivities = [
      ...recentGrades.map((grade) => ({
        action: "Grades Updated",
        details: `${grade.subject.name} - ${grade.student.firstName} ${grade.student.lastName}`,
        time: new Date(grade.createdAt).toLocaleString(),
      })),
      ...recentAttendance.map((attendance) => ({
        action: "Attendance Marked",
        details: `${attendance.student.firstName} ${attendance.student.lastName} - ${attendance.status}`,
        time: new Date(attendance.date).toLocaleString(),
      })),
    ]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 5)

    // Format classes
    const formattedClasses = classes.map((cls) => {
      // Get schedule for this class
      const classSchedules = schedules.filter((s) => s.classId === cls.id)
      const scheduleText = classSchedules
        .map((s) => `${getDayName(Number.parseInt(s.dayOfWeek))} - ${s.startTime}`)
        .join(", ")

      return {
        id: cls.id,
        name: cls.name,
        schedule: scheduleText || "No schedule set",
        room: classSchedules[0]?.room || "Not assigned",
        students: cls.students.length,
      }
    })

    // Get announcements
    const announcements = await db.announcement.findMany({
      where: {
        OR: [{ targetRole: "ALL" }, { targetRole: "TEACHER" }],
        expiresAt: {
          gte: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 1,
    })

    // Format attendance records for display
    const formattedAttendance = recentAttendance.map((record) => ({
      id: record.id,
      studentName: `${record.student.firstName} ${record.student.lastName}`,
      status: record.status,
      date: new Date(record.date).toLocaleDateString(),
      class: record.class.name,
    }))

    return NextResponse.json({
      totalClasses: classes.length,
      totalStudents,
      pendingGrades: pendingAssignments,
      upcomingClasses: todaySchedule.length,
      todaySchedule,
      recentActivities,
      classes: formattedClasses,
      announcements,
      recentAttendance: formattedAttendance,
    })
  } catch (error) {
    console.error("Error fetching teacher dashboard data:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

// Helper function to get day name
function getDayName(dayNumber: number): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  return days[dayNumber] || "Unknown"
}

