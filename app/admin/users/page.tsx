"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Search, UserPlus, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react"

export default function AdminUsersPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  })
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    // Redirect if not admin
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/admin/users")
      return
    }

    if (status === "authenticated") {
      if (session.user.role !== "ADMIN") {
        router.push("/dashboard")
        return
      }

      fetchUsers()
    }
  }, [status, session, router, pagination.page, roleFilter, searchQuery])

  const fetchUsers = async () => {
    try {
      setLoading(true)

      // Build query parameters
      const params = new URLSearchParams()
      params.append("page", pagination.page.toString())
      params.append("limit", pagination.limit.toString())

      if (roleFilter !== "all") {
        params.append("role", roleFilter)
      }

      if (searchQuery) {
        params.append("search", searchQuery)
      }

      const response = await fetch(`/api/admin/users?${params.toString()}`)

      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }

      const data = await response.json()
      setUsers(data.users)
      setPagination(data.pagination)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching users:", err)
      setError("Failed to load users. Please try again later.")
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
    setPagination((prev) => ({ ...prev, page: 1 })) // Reset to first page on new search
  }

  const handleRoleFilterChange = (value) => {
    setRoleFilter(value)
    setPagination((prev) => ({ ...prev, page: 1 })) // Reset to first page on filter change
  }

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.pages) return
    setPagination((prev) => ({ ...prev, page: newPage }))
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete user")
      }

      // Remove user from the list
      setUsers(users.filter((user) => user.id !== userToDelete.id))
      setShowDeleteDialog(false)
      setUserToDelete(null)
    } catch (err) {
      console.error("Error deleting user:", err)
      setError(err.message || "Failed to delete user. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800 border-red-200"
      case "TEACHER":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "STUDENT":
        return "bg-green-100 text-green-800 border-green-200"
      case "PARENT":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (loading && users.length === 0) {
    return (
      <div className="container py-8 text-center">
        <p>Loading users...</p>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        <Button onClick={() => router.push("/admin/users/create")}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add New User
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage all users in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                className="pl-10"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <div>
              <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="ADMIN">Administrators</SelectItem>
                  <SelectItem value="TEACHER">Teachers</SelectItem>
                  <SelectItem value="STUDENT">Students</SelectItem>
                  <SelectItem value="PARENT">Parents</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No users found matching your criteria.</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge className={getRoleBadgeColor(user.role)}>{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          {user.role === "STUDENT" && (
                            <span className="text-sm text-muted-foreground">
                              {user.studentId && `ID: ${user.studentId}`}
                              {user.grade && `, Grade: ${user.grade}`}
                            </span>
                          )}
                          {user.role === "TEACHER" && user.department && (
                            <span className="text-sm text-muted-foreground">Dept: {user.department}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/users/${user.id}`)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setUserToDelete(user)
                                setShowDeleteDialog(true)
                              }}
                              disabled={user.id === session?.user?.id} // Prevent deleting yourself
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the user "{userToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

