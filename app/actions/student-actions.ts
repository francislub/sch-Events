"use server"

import { hash } from "bcrypt"
import { db } from "@/lib/db"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

// Define validation schema
const studentSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  admissionNumber: z.string().min(1, { message: "Admission number is required" }),
  dateOfBirth: z.string().min(1, { message: "Date of birth is required" }),
  gender: z.string().min(1, { message: "Gender is required" }),
  enrollmentDate: z.string().min(1, { message: "Enrollment date is required" }),
  grade: z.string().min(1, { message: "Grade is required" }),
  section: z.string().min(1, { message: "Section is required" }),
  address: z.string().optional(),
  parentId: z.string().min(1, { message: "Parent is required" }),
  classId: z.string().min(1, { message: "Class is required" }),
  createAccount: z.boolean().optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
})

export async function registerStudent(formData: FormData) {
  // Check authentication
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return {
      success: false,
      errors: {
        _form: ["You are not authorized to perform this action"],
      },
    }
  }

  // Extract and validate form data
  const createAccount = formData.get("createAccount") === "true"

  const rawData = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    admissionNumber: formData.get("admissionNumber") as string,
    dateOfBirth: formData.get("dateOfBirth") as string,
    gender: formData.get("gender") as string,
    enrollmentDate: formData.get("enrollmentDate") as string,
    grade: formData.get("grade") as string,
    section: formData.get("section") as string,
    address: formData.get("address") as string,
    parentId: formData.get("parentId") as string,
    classId: formData.get("classId") as string,
    createAccount,
    email: createAccount ? (formData.get("email") as string) : undefined,
    password: createAccount ? (formData.get("password") as string) : undefined,
  }

  // Validate data
  const validationResult = studentSchema.safeParse(rawData)

  if (!validationResult.success) {
    return {
      success: false,
      errors: validationResult.error.flatten().fieldErrors,
    }
  }

  try {
    // Check if student with admission number already exists
    const existingStudent = await db.student.findUnique({
      where: {
        admissionNumber: rawData.admissionNumber,
      },
    })

    if (existingStudent) {
      return {
        success: false,
        errors: {
          admissionNumber: ["Student with this admission number already exists"],
        },
      }
    }

    // Create student with or without user account
    if (createAccount && rawData.email && rawData.password) {
      // Check if user with email already exists
      const existingUser = await db.user.findUnique({
        where: {
          email: rawData.email,
        },
      })

      if (existingUser) {
        return {
          success: false,
          errors: {
            email: ["User with this email already exists"],
          },
        }
      }

      // Hash password
      const hashedPassword = await hash(rawData.password, 10)

      // Create user
      const user = await db.user.create({
        data: {
          name: `${rawData.firstName} ${rawData.lastName}`,
          email: rawData.email,
          password: hashedPassword,
          role: "STUDENT",
        },
      })

      // Create student with user account
      await db.student.create({
        data: {
          userId: user.id,
          firstName: rawData.firstName,
          lastName: rawData.lastName,
          admissionNumber: rawData.admissionNumber,
          dateOfBirth: new Date(rawData.dateOfBirth),
          gender: rawData.gender,
          enrollmentDate: new Date(rawData.enrollmentDate),
          grade: rawData.grade,
          section: rawData.section,
          address: rawData.address,
          parentId: rawData.parentId,
          classId: rawData.classId,
        },
      })
    } else {
      // Create student without user account
      await db.student.create({
        data: {
          firstName: rawData.firstName,
          lastName: rawData.lastName,
          admissionNumber: rawData.admissionNumber,
          dateOfBirth: new Date(rawData.dateOfBirth),
          gender: rawData.gender,
          enrollmentDate: new Date(rawData.enrollmentDate),
          grade: rawData.grade,
          section: rawData.section,
          address: rawData.address,
          parentId: rawData.parentId,
          classId: rawData.classId,
        },
      })
    }

    revalidatePath("/dashboard/admin/students")

    return {
      success: true,
      message: "Student registered successfully",
    }
  } catch (error) {
    console.error("Registration error:", error)
    return {
      success: false,
      errors: {
        _form: ["Something went wrong. Please try again."],
      },
    }
  }
}

export async function getStudents(filters?: {
  grade?: string
  section?: string
  classId?: string
  parentId?: string
}) {
  try {
    const filter: any = {}

    if (filters?.grade) {
      filter.grade = filters.grade
    }

    if (filters?.section) {
      filter.section = filters.section
    }

    if (filters?.classId) {
      filter.classId = filters.classId
    }

    if (filters?.parentId) {
      filter.parentId = filters.parentId
    }

    const students = await db.student.findMany({
      where: filter,
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        parent: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        class: true,
      },
    })

    return students
  } catch (error) {
    console.error("Error fetching students:", error)
    return []
  }
}

