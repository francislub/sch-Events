import { NextResponse } from "next/server"
import { hash } from "bcrypt"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json()

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
        role: role.toUpperCase(),
      },
    })

    // Create role-specific profile
    if (role.toUpperCase() === "TEACHER") {
      await db.teacher.create({
        data: {
          userId: user.id,
          department: "",
          qualification: "",
        },
      })
    } else if (role.toUpperCase() === "PARENT") {
      await db.parent.create({
        data: {
          userId: user.id,
        },
      })
    } else if (role.toUpperCase() === "ADMIN") {
      await db.admin.create({
        data: {
          userId: user.id,
          position: "Administrator",
        },
      })
    }

    return NextResponse.json({ message: "User created successfully" }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

