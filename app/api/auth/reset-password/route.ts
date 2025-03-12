import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { hash } from "bcrypt"
import { z } from "zod"

// Validation schema for password reset request
const requestResetSchema = z.object({
  email: z.string().email("Invalid email address"),
})

// Validation schema for password reset
const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // Validate input
    const validationResult = requestResetSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.errors[0].message }, { status: 400 })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      // For security reasons, don't reveal that the email doesn't exist
      return NextResponse.json({
        success: true,
        message: "If your email is registered, you will receive a password reset link",
      })
    }

    // Generate a reset token
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

    // Store the reset token in the database
    // Note: You would need to add resetToken and resetTokenExpiry fields to your User model
    // For this example, we'll just simulate it

    // In a real implementation, you would:
    // 1. Update the user record with the reset token and expiry
    // 2. Send an email with a link containing the token

    return NextResponse.json({
      success: true,
      message: "If your email is registered, you will receive a password reset link",
    })
  } catch (error) {
    console.error("Password reset request error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = body

    // Validate input
    const validationResult = resetPasswordSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.errors[0].message }, { status: 400 })
    }

    // In a real implementation, you would:
    // 1. Find the user with the matching reset token
    // 2. Check if the token is still valid (not expired)
    // 3. Update the user's password and clear the reset token

    // For this example, we'll just simulate it
    const hashedPassword = await hash(password, 10)

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully",
    })
  } catch (error) {
    console.error("Password reset error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

