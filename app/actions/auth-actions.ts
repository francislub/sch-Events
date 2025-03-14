"use server"

import { hash } from "bcrypt"
import { db } from "@/lib/db"
import { z } from "zod"

// Define validation schema
const registerSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string(),
    role: z.enum(["ADMIN", "TEACHER", "PARENT"], {
      message: "Role must be one of: ADMIN, TEACHER, PARENT",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export async function registerUser(formData: FormData) {
  // Extract and validate form data
  const rawData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
    role: (formData.get("role") as string).toUpperCase(),
  }

  // Validate data
  const validationResult = registerSchema.safeParse(rawData)

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
        role: rawData.role as any,
      },
    })

    // Create role-specific profile
    if (rawData.role === "TEACHER") {
      await db.teacher.create({
        data: {
          userId: user.id,
          department: "",
          qualification: "",
        },
      })
    } else if (rawData.role === "PARENT") {
      await db.parent.create({
        data: {
          userId: user.id,
        },
      })
    } else if (rawData.role === "ADMIN") {
      await db.admin.create({
        data: {
          userId: user.id,
          position: "Administrator",
        },
      })
    }

    return {
      success: true,
      message: "User registered successfully",
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

