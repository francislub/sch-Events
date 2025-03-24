// app/api/assignments/route.ts
import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const assignments = await prisma.assignment.findMany()
    return NextResponse.json(assignments, { status: 200 })
  } catch (error) {
    console.error("Error fetching assignments:", error)
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json()

    const assignment = await prisma.assignment.create({
      data: json,
    })

    return new NextResponse(JSON.stringify(assignment), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error creating assignment:", error)
    return NextResponse.json({ error: "Failed to create assignment" }, { status: 500 })
  }
}

