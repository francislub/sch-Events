import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Bell } from "lucide-react"

export default function ParentDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Parent Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, John Doe. Here's an overview of your children's progress.
          </p>
        </div>
      </div>

      <Alert>
        <Bell className="h-4 w-4" />
        <AlertTitle>Important Notice</AlertTitle>
        <AlertDescription>
          Parent-Teacher meeting scheduled for March 20th, 2025. Please mark your calendar.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="academics">Academics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Children</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">Sarah Doe (Grade 10), Michael Doe (Grade 8)</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">95%</div>
                <p className="text-xs text-muted-foreground">Average attendance for all children</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">Events in the next 30 days</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Recent Announcements</CardTitle>
                <CardDescription>Latest updates from the school</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      title: "End of Term Exams",
                      date: "March 10, 2025",
                      description:
                        "End of term examinations will begin on March 25th. Please ensure your children are prepared.",
                    },
                    {
                      title: "School Holiday",
                      date: "March 5, 2025",
                      description: "School will be closed on March 15th for Teacher Professional Development Day.",
                    },
                    {
                      title: "Sports Day",
                      date: "February 28, 2025",
                      description: "Annual Sports Day will be held on April 5th. Parents are welcome to attend.",
                    },
                  ].map((announcement, index) => (
                    <div key={index} className="border-b pb-3 last:border-0 last:pb-0">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{announcement.title}</h3>
                        <span className="text-xs text-muted-foreground">{announcement.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{announcement.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Academic Performance</CardTitle>
                <CardDescription>Recent grades and assessments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Sarah Doe - Grade 10</h3>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="bg-blue-50 p-2 rounded">
                        <p className="text-xs text-muted-foreground">Mathematics</p>
                        <p className="font-medium">A (92%)</p>
                      </div>
                      <div className="bg-blue-50 p-2 rounded">
                        <p className="text-xs text-muted-foreground">Science</p>
                        <p className="font-medium">A- (88%)</p>
                      </div>
                      <div className="bg-blue-50 p-2 rounded">
                        <p className="text-xs text-muted-foreground">English</p>
                        <p className="font-medium">B+ (85%)</p>
                      </div>
                      <div className="bg-blue-50 p-2 rounded">
                        <p className="text-xs text-muted-foreground">History</p>
                        <p className="font-medium">A (90%)</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium">Michael Doe - Grade 8</h3>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="bg-blue-50 p-2 rounded">
                        <p className="text-xs text-muted-foreground">Mathematics</p>
                        <p className="font-medium">B (82%)</p>
                      </div>
                      <div className="bg-blue-50 p-2 rounded">
                        <p className="text-xs text-muted-foreground">Science</p>
                        <p className="font-medium">B+ (87%)</p>
                      </div>
                      <div className="bg-blue-50 p-2 rounded">
                        <p className="text-xs text-muted-foreground">English</p>
                        <p className="font-medium">A- (89%)</p>
                      </div>
                      <div className="bg-blue-50 p-2 rounded">
                        <p className="text-xs text-muted-foreground">Geography</p>
                        <p className="font-medium">B (83%)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>Detailed attendance for your children</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Sarah Doe - Grade 10</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted">
                          <th className="p-2 text-left font-medium">Month</th>
                          <th className="p-2 text-left font-medium">Present</th>
                          <th className="p-2 text-left font-medium">Absent</th>
                          <th className="p-2 text-left font-medium">Late</th>
                          <th className="p-2 text-left font-medium">Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { month: "January", present: 20, absent: 1, late: 1, rate: "95%" },
                          { month: "February", present: 18, absent: 0, late: 2, rate: "100%" },
                          { month: "March (Current)", present: 15, absent: 0, late: 1, rate: "100%" },
                        ].map((record, index) => (
                          <tr key={index} className="border-t">
                            <td className="p-2">{record.month}</td>
                            <td className="p-2">{record.present}</td>
                            <td className="p-2">{record.absent}</td>
                            <td className="p-2">{record.late}</td>
                            <td className="p-2 font-medium">{record.rate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Michael Doe - Grade 8</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted">
                          <th className="p-2 text-left font-medium">Month</th>
                          <th className="p-2 text-left font-medium">Present</th>
                          <th className="p-2 text-left font-medium">Absent</th>
                          <th className="p-2 text-left font-medium">Late</th>
                          <th className="p-2 text-left font-medium">Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { month: "January", present: 19, absent: 2, late: 1, rate: "90%" },
                          { month: "February", present: 18, absent: 1, late: 1, rate: "95%" },
                          { month: "March (Current)", present: 14, absent: 1, late: 0, rate: "93%" },
                        ].map((record, index) => (
                          <tr key={index} className="border-t">
                            <td className="p-2">{record.month}</td>
                            <td className="p-2">{record.present}</td>
                            <td className="p-2">{record.absent}</td>
                            <td className="p-2">{record.late}</td>
                            <td className="p-2 font-medium">{record.rate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Academic Records</CardTitle>
              <CardDescription>Detailed academic performance for your children</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Sarah Doe - Grade 10</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted">
                          <th className="p-2 text-left font-medium">Subject</th>
                          <th className="p-2 text-left font-medium">Teacher</th>
                          <th className="p-2 text-left font-medium">Term 1</th>
                          <th className="p-2 text-left font-medium">Term 2</th>
                          <th className="p-2 text-left font-medium">Current</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          {
                            subject: "Mathematics",
                            teacher: "Mr. Johnson",
                            term1: "A (92%)",
                            term2: "A- (90%)",
                            current: "A (93%)",
                          },
                          {
                            subject: "Science",
                            teacher: "Mrs. Smith",
                            term1: "B+ (87%)",
                            term2: "A- (90%)",
                            current: "A- (88%)",
                          },
                          {
                            subject: "English",
                            teacher: "Ms. Davis",
                            term1: "A- (89%)",
                            term2: "B+ (86%)",
                            current: "B+ (85%)",
                          },
                          {
                            subject: "History",
                            teacher: "Mr. Wilson",
                            term1: "A (91%)",
                            term2: "A (92%)",
                            current: "A (90%)",
                          },
                        ].map((record, index) => (
                          <tr key={index} className="border-t">
                            <td className="p-2">{record.subject}</td>
                            <td className="p-2">{record.teacher}</td>
                            <td className="p-2">{record.term1}</td>
                            <td className="p-2">{record.term2}</td>
                            <td className="p-2 font-medium">{record.current}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Michael Doe - Grade 8</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted">
                          <th className="p-2 text-left font-medium">Subject</th>
                          <th className="p-2 text-left font-medium">Teacher</th>
                          <th className="p-2 text-left font-medium">Term 1</th>
                          <th className="p-2 text-left font-medium">Term 2</th>
                          <th className="p-2 text-left font-medium">Current</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          {
                            subject: "Mathematics",
                            teacher: "Mrs. Brown",
                            term1: "B (83%)",
                            term2: "B+ (86%)",
                            current: "B (82%)",
                          },
                          {
                            subject: "Science",
                            teacher: "Mr. Taylor",
                            term1: "B+ (87%)",
                            term2: "B+ (87%)",
                            current: "B+ (87%)",
                          },
                          {
                            subject: "English",
                            teacher: "Ms. Miller",
                            term1: "A- (89%)",
                            term2: "A- (90%)",
                            current: "A- (89%)",
                          },
                          {
                            subject: "Geography",
                            teacher: "Mr. Roberts",
                            term1: "B (82%)",
                            term2: "B (83%)",
                            current: "B (83%)",
                          },
                        ].map((record, index) => (
                          <tr key={index} className="border-t">
                            <td className="p-2">{record.subject}</td>
                            <td className="p-2">{record.teacher}</td>
                            <td className="p-2">{record.term1}</td>
                            <td className="p-2">{record.term2}</td>
                            <td className="p-2 font-medium">{record.current}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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

