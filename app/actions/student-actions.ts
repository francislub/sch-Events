"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { hash } from "bcrypt"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function registerStudent(formData: FormData) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session) {
      return {
        error: "You must be logged in to register a student",
      }
    }

    // Only admin can register students
    if (session.user.role !== "ADMIN") {
      return {
        error: "You do not have permission to register students",
      }
    }

    const fullName = formData.get("fullName") as string
    const dateOfBirth = formData.get("dateOfBirth") as string
    const gender = formData.get("gender") as string
    const admissionNumber = formData.get("admissionNumber") as string
    const classId = formData.get("classId") as string
    const stream = formData.get("stream") as string
    const parentId = formData.get("parentId") as string
    const address = formData.get("address") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (
      !fullName ||
      !dateOfBirth ||
      !gender ||
      !admissionNumber ||
      !classId ||
      !parentId ||
      !address ||
      !email ||
      !password
    ) {
      return {
        error: "All fields are required",
      }
    }

    // Check if student with admission number already exists
    const existingStudent = await db.student.findUnique({
      where: {
        admissionNumber,
      },
    })

    if (existingStudent) {
      return {
        error: "Student with this admission number already exists",
      }
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: {
        email,
      },
    })

    if (existingUser) {
      return {
        error: "User with this email already exists",
      }
    }

    // Split full name into first and last name
    const nameParts = fullName.trim().split(" ")
    const firstName = nameParts[0]
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : ""

    // Hash the password
    const hashedPassword = await hash(password, 10)

    // First create the user
    const user = await db.user.create({
      data: {
        name: fullName,
        email,
        password: hashedPassword,
        role: "STUDENT",
      },
    })

    // Then create the student profile
    const student = await db.student.create({
      data: {
        userId: user.id,
        firstName,
        lastName,
        admissionNumber,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        enrollmentDate: new Date(),
        grade: "Unknown", // Add required fields
        section: stream || "A",
        address,
        classId,
        parentId,
      },
    })

    revalidatePath("/dashboard/admin/students")

    return {
      success: true,
      message: "Student registered successfully",
      student: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("Error registering student:", errorMessage)
    return {
      error: "Failed to register student: " + errorMessage,
    }
  }
}

export async function getStudents(query = "", classId = "", parentId = "") {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session) {
      throw new Error("You must be logged in to view students")
    }

    const whereClause: any = {
      role: "STUDENT",
    }

    if (query) {
      whereClause.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
        { studentProfile: { admissionNumber: { contains: query, mode: "insensitive" } } },
      ]
    }

    if (classId && classId !== "all") {
      whereClause.studentProfile = {
        ...whereClause.studentProfile,
        classId,
      }
    }

    if (parentId && parentId !== "all") {
      whereClause.studentProfile = {
        ...whereClause.studentProfile,
        parentId,
      }
    }

    // If parent, only show their children
    if (session.user.role === "PARENT") {
      const parent = await db.parent.findUnique({
        where: {
          userId: session.user.id,
        },
      })

      if (!parent) {
        throw new Error("Parent profile not found")
      }

      whereClause.studentProfile = {
        ...whereClause.studentProfile,
        parentId: parent.id,
      }
    }

    const students = await db.user.findMany({
      where: whereClause,
      include: {
        studentProfile: {
          include: {
            class: true,
            parent: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    return students
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("Error fetching students:", errorMessage)
    throw new Error("Failed to fetch students")
  }
}

export async function getStudentById(id: string) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session) {
      throw new Error("You must be logged in to view student details")
    }

    const student = await db.user.findUnique({
      where: {
        id,
        role: "STUDENT",
      },
      include: {
        studentProfile: {
          include: {
            class: {
              include: {
                teacher: {
                  include: {
                    user: true,
                  },
                },
              },
            },
            parent: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    })

    return student
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("Error fetching student:", errorMessage)
    throw new Error("Failed to fetch student")
  }
}

export async function updateStudent(id: string, formData: FormData) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session) {
      return {
        success: false,
        error: "You must be logged in to update a student",
      }
    }

    // Only admin can update students
    if (session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "You do not have permission to update students",
      }
    }

    const fullName = formData.get("fullName") as string
    const dateOfBirth = formData.get("dateOfBirth") as string
    const gender = formData.get("gender") as string
    const admissionNumber = formData.get("admissionNumber") as string
    const classId = formData.get("classId") as string
    const stream = formData.get("stream") as string
    const parentId = formData.get("parentId") as string
    const address = formData.get("address") as string
    const email = formData.get("email") as string
    const updatePassword = formData.get("updatePassword") === "true"
    const password = formData.get("password") as string

    if (!fullName || !dateOfBirth || !gender || !admissionNumber || !classId || !parentId || !address || !email) {
      return {
        success: false,
        error: "All fields are required",
      }
    }

    // Check if student exists
    const existingUser = await db.user.findUnique({
      where: {
        id,
        role: "STUDENT",
      },
      include: {
        studentProfile: true,
      },
    })

    if (!existingUser || !existingUser.studentProfile) {
      return {
        success: false,
        error: "Student not found",
      }
    }

    // Check if admission number is already used by another student
    const existingAdmissionNumber = await db.student.findFirst({
      where: {
        admissionNumber,
        NOT: {
          id: existingUser.studentProfile.id,
        },
      },
    })

    if (existingAdmissionNumber) {
      return {
        success: false,
        error: "Admission number is already in use by another student",
      }
    }

    // Check if email is already used by another user
    const existingEmail = await db.user.findFirst({
      where: {
        email,
        NOT: {
          id,
        },
      },
    })

    if (existingEmail) {
      return {
        success: false,
        error: "Email is already in use by another user",
      }
    }

    // Split full name into first and last name
    const nameParts = fullName.trim().split(" ")
    const firstName = nameParts[0]
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : ""

    // Update user data
    const updateData: any = {
      name: fullName,
      email,
    }

    // Update password if requested
    if (updatePassword && password) {
      updateData.password = await hash(password, 10)
    }

    // Update user
    await db.user.update({
      where: {
        id,
      },
      data: updateData,
    })

    // Update student profile
    await db.student.update({
      where: {
        id: existingUser.studentProfile.id,
      },
      data: {
        firstName,
        lastName,
        admissionNumber,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        section: stream,
        address,
        classId,
        parentId,
      },
    })

    revalidatePath("/dashboard/admin/students")
    revalidatePath(`/dashboard/admin/students/${id}`)

    return {
      success: true,
      message: "Student updated successfully",
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("Error updating student:", errorMessage)
    return {
      success: false,
      error: "Failed to update student: " + errorMessage,
    }
  }
}

export async function deleteStudent(id: string) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session) {
      return {
        success: false,
        error: "You must be logged in to delete a student",
      }
    }

    // Only admin can delete students
    if (session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "You do not have permission to delete students",
      }
    }

    // Check if student exists
    const student = await db.user.findUnique({
      where: {
        id,
        role: "STUDENT",
      },
      include: {
        studentProfile: true,
      },
    })

    if (!student || !student.studentProfile) {
      return {
        success: false,
        error: "Student not found",
      }
    }

    // Delete student profile
    await db.student.delete({
      where: {
        id: student.studentProfile.id,
      },
    })

    // Delete user
    await db.user.delete({
      where: {
        id,
      },
    })

    revalidatePath("/dashboard/admin/students")

    return {
      success: true,
      message: "Student deleted successfully",
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("Error deleting student:", errorMessage)
    return {
      success: false,
      error: "Failed to delete student. Make sure to remove any related records first.",
    }
  }
}

