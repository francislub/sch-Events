import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { hash } from "bcrypt"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "You don't have permission to access this resource" }, { status: 403 })
  }

  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const role = searchParams.get("role")
    const search = searchParams.get("search")

    // Calculate pagination
    const skip = (page - 1) * limit

    // Build filter
    const filter: any = {}
    if (role) {
      filter.role = role
    }
    if (search) {
      filter.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }

    // Get users
    const users = await prisma.user.findMany({
      where: filter,
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
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    })

    // Get total count
    const totalUsers = await prisma.user.count({ where: filter })

    return NextResponse.json({
      users,
      pagination: {
        total: totalUsers,
        page,
        limit,
        pages: Math.ceil(totalUsers / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "You don't have permission to access this resource" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { name, email, password, role, studentId, grade, department } = body

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Name, email, password, and role are required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
        studentId,
        grade,
        department,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studentId: true,
        grade: true,
        department: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}

