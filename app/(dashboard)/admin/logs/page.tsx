"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { RefreshCw } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { UserRole } from "@/lib/models"

export default function AdminLogsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [logs, setLogs] = useState([])
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
      fetchLogs()
    }
  }, [status, session])

  const fetchLogs = async () => {
    setIsLoading(true)
    setError("")
    try {
      const response = await fetch("/api/admin/logs")
      if (!response.ok) {
        throw new Error("Failed to fetch logs")
      }
      const data = await response.json()
      setLogs(data)
    } catch (error) {
      setError("Error loading logs. Please try again.")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "UPLOAD":
        return "bg-green-100 text-green-800"
      case "DOWNLOAD":
        return "bg-blue-100 text-blue-800"
      case "DELETE":
        return "bg-red-100 text-red-800"
      case "SHARE":
        return "bg-purple-100 text-purple-800"
      case "UPDATE_ACCESS":
        return "bg-yellow-100 text-yellow-800"
      case "REMOVE_ACCESS":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (status === "loading") {
    return <div className="flex h-full items-center justify-center">Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Activity Logs</h1>
        <Button variant="outline" onClick={fetchLogs} disabled={isLoading}>
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
                <TableHead>Action</TableHead>
                <TableHead>File</TableHead>
                <TableHead>User</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <Badge variant="outline" className={getActionColor(log.action)}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{log.fileName}</TableCell>
                  <TableCell>{log.userName || "Anonymous"}</TableCell>
                  <TableCell>{log.ipAddress || "N/A"}</TableCell>
                  <TableCell>{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}</TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No logs found
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
