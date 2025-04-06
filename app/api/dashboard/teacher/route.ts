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
        schedule: true,
      },
    })

    // Get total students
    const totalStudents = classes.reduce((acc, cls) => acc + cls.students.length, 0)

    // Get class IDs
    const classIds = classes.map((cls) => cls.id)

    // Get pending grades (simplified since there's no direct assignment model)
    const pendingGrades = 0

    // Get today's schedule
    const today = new Date()
    const dayOfWeek = today.getDay()
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const todayName = dayNames[dayOfWeek]

    // Filter schedules for today
    const todaySchedules = classes
      .flatMap((cls) =>
        cls.schedule
          .filter((schedule) => schedule.day === todayName)
          .map((schedule) => ({
            time: `${schedule.startTime} - ${schedule.endTime}`,
            class: cls.name,
            room: schedule.room,
            subject: schedule.subject,
          })),
      )
      .sort((a, b) => a.time.localeCompare(b.time))

    // Get recent grades
    const studentIds = classes.flatMap((cls) => cls.students.map((student) => student.id))

    const recentGrades = await db.grade.findMany({
      where: {
        studentId: {
          in: studentIds,
        },
      },
      include: {
        student: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
    })

    // Get recent attendance
    const recentAttendance = await db.attendance.findMany({
      where: {
        studentId: {
          in: studentIds,
        },
      },
      include: {
        student: true,
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
        details: `${grade.subject} - ${grade.student.firstName} ${grade.student.lastName}`,
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
      const classSchedules = cls.schedule
      const scheduleText = classSchedules.map((s) => `${s.day} - ${s.startTime}`).join(", ")

      return {
        id: cls.id,
        name: cls.name,
        grade: cls.grade,
        section: cls.section,
        schedule: scheduleText || "No schedule set",
        room: classSchedules[0]?.room || "Not assigned",
        students: cls.students.length,
      }
    })

    // Get notifications (using as announcements)
    const announcements = await db.notification.findMany({
      where: {
        forRole: "TEACHER",
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
      class: record.student.class?.name || "Unknown",
    }))

    return NextResponse.json({
      totalClasses: classes.length,
      totalStudents,
      pendingGrades,
      upcomingClasses: todaySchedules.length,
      todaySchedule: todaySchedules,
      recentActivities,
      classes: formattedClasses,
      announcements: announcements.map((a) => ({
        id: a.id,
        title: a.title,
        content: a.message,
        type: a.type,
        createdAt: a.createdAt,
      })),
      recentAttendance: formattedAttendance,
    })
  } catch (error) {
    console.error("Error fetching teacher dashboard data:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

