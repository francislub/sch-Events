"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { FileText, Clock, CheckCircle, AlertCircle, Download, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"

export default function StudentAssignments() {
  const { data: session } = useSession()
  const { toast } = useToast()

  const [assignments, setAssignments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  // Fetch assignments
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await fetch("/api/assignments")
        if (!response.ok) {
          throw new Error("Failed to fetch assignments")
        }
        const data = await response.json()
        setAssignments(Array.isArray(data) ? data : [])
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching assignments:", error)
        toast({
          title: "Error",
          description: "Failed to load assignments. Please try again.",
          variant: "destructive",
        })
        setAssignments([])
        setIsLoading(false)
      }
    }

    if (session) {
      fetchAssignments()
    }
  }, [session, toast])

  // Filter assignments by status
  const pendingAssignments = assignments.filter((assignment) => !assignment.submitted)
  const submittedAssignments = assignments.filter((assignment) => assignment.submitted && !assignment.graded)
  const gradedAssignments = assignments.filter((assignment) => assignment.submitted && assignment.graded)

  // Calculate statistics
  const totalAssignments = assignments.length
  const completedAssignments = submittedAssignments.length + gradedAssignments.length
  const completionRate = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0
  const averageGrade =
    gradedAssignments.length > 0
      ? Math.round(gradedAssignments.reduce((sum, assignment) => sum + assignment.grade, 0) / gradedAssignments.length)
      : 0

  const handleViewAssignment = (assignment: any) => {
    setSelectedAssignment(assignment)
    setViewDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
          <p className="text-muted-foreground">Loading your assignments...</p>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
        <p className="text-muted-foreground">View and manage your assignments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="mr-2 h-4 w-4 text-yellow-500" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingAssignments.length}</div>
            <p className="text-sm text-muted-foreground">Assignments to be completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <Progress value={completionRate} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertCircle className="mr-2 h-4 w-4 text-blue-500" />
              Average Grade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {gradedAssignments.length > 0 ? `${averageGrade}%` : "No grades yet"}
            </div>
            <p className="text-sm text-muted-foreground">Based on {gradedAssignments.length} graded assignments</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Assignments</CardTitle>
          <CardDescription>View and manage all your assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="pending">Pending ({pendingAssignments.length})</TabsTrigger>
              <TabsTrigger value="submitted">Submitted ({submittedAssignments.length})</TabsTrigger>
              <TabsTrigger value="graded">Graded ({gradedAssignments.length})</TabsTrigger>
              <TabsTrigger value="all">All ({assignments.length})</TabsTrigger>
            </TabsList>

            {["pending", "submitted", "graded", "all"].map((tab) => {
              let filteredAssignments
              if (tab === "pending") filteredAssignments = pendingAssignments
              else if (tab === "submitted") filteredAssignments = submittedAssignments
              else if (tab === "graded") filteredAssignments = gradedAssignments
              else filteredAssignments = assignments

              return (
                <TabsContent key={tab} value={tab}>
                  {filteredAssignments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No {tab} assignments found.</div>
                  ) : (
                    <div className="space-y-4">
                      {filteredAssignments.map((assignment) => (
                        <div
                          key={assignment.id}
                          className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-primary" />
                              <h3 className="font-medium">{assignment.title}</h3>
                              <Badge
                                className={
                                  assignment.submitted
                                    ? assignment.graded
                                      ? "bg-green-100 text-green-800"
                                      : "bg-blue-100 text-blue-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }
                              >
                                {assignment.submitted ? (assignment.graded ? "Graded" : "Submitted") : "Pending"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{assignment.subject}</p>
                            <div className="text-sm">
                              <span className="text-muted-foreground">Due: </span>
                              {format(new Date(assignment.dueDate), "PPP")}
                              {new Date(assignment.dueDate) < new Date() && !assignment.submitted && (
                                <span className="text-red-500 ml-2">Overdue</span>
                              )}
                            </div>
                            {assignment.graded && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Grade: </span>
                                <span
                                  className={
                                    assignment.grade >= 90
                                      ? "text-green-600 font-medium"
                                      : assignment.grade >= 70
                                        ? "text-blue-600 font-medium"
                                        : "text-red-600 font-medium"
                                  }
                                >
                                  {assignment.grade}%
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 self-end md:self-center">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                              onClick={() => handleViewAssignment(assignment)}
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </Button>
                            {assignment.fileUrl && (
                              <Button variant="outline" size="sm" className="flex items-center gap-1" asChild>
                                <Link href={assignment.fileUrl} target="_blank" download>
                                  <Download className="h-4 w-4" />
                                  Download
                                </Link>
                              </Button>
                            )}
                            {!assignment.submitted && (
                              <Button size="sm" className="flex items-center gap-1" asChild>
                                <Link href={`/dashboard/student/assignments/${assignment.id}/submit`}>Submit</Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              )
            })}
          </Tabs>
        </CardContent>
      </Card>

      {/* View Assignment Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedAssignment?.title}</DialogTitle>
            <DialogDescription>{selectedAssignment?.subject}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Description</h4>
              <p className="text-sm">{selectedAssignment?.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Assigned Date</h4>
                <p className="text-sm">
                  {selectedAssignment?.createdAt
                    ? format(new Date(selectedAssignment.createdAt), "PPP")
                    : "Not available"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Due Date</h4>
                <p className="text-sm">
                  {selectedAssignment?.dueDate ? format(new Date(selectedAssignment.dueDate), "PPP") : "Not available"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Status</h4>
                <Badge
                  className={
                    selectedAssignment?.submitted
                      ? selectedAssignment?.graded
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                  }
                >
                  {selectedAssignment?.submitted ? (selectedAssignment?.graded ? "Graded" : "Submitted") : "Pending"}
                </Badge>
              </div>
              {selectedAssignment?.graded && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Grade</h4>
                  <p className="text-sm font-medium">
                    <span
                      className={
                        selectedAssignment.grade >= 90
                          ? "text-green-600"
                          : selectedAssignment.grade >= 70
                            ? "text-blue-600"
                            : "text-red-600"
                      }
                    >
                      {selectedAssignment.grade}%
                    </span>
                  </p>
                </div>
              )}
            </div>
            {selectedAssignment?.feedback && (
              <div>
                <h4 className="text-sm font-medium mb-1">Teacher Feedback</h4>
                <p className="text-sm">{selectedAssignment.feedback}</p>
              </div>
            )}
            <div className="flex justify-end gap-2">
              {selectedAssignment?.fileUrl && (
                <Button variant="outline" asChild>
                  <Link href={selectedAssignment.fileUrl} target="_blank" download>
                    <Download className="h-4 w-4 mr-2" />
                    Download Assignment
                  </Link>
                </Button>
              )}
              {!selectedAssignment?.submitted && (
                <Button asChild>
                  <Link href={`/dashboard/student/assignments/${selectedAssignment?.id}/submit`}>
                    Submit Assignment
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

