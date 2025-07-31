import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  console.log("🚀 Broadcast message API called")

  try {
    const session = await getServerSession(authOptions)
    console.log("📝 Session:", session?.user?.email, "Role:", session?.user?.role)

    if (!session) {
      console.log("❌ No session found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "ADMIN") {
      console.log("❌ User is not admin:", session.user.role)
      return NextResponse.json({ error: "Only admins can broadcast messages" }, { status: 403 })
    }

    const body = await req.json()
    const { content, targetRole } = body
    console.log("📨 Broadcast request:", { content: content?.substring(0, 50) + "...", targetRole })

    if (!content || !targetRole) {
      console.log("❌ Missing required fields")
      return NextResponse.json({ error: "Content and target role are required" }, { status: 400 })
    }

    if (!["TEACHER", "STUDENT", "PARENT"].includes(targetRole)) {
      console.log("❌ Invalid target role:", targetRole)
      return NextResponse.json({ error: "Invalid target role" }, { status: 400 })
    }

    // Get all users with the target role
    console.log("🔍 Fetching users with role:", targetRole)
    const targetUsers = await db.user.findMany({
      where: {
        role: targetRole,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    console.log("👥 Found", targetUsers.length, "users with role", targetRole)

    if (targetUsers.length === 0) {
      console.log("⚠️ No users found with target role")
      return NextResponse.json({ error: `No ${targetRole.toLowerCase()}s found` }, { status: 404 })
    }

    // Create messages for all target users
    console.log("💬 Creating messages for all target users...")
    const messages = await Promise.all(
      targetUsers.map(async (user) => {
        try {
          const message = await db.message.create({
            data: {
              content,
              senderId: session.user.id,
              recipientId: user.id,
            },
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              recipient: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          })
          console.log("✅ Message created for:", user.name)
          return message
        } catch (error) {
          console.error("❌ Failed to create message for user:", user.name, error)
          return null
        }
      }),
    )

    const successfulMessages = messages.filter(Boolean)
    console.log("📊 Successfully sent", successfulMessages.length, "out of", targetUsers.length, "messages")

    return NextResponse.json({
      success: true,
      messagesSent: successfulMessages.length,
      totalTargets: targetUsers.length,
      targetRole,
    })
  } catch (error) {
    console.error("💥 Broadcast message error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
