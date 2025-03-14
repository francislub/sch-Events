import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Bell, Plus, Download } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Administrator Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, Admin. Here's an overview of Wobulenzi High School.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/admin/students/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Student
            </Button>
          </Link>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Reports
          </Button>
        </div>
      </div>

      <Alert>
        <Bell className="h-4 w-4" />
        <AlertTitle>Important Notice</AlertTitle>
        <AlertDescription>
          Board meeting scheduled for March 20th, 2025 at 2:00 PM. Please prepare the quarterly reports.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,245</div>
                <p className="text-xs text-muted-foreground">+12% from last year</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78</div>
                <p className="text-xs text-muted-foreground">+3 new this term</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Classes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42</div>
                <p className="text-xs text-muted-foreground">Across all grades</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94.2%</div>
                <p className="text-xs text-muted-foreground">+1.2% from last term</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-full lg:col-span-4">
              <CardHeader>
                <CardTitle>Enrollment Trends</CardTitle>
                <CardDescription>Student enrollment over the past year</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-muted rounded-md">
                  <p className="text-muted-foreground">Enrollment chart would be displayed here</p>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-full lg:col-span-3">
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Latest system activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      action: "New Student Registered",
                      details: "John Smith - Grade 9A",
                      time: "Today, 11:23 AM",
                    },
                    {
                      action: "Teacher Added",
                      details: "Ms. Rebecca Johnson - Science",
                      time: "Yesterday, 3:45 PM",
                    },
                    {
                      action: "Fee Payment Received",
                      details: "Sarah Doe - Grade 10A - $500",
                      time: "Yesterday, 2:30 PM",
                    },
                    {
                      action: "Class Schedule Updated",
                      details: "Grade 11 - New timetable published",
                      time: "March 12, 2025",
                    },
                    {
                      action: "System Backup Completed",
                      details: "All data backed up successfully",
                      time: "March 11, 2025",
                    },
                  ].map((activity, index) => (
                    <div key={index} className="border-b pb-3 last:border-0 last:pb-0">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{activity.action}</h3>
                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{activity.details}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Management</CardTitle>
              <CardDescription>View and manage all students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <input type="text" placeholder="Search students..." className="border rounded p-2 w-full md:w-1/3" />

                  <select className="border rounded p-2 w-full md:w-1/4">
                    <option value="">All Grades</option>
                    <option value="7">Grade 7</option>
                    <option value="8">Grade 8</option>
                    <option value="9">Grade 9</option>
                    <option value="10">Grade 10</option>
                    <option value="11">Grade 11</option>
                    <option value="12">Grade 12</option>
                  </select>

                  <div className="flex-grow"></div>

                  <Link href="/dashboard/admin/students/new">
                    <Button>Add New Student</Button>
                  </Link>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted">
                        <th className="p-2 text-left font-medium">ID</th>
                        <th className="p-2 text-left font-medium">Name</th>
                        <th className="p-2 text-left font-medium">Grade</th>
                        <th className="p-2 text-left font-medium">Parent</th>
                        <th className="p-2 text-left font-medium">Contact</th>
                        <th className="p-2 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          id: "S1001",
                          name: "Sarah Doe",
                          grade: "10A",
                          parent: "John Doe",
                          contact: "+1 234-567-8901",
                        },
                        {
                          id: "S1002",
                          name: "Michael Smith",
                          grade: "10A",
                          parent: "James Smith",
                          contact: "+1 234-567-8902",
                        },
                        {
                          id: "S1003",
                          name: "Emily Johnson",
                          grade: "9B",
                          parent: "Robert Johnson",
                          contact: "+1 234-567-8903",
                        },
                        {
                          id: "S1004",
                          name: "David Wilson",
                          grade: "11C",
                          parent: "Thomas Wilson",
                          contact: "+1 234-567-8904",
                        },
                        {
                          id: "S1005",
                          name: "Jessica Brown",
                          grade: "8A",
                          parent: "William Brown",
                          contact: "+1 234-567-8905",
                        },
                      ].map((student, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-2">{student.id}</td>
                          <td className="p-2">{student.name}</td>
                          <td className="p-2">{student.grade}</td>
                          <td className="p-2">{student.parent}</td>
                          <td className="p-2">{student.contact}</td>
                          <td className="p-2">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">Showing 5 of 1,245 students</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled>
                      Previous
                    </Button>
                    <Button variant="outline" size="sm">
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teachers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Teacher Management</CardTitle>
              <CardDescription>View and manage all teachers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <input type="text" placeholder="Search teachers..." className="border rounded p-2 w-full md:w-1/3" />

                  <select className="border rounded p-2 w-full md:w-1/4">
                    <option value="">All Departments</option>
                    <option value="math">Mathematics</option>
                    <option value="science">Science</option>
                    <option value="english">English</option>
                    <option value="history">History</option>
                    <option value="arts">Arts</option>
                  </select>

                  <div className="flex-grow"></div>

                  <Link href="/dashboard/admin/teachers/new">
                    <Button>Add New Teacher</Button>
                  </Link>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted">
                        <th className="p-2 text-left font-medium">ID</th>
                        <th className="p-2 text-left font-medium">Name</th>
                        <th className="p-2 text-left font-medium">Department</th>
                        <th className="p-2 text-left font-medium">Classes</th>
                        <th className="p-2 text-left font-medium">Contact</th>
                        <th className="p-2 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          id: "T101",
                          name: "Ms. Johnson",
                          department: "Mathematics",
                          classes: "5",
                          contact: "+1 234-567-8910",
                        },
                        {
                          id: "T102",
                          name: "Mr. Smith",
                          department: "Science",
                          classes: "4",
                          contact: "+1 234-567-8911",
                        },
                        {
                          id: "T103",
                          name: "Mrs. Davis",
                          department: "English",
                          classes: "6",
                          contact: "+1 234-567-8912",
                        },
                        {
                          id: "T104",
                          name: "Mr. Wilson",
                          department: "History",
                          classes: "3",
                          contact: "+1 234-567-8913",
                        },
                        {
                          id: "T105",
                          name: "Ms. Brown",
                          department: "Mathematics",
                          classes: "5",
                          contact: "+1 234-567-8914",
                        },
                      ].map((teacher, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-2">{teacher.id}</td>
                          <td className="p-2">{teacher.name}</td>
                          <td className="p-2">{teacher.department}</td>
                          <td className="p-2">{teacher.classes}</td>
                          <td className="p-2">{teacher.contact}</td>
                          <td className="p-2">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">Showing 5 of 78 teachers</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled>
                      Previous
                    </Button>
                    <Button variant="outline" size="sm">
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Class Management</CardTitle>
              <CardDescription>View and manage all classes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <input type="text" placeholder="Search classes..." className="border rounded p-2 w-full md:w-1/3" />

                  <select className="border rounded p-2 w-full md:w-1/4">
                    <option value="">All Grades</option>
                    <option value="7">Grade 7</option>
                    <option value="8">Grade 8</option>
                    <option value="9">Grade 9</option>
                    <option value="10">Grade 10</option>
                    <option value="11">Grade 11</option>
                    <option value="12">Grade 12</option>
                  </select>

                  <div className="flex-grow"></div>

                  <Link href="/dashboard/admin/classes/new">
                    <Button>Add New Class</Button>
                  </Link>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted">
                        <th className="p-2 text-left font-medium">Class ID</th>
                        <th className="p-2 text-left font-medium">Class Name</th>
                        <th className="p-2 text-left font-medium">Grade</th>
                        <th className="p-2 text-left font-medium">Class Teacher</th>
                        <th className="p-2 text-left font-medium">Students</th>
                        <th className="p-2 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { id: "C101", name: "10A", grade: "10", teacher: "Ms. Johnson", students: "32" },
                        { id: "C102", name: "10B", grade: "10", teacher: "Mr. Smith", students: "30" },
                        { id: "C103", name: "9A", grade: "9", teacher: "Mrs. Davis", students: "28" },
                        { id: "C104", name: "9B", grade: "9", teacher: "Mr. Wilson", students: "27" },
                        { id: "C105", name: "11A", grade: "11", teacher: "Ms. Brown", students: "25" },
                      ].map((classInfo, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-2">{classInfo.id}</td>
                          <td className="p-2">{classInfo.name}</td>
                          <td className="p-2">{classInfo.grade}</td>
                          <td className="p-2">{classInfo.teacher}</td>
                          <td className="p-2">{classInfo.students}</td>
                          <td className="p-2">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">Showing 5 of 42 classes</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled>
                      Previous
                    </Button>
                    <Button variant="outline" size="sm">
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

