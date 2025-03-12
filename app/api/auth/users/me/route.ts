import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { hash, compare } from "bcrypt"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be logged in to access your profile" }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studentId: true,
        grade: true,
        department: true,
        createdAt: true,
        _count: {
          select: {
            events: true,
            registrations: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be logged in to update your profile" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, email, currentPassword, newPassword, studentId, grade, department } = body

    // Get the current user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {}

    if (name) updateData.name = name

    // Email change requires verification in a real app
    // For this example, we'll just update it directly
    if (email && email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      })

      if (existingUser) {
        return NextResponse.json({ error: "Email already in use" }, { status: 400 })
      }

      updateData.email = email.toLowerCase()
    }

    // Password change
    if (currentPassword && newPassword) {
      const passwordMatch = await compare(currentPassword, user.password)
      if (!passwordMatch) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 })
      }

      updateData.password = await hash(newPassword, 10)
    }

    // Additional fields based on role
    if (user.role === "STUDENT" && studentId !== undefined) {
      updateData.studentId = studentId
    }

    if (user.role === "STUDENT" && grade !== undefined) {
      updateData.grade = grade
    }

    if (user.role === "TEACHER" && department !== undefined) {
      updateData.department = department
    }

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studentId: true,
        grade: true,
        department: true,
      },
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
    })
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json({ error: "Failed to update user profile" }, { status: 500 })
  }
}

