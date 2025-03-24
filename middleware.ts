import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const publicPaths = ["/", "/login"]
  const isPublicPath = publicPaths.some((publicPath) => path === publicPath || path.startsWith("/api/auth"))

  // Get the session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Redirect logic
  if (!token && !isPublicPath) {
    // Redirect to login if trying to access protected route without being logged in
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Role-based access control
  if (token) {
    const userRole = token.role as string

    // Check if user is trying to access a dashboard they don't have permission for
    if (path.startsWith("/dashboard/")) {
      const roleFromPath = path.split("/")[2] // Extract role from path

      // Convert roleFromPath to match the format in the token
      const normalizedRoleFromPath =
        roleFromPath === "admin"
          ? "ADMIN"
          : roleFromPath === "teacher"
            ? "TEACHER"
            : roleFromPath === "parent"
              ? "PARENT"
            : roleFromPath === "student"
              ? "STUDENT"
              : ""

      if (normalizedRoleFromPath && normalizedRoleFromPath !== userRole) {
        // Redirect to the correct dashboard based on user role
        const correctPath = `/dashboard/${userRole.toLowerCase()}`
        return NextResponse.redirect(new URL(correctPath, request.url))
      }
    }
  }

  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}

