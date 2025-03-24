import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { hash } from "bcrypt"

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admin can add parents
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { name, email, password, contactNumber, address, relationship } = await req.json()

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: {
        email,
      },
    })

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "PARENT",
      },
    })

    // Create parent profile
    const parent = await db.parent.create({
      data: {
        userId: user.id,
        contactNumber,
        address,
        relationship,
      },
    })

    return NextResponse.json({ message: "Parent added successfully", parent }, { status: 201 })
  } catch (error) {
    console.error("Error adding parent:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get parents
    const parents = await db.parent.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        children: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            admissionNumber: true,
          },
        },
      },
    })

    return NextResponse.json(parents)
  } catch (error) {
    console.error("Error fetching parents:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

