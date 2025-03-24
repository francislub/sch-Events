"use server"

import { hash } from "bcrypt"
import { db } from "@/lib/db"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

// Define validation schema
const teacherSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  department: z.string().min(1, { message: "Department is required" }),
  qualification: z.string().min(1, { message: "Qualification is required" }),
  contactNumber: z.string().optional(),
  address: z.string().optional(),
})

export async function registerTeacher(formData: FormData) {
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
  const rawData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    department: formData.get("department") as string,
    qualification: formData.get("qualification") as string,
    contactNumber: formData.get("contactNumber") as string,
    address: formData.get("address") as string,
  }

  // Validate data
  const validationResult = teacherSchema.safeParse(rawData)

  if (!validationResult.success) {
    return {
      success: false,
      errors: validationResult.error.flatten().fieldErrors,
    }
  }

  try {
    // Check if user already exists
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
        name: rawData.name,
        email: rawData.email,
        password: hashedPassword,
        role: "TEACHER",
      },
    })

    // Create teacher profile
    await db.teacher.create({
      data: {
        userId: user.id,
        department: rawData.department,
        qualification: rawData.qualification,
        contactNumber: rawData.contactNumber,
        address: rawData.address,
      },
    })

    revalidatePath("/dashboard/admin/teachers")

    return {
      success: true,
      message: "Teacher registered successfully",
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

export async function getTeachers(department?: string) {
  try {
    const filter: any = {}

    if (department) {
      filter.department = department
    }

    const teachers = await db.teacher.findMany({
      where: filter,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        classes: {
          select: {
            id: true,
            name: true,
            grade: true,
            section: true,
          },
        },
      },
    })

    return teachers
  } catch (error) {
    console.error("Error fetching teachers:", error)
    return []
  }
}

