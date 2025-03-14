import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-center text-blue-800">WOBULENZI HIGH SCHOOL</h1>
          <p className="text-center text-gray-600 mt-2">School Management System</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Welcome to Our School Management Portal</h2>
          <p className="text-lg text-gray-600">Access your personalized dashboard by selecting your role below</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <UserRoleCard
            title="Parents"
            description="Access your child's academic progress, attendance, and communicate with teachers."
            href="/login?role=parent"
          />

          <UserRoleCard
            title="Teachers"
            description="Manage classes, record attendance, grades, and communicate with parents."
            href="/login?role=teacher"
          />

          <UserRoleCard
            title="Administrator"
            description="Oversee all school operations, manage staff, students, and academic programs."
            href="/login?role=admin"
          />
        </div>
      </main>

      <footer className="bg-blue-800 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} Wobulenzi High School. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function UserRoleCard({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow"></CardContent>
      <CardFooter>
        <Link href={href} className="w-full">
          <Button className="w-full">Login as {title}</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

