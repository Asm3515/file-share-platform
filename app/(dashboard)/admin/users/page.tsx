"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, MoreVertical, Shield, User, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { UserRole } from "@/lib/models"

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated" && session?.user?.role !== UserRole.ADMIN) {
      router.push("/dashboard")
    }
  }, [status, session, router])

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === UserRole.ADMIN) {
      fetchUsers()
    }
  }, [status, session])

  const fetchUsers = async () => {
    setIsLoading(true)
    setError("")
    try {
      const response = await fetch("/api/admin/users")
      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      setError("Error loading users. Please try again.")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePromoteToAdmin = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: UserRole.ADMIN }),
      })
      if (!response.ok) {
        throw new Error("Failed to promote user")
      }
      fetchUsers()
    } catch (error) {
      console.error("Promote error:", error)
      alert("Failed to promote user")
    }
  }

  const handleDemoteToUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: UserRole.USER }),
      })
      if (!response.ok) {
        throw new Error("Failed to demote user")
      }
      fetchUsers()
    } catch (error) {
      console.error("Demote error:", error)
      alert("Failed to demote user")
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error("Failed to delete user")
      }
      fetchUsers()
    } catch (error) {
      console.error("Delete error:", error)
      alert("Failed to delete user")
    }
  }

  if (status === "loading") {
    return <div className="flex h-full items-center justify-center">Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Users</h1>
        <Button variant="outline" onClick={fetchUsers} disabled={isLoading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-red-600">{error}</CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        user.role === UserRole.ADMIN ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                      }
                    >
                      {user.role === UserRole.ADMIN ? (
                        <Shield className="mr-1 h-3 w-3" />
                      ) : (
                        <User className="mr-1 h-3 w-3" />
                      )}
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {user.id !== session?.user?.id && (
                          <>
                            {user.role === UserRole.USER ? (
                              <DropdownMenuItem onClick={() => handlePromoteToAdmin(user.id)}>
                                <Shield className="mr-2 h-4 w-4" />
                                Promote to Admin
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleDemoteToUser(user.id)}>
                                <User className="mr-2 h-4 w-4" />
                                Demote to User
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteUser(user.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
