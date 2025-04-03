import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, Calendar, MessageSquare, GraduationCap, UserCheck } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">School Management System</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="outline">Log In</Button>
            </Link>
            <Link href="/register-admin">
              <Button>Register Admin</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Welcome to Our School Management System</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            A comprehensive solution for managing students, teachers, classes, and more.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/login?role=admin">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Admin Login
              </Button>
            </Link>
            <Link href="/login?role=teacher">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Teacher Login
              </Button>
            </Link>
            <Link href="/login?role=student">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Student Login
              </Button>
            </Link>
            <Link href="/login?role=parent">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Parent Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage students, teachers, and parents in one place</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Create and manage user accounts with different roles and permissions. Track student information,
                  teacher assignments, and parent communications.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BookOpen className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Academic Management</CardTitle>
                <CardDescription>Track classes, grades, and assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Organize classes, record grades, manage assignments, and generate academic reports for students and
                  parents.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Calendar className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Attendance Tracking</CardTitle>
                <CardDescription>Monitor student attendance and punctuality</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Record and track daily attendance, generate reports, and notify parents about absences or tardiness.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <MessageSquare className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Communication</CardTitle>
                <CardDescription>Facilitate communication between all stakeholders</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Enable messaging between teachers, students, and parents. Share announcements, events, and important
                  information.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <UserCheck className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Parent Portal</CardTitle>
                <CardDescription>Keep parents informed and involved</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Provide parents with access to their children's academic progress, attendance records, and school
                  communications.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <GraduationCap className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Student Dashboard</CardTitle>
                <CardDescription>Empower students with information</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Give students access to their schedules, assignments, grades, and communication with teachers.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our School at a Glance</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-primary mb-2">500+</p>
              <p className="text-lg">Students</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary mb-2">50+</p>
              <p className="text-lg">Teachers</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary mb-2">30+</p>
              <p className="text-lg">Classes</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary mb-2">95%</p>
              <p className="text-lg">Graduation Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">School Management System</h3>
              <p className="mb-4">
                A comprehensive solution for educational institutions to manage their administrative and academic
                operations efficiently.
              </p>
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-6 w-6" />
                <span className="font-bold">Excellence in Education</span>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/login" className="hover:underline">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/register-admin" className="hover:underline">
                    Register Admin
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contact Us</h3>
              <address className="not-italic">
                <p>123 Education Street</p>
                <p>Learning City, ED 12345</p>
                <p className="mt-2">Email: info@schoolms.com</p>
                <p>Phone: (123) 456-7890</p>
              </address>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p>&copy; {new Date().getFullYear()} School Management System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

