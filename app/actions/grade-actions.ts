"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

// Schema for grade validation
const gradeSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  term: z.string().min(1, "Term is required"),
  score: z.string().refine((val) => {
    const num = Number.parseFloat(val)
    return !isNaN(num) && num >= 0 && num <= 100
  }, "Score must be a number between 0 and 100"),
  grade: z.string().min(1, "Grade is required"),
  remarks: z.string().optional(),
  studentId: z.string().min(1, "Student is required"),
})

export async function addGrade(formData: FormData) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, errors: { _form: ["Not authenticated"] } }
    }

    // Only teachers can add grades
    if (session.user.role !== "TEACHER") {
      return { success: false, errors: { _form: ["Not authorized"] } }
    }

    // Validate form data
    const validatedFields = gradeSchema.safeParse({
      subject: formData.get("subject"),
      term: formData.get("term"),
      score: formData.get("score"),
      grade: formData.get("grade"),
      remarks: formData.get("remarks"),
      studentId: formData.get("studentId"),
    })

    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const { subject, term, score, grade, remarks, studentId } = validatedFields.data

    // Find teacher profile
    const teacher = await db.teacher.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    if (!teacher) {
      return { success: false, errors: { _form: ["Teacher profile not found"] } }
    }

    // Verify student exists and belongs to a class taught by this teacher
    const student = await db.student.findFirst({
      where: {
        id: studentId,
        class: {
          teacherId: teacher.id,
        },
      },
    })

    if (!student) {
      return { success: false, errors: { _form: ["Student not found or not in your class"] } }
    }

    // Create grade
    await db.grade.create({
      data: {
        subject,
        term,
        score: Number.parseFloat(score),
        grade,
        remarks: remarks || "",
        studentId,
      },
    })

    // Revalidate paths
    revalidatePath("/dashboard/teacher/grades")
    revalidatePath(`/dashboard/teacher/students/${studentId}`)
    revalidatePath(`/dashboard/student/academics`)

    return { success: true }
  } catch (error) {
    console.error("Error adding grade:", error)
    return { success: false, errors: { _form: ["Failed to add grade"] } }
  }
}

export async function getGradesByStudent(studentId: string) {
  try {
    const grades = await db.grade.findMany({
      where: {
        studentId,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return { success: true, data: grades }
  } catch (error) {
    console.error("Error fetching grades:", error)
    return { success: false, error: "Failed to fetch grades" }
  }
}

export async function getGradeById(gradeId: string) {
  try {
    const grade = await db.grade.findUnique({
      where: {
        id: gradeId,
      },
      include: {
        student: true,
      },
    })

    if (!grade) {
      return { success: false, error: "Grade not found" }
    }

    return { success: true, data: grade }
  } catch (error) {
    console.error("Error fetching grade:", error)
    return { success: false, error: "Failed to fetch grade" }
  }
}

export async function updateGrade(gradeId: string, formData: FormData) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, errors: { _form: ["Not authenticated"] } }
    }

    // Only teachers can update grades
    if (session.user.role !== "TEACHER") {
      return { success: false, errors: { _form: ["Not authorized"] } }
    }

    // Validate form data
    const validatedFields = gradeSchema.safeParse({
      subject: formData.get("subject"),
      term: formData.get("term"),
      score: formData.get("score"),
      grade: formData.get("grade"),
      remarks: formData.get("remarks"),
      studentId: formData.get("studentId"),
    })

    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const { subject, term, score, grade, remarks, studentId } = validatedFields.data

    // Find teacher profile
    const teacher = await db.teacher.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    if (!teacher) {
      return { success: false, errors: { _form: ["Teacher profile not found"] } }
    }

    // Verify student exists and belongs to a class taught by this teacher
    const student = await db.student.findFirst({
      where: {
        id: studentId,
        class: {
          teacherId: teacher.id,
        },
      },
    })

    if (!student) {
      return { success: false, errors: { _form: ["Student not found or not in your class"] } }
    }

    // Verify grade exists and belongs to this student
    const existingGrade = await db.grade.findFirst({
      where: {
        id: gradeId,
        studentId,
      },
    })

    if (!existingGrade) {
      return { success: false, errors: { _form: ["Grade not found or not for this student"] } }
    }

    // Update grade
    await db.grade.update({
      where: {
        id: gradeId,
      },
      data: {
        subject,
        term,
        score: Number.parseFloat(score),
        grade,
        remarks: remarks || "",
      },
    })

    // Revalidate paths
    revalidatePath("/dashboard/teacher/grades")
    revalidatePath(`/dashboard/teacher/grades/${gradeId}`)
    revalidatePath(`/dashboard/teacher/students/${studentId}`)
    revalidatePath(`/dashboard/student/academics`)

    return { success: true }
  } catch (error) {
    console.error("Error updating grade:", error)
    return { success: false, errors: { _form: ["Failed to update grade"] } }
  }
}

export async function deleteGrade(gradeId: string) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, error: "Not authenticated" }
    }

    // Only teachers can delete grades
    if (session.user.role !== "TEACHER") {
      return { success: false, error: "Not authorized" }
    }

    // Find teacher profile
    const teacher = await db.teacher.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    if (!teacher) {
      return { success: false, error: "Teacher profile not found" }
    }

    // Verify grade exists and belongs to a student in a class taught by this teacher
    const grade = await db.grade.findFirst({
      where: {
        id: gradeId,
        student: {
          class: {
            teacherId: teacher.id,
          },
        },
      },
      include: {
        student: true,
      },
    })

    if (!grade) {
      return { success: false, error: "Grade not found or not for a student in your class" }
    }

    // Delete grade
    await db.grade.delete({
      where: {
        id: gradeId,
      },
    })

    // Revalidate paths
    revalidatePath("/dashboard/teacher/grades")
    revalidatePath(`/dashboard/teacher/students/${grade.student.id}`)
    revalidatePath(`/dashboard/student/academics`)

    return { success: true }
  } catch (error) {
    console.error("Error deleting grade:", error)
    return { success: false, error: "Failed to delete grade" }
  }
}

