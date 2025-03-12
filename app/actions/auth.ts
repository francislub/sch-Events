"use server"

import { hash } from "bcrypt"
import { signIn } from "next-auth/react"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { z } from "zod"

// Validation schemas
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "TEACHER", "STUDENT", "PARENT"]),
  studentId: z.string().optional(),
  grade: z.string().optional(),
  department: z.string().optional(),
})

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    // Validate input
    loginSchema.parse({ email, password })

    // Attempt to sign in
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      return { success: false, error: "Invalid email or password" }
    }

    // Redirect to dashboard on success
    redirect("/dashboard")
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function register(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const role = formData.get("role") as "ADMIN" | "TEACHER" | "STUDENT" | "PARENT"
  const studentId = formData.get("studentId") as string | null
  const grade = formData.get("grade") as string | null
  const department = formData.get("department") as string | null

  try {
    // Validate input
    registerSchema.parse({
      name,
      email,
      password,
      role,
      studentId: studentId || undefined,
      grade: grade || undefined,
      department: department || undefined,
    })

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { success: false, error: "Email already in use" }
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create user
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        studentId: studentId || undefined,
        grade: grade || undefined,
        department: department || undefined,
      },
    })

    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function logout() {
  redirect("/api/auth/signout")
}

