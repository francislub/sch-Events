"use server"

import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Define validation schema
const gradeSchema = z.object({
  subject: z.string().min(1, { message: "Subject is required" }),
  term: z.string().min(1, { message: "Term is required" }),
  score: z.number().min(0).max(100, { message: "Score must be between 0 and 100" }),
  grade: z.string().min(1, { message: "Grade is required" }),
  remarks: z.string().optional(),
  studentId: z.string().min(1, { message: "Student ID is required" }),
})

export async function addGrade(formData: FormData) {
  // Check authentication
  const session = await getServerSession(authOptions)

  if (!session) {
    return {
      success: false,
      errors: {
        _form: ["You must be logged in to add grades"],
      },
    }
  }

  // Only teachers and admins can add grades
  if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN") {
    return {
      success: false,
      errors: {
        _form: ["You do not have permission to add grades"],
      },
    }
  }

  // Extract and validate form data
  const rawData = {
    subject: formData.get("subject") as string,
    term: formData.get("term") as string,
    score: Number.parseFloat(formData.get("score") as string),
    grade: formData.get("grade") as string,
    remarks: formData.get("remarks") as string,
    studentId: formData.get("studentId") as string,
  }

  // Validate data
  const validationResult = gradeSchema.safeParse(rawData)

  if (!validationResult.success) {
    return {
      success: false,
      errors: validationResult.error.flatten().fieldErrors,
    }
  }

  try {
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
                  id: rawData.studentId,
                },
              },
            },
          },
        },
      })

      if (!teacher) {
        return {
          success: false,
          errors: {
            _form: ["Teacher profile not found"],
          },
        }
      }

      // Check if student is in one of the teacher's classes
      const hasStudent = teacher.classes.some((cls) => cls.students.some((student) => student.id === rawData.studentId))

      if (!hasStudent) {
        return {
          success: false,
          errors: {
            _form: ["You are not authorized to grade this student"],
          },
        }
      }
    }

    // Create grade
    await db.grade.create({
      data: {
        subject: rawData.subject,
        term: rawData.term,
        score: rawData.score,
        grade: rawData.grade,
        remarks: rawData.remarks,
        studentId: rawData.studentId,
      },
    })

    // Revalidate paths
    revalidatePath("/dashboard/teacher/grades")
    revalidatePath("/dashboard/admin/grades")
    revalidatePath("/dashboard/parent/academics")

    return {
      success: true,
      message: "Grade added successfully",
    }
  } catch (error) {
    console.error("Error adding grade:", error)
    return {
      success: false,
      errors: {
        _form: ["Something went wrong. Please try again."],
      },
    }
  }
}

export async function getStudentGrades(studentId: string, term?: string) {
  // Check authentication
  const session = await getServerSession(authOptions)

  if (!session) {
    return {
      success: false,
      errors: {
        _form: ["You must be logged in to view grades"],
      },
    }
  }

  try {
    // Build filter
    const filter: any = {
      studentId,
    }

    if (term) {
      filter.term = term
    }

    // If parent, verify the student is their child
    if (session.user.role === "PARENT") {
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
        return {
          success: false,
          errors: {
            _form: ["Parent profile not found"],
          },
        }
      }

      const childrenIds = parent.children.map((child) => child.id)

      if (!childrenIds.includes(studentId)) {
        return {
          success: false,
          errors: {
            _form: ["You are not authorized to view this student's grades"],
          },
        }
      }
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
        return {
          success: false,
          errors: {
            _form: ["Teacher profile not found"],
          },
        }
      }

      // Check if student is in one of the teacher's classes
      const hasStudent = teacher.classes.some((cls) => cls.students.some((student) => student.id === studentId))

      if (!hasStudent) {
        return {
          success: false,
          errors: {
            _form: ["You are not authorized to view this student's grades"],
          },
        }
      }
    }

    // Get grades
    const grades = await db.grade.findMany({
      where: filter,
      orderBy: {
        subject: "asc",
      },
    })

    // Get student info
    const student = await db.student.findUnique({
      where: {
        id: studentId,
      },
      include: {
        class: true,
      },
    })

    return {
      success: true,
      data: {
        grades,
        student,
      },
    }
  } catch (error) {
    console.error("Error fetching grades:", error)
    return {
      success: false,
      errors: {
        _form: ["Something went wrong. Please try again."],
      },
    }
  }
}

