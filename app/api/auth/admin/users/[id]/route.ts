import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { hash } from "bcrypt"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "You don't have permission to access this resource" }, { status: 403 })
  }

  try {
    const userId = params.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studentId: true,
        grade: true,
        department: true,
        createdAt: true,
        updatedAt: true,
        events: {
          select: {
            id: true,
            title: true,
            date: true,
          },
          take: 5,
          orderBy: { date: "desc" },
        },
        registrations: {
          select: {
            id: true,
            status: true,
            event: {
              select: {
                id: true,
                title: true,
                date: true,
              },
            },
          },
          take: 5,
          orderBy: { createdAt: "desc" },
        },
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
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "You don't have permission to access this resource" }, { status: 403 })
  }

  try {
    const userId = params.id
    const body = await request.json()
    const { name, email, password, role, studentId, grade, department } = body

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {}

    if (name !== undefined) updateData.name = name

    if (email !== undefined && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      })

      if (emailExists) {
        return NextResponse.json({ error: "Email already in use" }, { status: 400 })
      }

      updateData.email = email.toLowerCase()
    }

    if (password) {
      updateData.password = await hash(password, 10)
    }

    if (role !== undefined) updateData.role = role
    if (studentId !== undefined) updateData.studentId = studentId
    if (grade !== undefined) updateData.grade = grade
    if (department !== undefined) updateData.department = department

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studentId: true,
        grade: true,
        department: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
    })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "You don't have permission to access this resource" }, { status: 403 })
  }

  try {
    const userId = params.id

    // Prevent deleting yourself
    if (userId === session.user.id) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Delete user
    await prisma.user.delete({
      where: { id: userId },
    })

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}

