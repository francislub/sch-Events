import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Bell, Plus } from "lucide-react"
import Link from "next/link"

export default function TeacherDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, Ms. Johnson. Here's an overview of your classes.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/teacher/grades/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Grades
            </Button>
          </Link>
        </div>
      </div>

      <Alert>
        <Bell className="h-4 w-4" />
        <AlertTitle>Important Notice</AlertTitle>
        <AlertDescription>
          Staff meeting scheduled for March 18th, 2025 at 3:30 PM in the conference room.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="classes">My Classes</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">Across 3 grade levels</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">127</div>
                <p className="text-xs text-muted-foreground">Across all your classes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Grades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">23</div>
                <p className="text-xs text-muted-foreground">Assignments to be graded</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Classes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">Classes today</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Today's Schedule</CardTitle>
                <CardDescription>Your classes for today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      time: "8:00 AM - 9:30 AM",
                      class: "Mathematics - Grade 10A",
                      room: "Room 105",
                    },
                    {
                      time: "10:00 AM - 11:30 AM",
                      class: "Mathematics - Grade 9B",
                      room: "Room 203",
                    },
                    {
                      time: "1:00 PM - 2:30 PM",
                      class: "Mathematics - Grade 10B",
                      room: "Room 105",
                    },
                  ].map((schedule, index) => (
                    <div key={index} className="flex items-center space-x-4 rounded-md border p-3">
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{schedule.time}</p>
                        <p className="text-sm text-muted-foreground">{schedule.class}</p>
                        <p className="text-xs text-muted-foreground">{schedule.room}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Your recent actions and notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      action: "Grades Updated",
                      details: "Mathematics Quiz 3 - Grade 10A",
                      time: "Today, 10:23 AM",
                    },
                    {
                      action: "Attendance Marked",
                      details: "Grade 9B - All students present",
                      time: "Today, 10:05 AM",
                    },
                    {
                      action: "Assignment Created",
                      details: "Mathematics Homework - Grade 10B",
                      time: "Yesterday, 3:45 PM",
                    },
                    {
                      action: "Message from Parent",
                      details: "Sarah Doe's parent requested a meeting",
                      time: "Yesterday, 2:30 PM",
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

        <TabsContent value="classes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Classes</CardTitle>
              <CardDescription>All classes you are currently teaching</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: "Mathematics - Grade 10A",
                    students: 32,
                    schedule: "Monday, Wednesday, Friday - 8:00 AM",
                    room: "Room 105",
                  },
                  {
                    name: "Mathematics - Grade 10B",
                    students: 30,
                    schedule: "Monday, Wednesday, Friday - 1:00 PM",
                    room: "Room 105",
                  },
                  {
                    name: "Mathematics - Grade 9A",
                    students: 28,
                    schedule: "Tuesday, Thursday - 8:00 AM",
                    room: "Room 203",
                  },
                  {
                    name: "Mathematics - Grade 9B",
                    students: 27,
                    schedule: "Monday, Wednesday, Friday - 10:00 AM",
                    room: "Room 203",
                  },
                  {
                    name: "Advanced Mathematics - Grade 10",
                    students: 10,
                    schedule: "Tuesday, Thursday - 1:00 PM",
                    room: "Room 105",
                  },
                ].map((classInfo, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="font-medium text-lg">{classInfo.name}</h3>
                        <p className="text-sm text-muted-foreground">{classInfo.schedule}</p>
                        <p className="text-sm text-muted-foreground">{classInfo.room}</p>
                      </div>
                      <div className="mt-2 md:mt-0 flex items-center gap-2">
                        <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                          {classInfo.students} Students
                        </div>
                        <Link href={`/dashboard/teacher/classes/${index + 1}`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Management</CardTitle>
              <CardDescription>Mark and view attendance for your classes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <select className="border rounded p-2 w-full md:w-1/3">
                    <option value="">Select Class</option>
                    <option value="10A">Mathematics - Grade 10A</option>
                    <option value="10B">Mathematics - Grade 10B</option>
                    <option value="9A">Mathematics - Grade 9A</option>
                    <option value="9B">Mathematics - Grade 9B</option>
                    <option value="10Adv">Advanced Mathematics - Grade 10</option>
                  </select>

                  <input type="date" className="border rounded p-2 w-full md:w-1/3" defaultValue="2025-03-14" />

                  <Button className="w-full md:w-auto">Mark Attendance</Button>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted">
                        <th className="p-2 text-left font-medium">Student Name</th>
                        <th className="p-2 text-left font-medium">Status</th>
                        <th className="p-2 text-left font-medium">Date</th>
                        <th className="p-2 text-left font-medium">Class</th>
                        <th className="p-2 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: "Sarah Doe", status: "Present", date: "March 14, 2025", class: "Grade 10A" },
                        { name: "Michael Smith", status: "Absent", date: "March 14, 2025", class: "Grade 10A" },
                        { name: "Emily Johnson", status: "Present", date: "March 14, 2025", class: "Grade 10A" },
                        { name: "David Wilson", status: "Late", date: "March 14, 2025", class: "Grade 10A" },
                        { name: "Jessica Brown", status: "Present", date: "March 14, 2025", class: "Grade 10A" },
                      ].map((record, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-2">{record.name}</td>
                          <td className="p-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                record.status === "Present"
                                  ? "bg-green-100 text-green-800"
                                  : record.status === "Absent"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {record.status}
                            </span>
                          </td>
                          <td className="p-2">{record.date}</td>
                          <td className="p-2">{record.class}</td>
                          <td className="p-2">
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

