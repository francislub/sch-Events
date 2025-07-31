"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  CalendarDays,
  GraduationCap,
  School,
  Users,
  TrendingUp,
  BookOpen,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  UserCheck,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { getAdminStats } from "@/app/actions/admin-actions"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface StatsData {
  studentsCount: number
  teachersCount: number
  classesCount: number
  parentsCount: number
  attendanceRate: number
  recentActivities: {
    action: string
    details: string
    time: string
  }[]
}

export default function AdminDashboard() {
  const { toast } = useToast()

  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recentStudents, setRecentStudents] = useState<any[]>([])
  const [recentTeachers, setRecentTeachers] = useState<any[]>([])
  const [systemAlerts, setSystemAlerts] = useState<any[]>([])

  useEffect(() => {
    async function fetchDashboardData() {
      console.log("🔄 Fetching admin dashboard data...")
      try {
        setLoading(true)

        // Fetch admin stats
        console.log("📊 Fetching admin stats...")
        const response = await getAdminStats()

        if (response.success) {
          console.log("✅ Admin stats loaded:", response.data)
          setStats(response.data)
        } else {
          console.error("❌ Failed to fetch admin stats:", response.message)
          setError(response.message || "Failed to fetch dashboard data")
          toast({
            title: "Error",
            description: response.message || "Failed to fetch dashboard data",
            variant: "destructive",
          })
        }

        // Fetch recent students
        console.log("👨‍🎓 Fetching recent students...")
        const studentsResponse = await fetch("/api/students?limit=5&sort=recent")
        if (studentsResponse.ok) {
          const studentsData = await studentsResponse.json()
          console.log("✅ Recent students loaded:", studentsData.students?.length || 0)
          setRecentStudents(studentsData.students || [])
        }

        // Fetch recent teachers
        console.log("👨‍🏫 Fetching recent teachers...")
        const teachersResponse = await fetch("/api/teachers?limit=5&sort=recent")
        if (teachersResponse.ok) {
          const teachersData = await teachersResponse.json()
          console.log("✅ Recent teachers loaded:", teachersData.teachers?.length || 0)
          setRecentTeachers(teachersData.teachers || [])
        }

        // Mock system alerts for demo
        setSystemAlerts([
          { type: "warning", message: "3 students have low attendance", priority: "medium" },
          { type: "info", message: "New semester starts next week", priority: "low" },
          { type: "success", message: "All systems operational", priority: "low" },
        ])
      } catch (err) {
        console.error("💥 Error fetching dashboard data:", err)
        setError("An unexpected error occurred")
        toast({
          title: "Error",
          description: "Failed to fetch dashboard data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [toast])

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h2>
          <p className="text-muted-foreground">Welcome back! Here's what's happening at your school.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/admin/students/new">
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
              Add Student
            </Button>
          </Link>
          <Link href="/dashboard/admin/teachers/new">
            <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50 bg-transparent">
              Add Teacher
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          <TabsTrigger value="alerts">System Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Main Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-blue-50 to-blue-100">
                <CardTitle className="text-sm font-medium text-blue-800">Total Students</CardTitle>
                <GraduationCap className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent className="pt-4">
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold text-blue-700">{stats?.studentsCount || 0}</div>
                    <p className="text-xs text-blue-600 mt-1">
                      <TrendingUp className="h-3 w-3 inline mr-1" />
                      +12% from last month
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border-green-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-green-50 to-green-100">
                <CardTitle className="text-sm font-medium text-green-800">Total Teachers</CardTitle>
                <Users className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent className="pt-4">
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold text-green-700">{stats?.teachersCount || 0}</div>
                    <p className="text-xs text-green-600 mt-1">
                      <CheckCircle className="h-3 w-3 inline mr-1" />
                      All positions filled
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border-purple-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-purple-50 to-purple-100">
                <CardTitle className="text-sm font-medium text-purple-800">Total Classes</CardTitle>
                <School className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent className="pt-4">
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold text-purple-700">{stats?.classesCount || 0}</div>
                    <p className="text-xs text-purple-600 mt-1">
                      <BookOpen className="h-3 w-3 inline mr-1" />
                      Across all grades
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border-orange-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-orange-50 to-orange-100">
                <CardTitle className="text-sm font-medium text-orange-800">Attendance Rate</CardTitle>
                <CalendarDays className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent className="pt-4">
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold text-orange-700">{stats?.attendanceRate || 0}%</div>
                    <Progress value={stats?.attendanceRate || 0} className="mt-2 h-2" />
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detailed Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 border-indigo-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100">
                <CardTitle className="text-indigo-900">Recent Activities</CardTitle>
                <CardDescription className="text-indigo-700">
                  Latest activities in the school management system
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[250px]" />
                          <Skeleton className="h-4 w-[200px]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center py-4 text-muted-foreground">{error}</div>
                ) : stats?.recentActivities && stats.recentActivities.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentActivities.map((activity, i) => (
                      <div
                        key={i}
                        className="flex items-start justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-100"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none text-indigo-900">{activity.action}</p>
                          <p className="text-sm text-indigo-700">{activity.details}</p>
                        </div>
                        <div className="text-sm text-indigo-600 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {activity.time}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No recent activities found</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="col-span-3 border-teal-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-teal-50 to-teal-100">
                <CardTitle className="text-teal-900">Quick Stats</CardTitle>
                <CardDescription className="text-teal-700">Summary of school statistics</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-4 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-teal-50 rounded-lg">
                      <div className="text-sm font-medium text-teal-800">Total Parents</div>
                      <Badge className="bg-teal-100 text-teal-800 border-teal-200">{stats?.parentsCount || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm font-medium text-blue-800">Student-Teacher Ratio</div>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        {stats?.teachersCount
                          ? `${Math.round((stats.studentsCount / stats.teachersCount) * 10) / 10}:1`
                          : "N/A"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="text-sm font-medium text-purple-800">Average Class Size</div>
                      <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                        {stats?.classesCount ? Math.round(stats.studentsCount / stats.classesCount) : 0}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="text-sm font-medium text-green-800">System Status</div>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Operational
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-cyan-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-cyan-50 to-cyan-100">
                <CardTitle className="text-cyan-900">Enrollment Trends</CardTitle>
                <CardDescription className="text-cyan-700">Student enrollment over time</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-cyan-800">This Month</span>
                    <span className="font-bold text-cyan-700">+{Math.floor(Math.random() * 20) + 5} students</span>
                  </div>
                  <Progress value={75} className="h-3" />
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-cyan-50 rounded-lg">
                      <div className="text-lg font-bold text-cyan-700">{Math.floor(Math.random() * 50) + 100}</div>
                      <div className="text-xs text-cyan-600">Grade 7-9</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-700">{Math.floor(Math.random() * 40) + 80}</div>
                      <div className="text-xs text-blue-600">Grade 10-11</div>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-lg">
                      <div className="text-lg font-bold text-indigo-700">{Math.floor(Math.random() * 30) + 60}</div>
                      <div className="text-xs text-indigo-600">Grade 12</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-rose-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-rose-50 to-rose-100">
                <CardTitle className="text-rose-900">Performance Metrics</CardTitle>
                <CardDescription className="text-rose-700">Academic performance overview</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-rose-800">Average Grade</span>
                    <Badge className="bg-rose-100 text-rose-800">B+</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-rose-800">Pass Rate</span>
                    <span className="font-bold text-rose-700">94.5%</span>
                  </div>
                  <Progress value={94.5} className="h-3" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-rose-50 rounded-lg text-center">
                      <div className="text-lg font-bold text-rose-700">A-B</div>
                      <div className="text-xs text-rose-600">65% of students</div>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg text-center">
                      <div className="text-lg font-bold text-orange-700">C-D</div>
                      <div className="text-xs text-orange-600">30% of students</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-emerald-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100">
                <CardTitle className="text-emerald-900">Recent Students</CardTitle>
                <CardDescription className="text-emerald-700">Newly enrolled students</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-[150px]" />
                          <Skeleton className="h-3 w-[100px]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentStudents.length > 0 ? (
                  <div className="space-y-3">
                    {recentStudents.map((student, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-100"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 bg-emerald-200 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-emerald-800">
                              {student.firstName?.charAt(0)}
                              {student.lastName?.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-emerald-900">
                              {student.firstName} {student.lastName}
                            </div>
                            <div className="text-xs text-emerald-600">Grade {student.grade}</div>
                          </div>
                        </div>
                        <Link href={`/dashboard/admin/students/${student.id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
                          >
                            View
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No recent students found</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-violet-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-violet-50 to-violet-100">
                <CardTitle className="text-violet-900">Recent Teachers</CardTitle>
                <CardDescription className="text-violet-700">Newly hired teachers</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-[150px]" />
                          <Skeleton className="h-3 w-[100px]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentTeachers.length > 0 ? (
                  <div className="space-y-3">
                    {recentTeachers.map((teacher, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 bg-violet-50 rounded-lg border border-violet-100"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 bg-violet-200 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-violet-800">
                              {teacher.user?.name?.charAt(0) || "T"}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-violet-900">{teacher.user?.name}</div>
                            <div className="text-xs text-violet-600">{teacher.department}</div>
                          </div>
                        </div>
                        <Link href={`/dashboard/admin/teachers/${teacher.id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-violet-200 text-violet-700 hover:bg-violet-50 bg-transparent"
                          >
                            View
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No recent teachers found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card className="border-amber-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100">
              <CardTitle className="text-amber-900">System Alerts</CardTitle>
              <CardDescription className="text-amber-700">Important notifications and system status</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {systemAlerts.map((alert, i) => (
                  <div
                    key={i}
                    className={`flex items-start space-x-3 p-4 rounded-lg border ${
                      alert.type === "warning"
                        ? "bg-yellow-50 border-yellow-200"
                        : alert.type === "success"
                          ? "bg-green-50 border-green-200"
                          : "bg-blue-50 border-blue-200"
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {alert.type === "warning" && <AlertTriangle className="h-5 w-5 text-yellow-600" />}
                      {alert.type === "success" && <CheckCircle className="h-5 w-5 text-green-600" />}
                      {alert.type === "info" && <UserCheck className="h-5 w-5 text-blue-600" />}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${
                          alert.type === "warning"
                            ? "text-yellow-800"
                            : alert.type === "success"
                              ? "text-green-800"
                              : "text-blue-800"
                        }`}
                      >
                        {alert.message}
                      </p>
                      <Badge
                        variant="outline"
                        className={`mt-2 ${
                          alert.priority === "high"
                            ? "border-red-200 text-red-700"
                            : alert.priority === "medium"
                              ? "border-yellow-200 text-yellow-700"
                              : "border-gray-200 text-gray-700"
                        }`}
                      >
                        {alert.priority} priority
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
