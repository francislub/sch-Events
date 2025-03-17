"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Plus, Calendar, Download, Search } from 'lucide-react'
import Link from "next/link"

export default function TeacherAttendance() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [filter, setFilter] = useState({
    class: "",
    date: "",
    status: "",
    search: ""
  })
  
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Fetch attendance data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, this would fetch from your API
        // In a real app, you would fetch this data from your API
        // const classesResponse = await fetch('/api/classes')
        // const classesData = await classesResponse.json()
        // setClasses(classesData)
        
        // const attendanceResponse = await fetch('/api/attendance')
        // const attendanceData = await attendanceResponse.json()
        // setAttendanceRecords(attendanceData)

        // Mock data for demonstration
        setTimeout(() => {
          const mockClasses = [
            { id: "1", name: "10A" },
            { id: "2", name: "10B" },
            { id: "3", name: "9A" },
            { id: "4", name: "9B" },
            { id: "5", name: "10Adv" }
          ]
          
          const mockAttendanceRecords = [
            {
              id: "1",
              date: "2025-03-14",
              status: "Present",
              student: { id: "1", firstName: "Sarah", lastName: "Doe", class: { name: "10A" } }
            },
            {
              id: "2",
              date: "2025-03-14",
              status: "Absent",
              student: { id: "2", firstName: "Michael", lastName: "Smith", class: { name: "10A" } }
            },
            {
              id: "3",
              date: "2025-03-14",
              status: "Present",
              student: { id: "5", firstName: "Jessica", lastName: "Brown", class: { name: "10A" } }
            },
            {
              id: "4",
              date: "2025-03-14",
              status: "Late",
              student: { id: "4", firstName: "David", lastName: "Wilson", class: { name: "10B" } }
            },
            {
              id: "5",
              date: "2025-03-14",
              status: "Present",
              student: { id: "3", firstName: "Emily", lastName: "Johnson", class: { name: "9B" } }
            },
            {
              id: "6",
              date: "2025-03-13",
              status: "Present",
              student: { id: "1", firstName: "Sarah", lastName: "Doe", class: { name: "10A" } }
            },
            {
              id: "7",
              date: "2025-03-13",
              status: "Present",
              student: { id: "2", firstName: "Michael", lastName: "Smith", class: { name: "10A" } }
            },
            {
              id: "8",
              date: "2025-03-13",
              status: "Absent",
              student: { id: "5", firstName: "Jessica", lastName: "Brown", class: { name: "10A" } }
            },
            {
              id: "9",
              date: "2025-03-13",
              status: "Present",
              student: { id: "4", firstName: "David", lastName: "Wilson", class: { name: "10B" } }
            },
            {
              id: "10",
              date: "2025-03-13",
              status: "Late",
              student: { id: "3", firstName: "Emily", lastName: "Johnson", class: { name: "9B" } }
            }
          ]
          
          setClasses(mockClasses)
          setAttendanceRecords(mockAttendanceRecords)
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load attendance data. Please try again.",
          variant: "destructive"
        })
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])
  
  // Filter attendance records based on selected filters
  const filteredRecords = attendanceRecords.filter(record => {
    const matchesClass = filter.class === 'all' || !filter.class || record.student.class.name === filter.class
    const matchesDate = !filter.date || record.date === filter.date
    const matchesStatus = filter.status === 'all' || !filter.status || record.status === filter.status
    const matchesSearch = !filter.search || 
      record.student.firstName.toLowerCase().includes(filter.search.toLowerCase()) ||
      record.student.lastName.toLowerCase().includes(filter.search.toLowerCase())
    
    return matchesClass && matchesDate && matchesStatus && matchesSearch
  })
  
  // Handle filter change
  const handleFilterChange = (name: string, value: string) => {
    setFilter(prev => ({ ...prev, [name]: value }))
  }
  
  // Function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  
  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Attendance records are being exported to CSV."
    })
    
    // In a real app, you would implement the export functionality
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance Management</h1>
          <p className="text-muted-foreground">
            Mark and manage student attendance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/teacher/attendance/mark">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Mark Attendance
            </Button>
          </Link>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>View and filter attendance records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by student name..."
                  className="pl-8"
                  value={filter.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
              </div>
              
              <Select
                value={filter.class}
                onValueChange={(value) => handleFilterChange("class", value)}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map(cls => (
                    <SelectItem key={cls.id} value={cls.name}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-2 items-center">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  className="w-full md:w-[180px]"
                  value={filter.date}
                  onChange={(e) => handleFilterChange("date", e.target.value)}
                />
              </div>
              
              <Select
                value={filter.status}
                onValueChange={(value) => handleFilterChange("status", value)}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Present">Present</SelectItem>
                  <SelectItem value="Absent">Absent</SelectItem>
                  <SelectItem value="Late">Late</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="animate-pulse flex items-center border-b pb-3">
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                    <div className="h-6 w-16 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No attendance records found matching the selected filters.
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted">
                      <th className="p-2 text-left font-medium">Student</th>
                      <th className="p-2 text-left font-medium">Class</th>
                      <th className="p-2 text-left font-medium">Date</th>
                      <th className="p-2 text-left font-medium">Status</th>
                      <th className="p-2 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((record) => (
                      <tr key={record.id} className="border-t">
                        <td className="p-2">{record.student.firstName} {record.student.lastName}</td>
                        <td className="p-2">{record.student.class.name}</td>
                        <td className="p-2">{formatDate(record.date)}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            record.status === "Present" ? 'bg-green-100 text-green-800' :
                            record.status === "Absent" ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="p-2">
                          <Button variant="outline" size="sm" onClick={() => {
                            router.push(`/dashboard/teacher/attendance/edit/${record.id}`)
                          }}>
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Attendance Summary</CardTitle>
          <CardDescription>Overview of today's attendance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {classes.map(cls => {
              // Filter today's records for this class
              const today = new Date().toISOString().split('T')[0]
              const classRecords = attendanceRecords.filter(
                record => record.student.class.name === cls.name && record.date === today
              )
              
              // Calculate statistics
              const total = classRecords.length
              const present = classRecords.filter(r => r.status === "Present").length
              const absent = classRecords.filter(r => r.status === "Absent").length
              const late = classRecords.filter(r => r.status === "Late").length
              
              // Calculate attendance rate
              const rate = total > 0 ? Math.round((present / total) * 100) : 0
              
              return (
                <Card key={cls.id}>
                  <CardHeader className="pb-2">
                    <CardTitle>{cls.name}</CardTitle>
                    <CardDescription>
                      Today's Attendance: {present} present, {absent} absent, {late} late
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Attendance Rate</span>
                        <span className="text-sm font-medium">{rate}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${rate}%` }}
                        ></div>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-2"
                        onClick={() => router.push(`/dashboard/teacher/attendance/mark?classId=${cls.id}`)}
                      >
                        Mark {cls.name} Attendance
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
