"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"

interface ShareDialogProps {
  file: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShareDialog({ file, open, onOpenChange }: ShareDialogProps) {
  const [email, setEmail] = useState("")
  const [permissions, setPermissions] = useState({
    canView: true,
    canEdit: false,
    canUpload: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [users, setUsers] = useState([])
  const [sharedUsers, setSharedUsers] = useState([])

  useEffect(() => {
    if (open && file) {
      fetchUsers()
      fetchSharedUsers()
    }
  }, [open, file])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users")
      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error("Fetch users error:", error)
    }
  }

  const fetchSharedUsers = async () => {
    if (!file) return

    try {
      const response = await fetch(`/api/files/${file.id}/access`)
      if (!response.ok) {
        throw new Error("Failed to fetch shared users")
      }
      const data = await response.json()
      setSharedUsers(data)
    } catch (error) {
      console.error("Fetch shared users error:", error)
    }
  }

  const handleShare = async () => {
    setIsLoading(true)
    setError("")
    setSuccess(false)

    try {
      // Find user by email
      const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
      if (!user) {
        throw new Error("User not found. Please check the email address.")
      }

      const response = await fetch(`/api/files/${file.id}/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          ...permissions,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to share file")
      }

      setSuccess(true)
      setEmail("")
      fetchSharedUsers()
    } catch (error) {
      setError(error.message || "An error occurred")
      console.error("Share error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveAccess = async (userId: string) => {
    try {
      const response = await fetch(`/api/files/${file.id}/share/${userId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to remove access")
      }

      fetchSharedUsers()
    } catch (error) {
      console.error("Remove access error:", error)
      alert("Failed to remove access")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle>Share "{file?.fileName}"</DialogTitle>
          <DialogDescription>Share this file with other users by email</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="bg-green-50 text-green-800">
              <AlertDescription>File shared successfully!</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">User</Label>
            <div className="relative">
              <Input
                id="email"
                placeholder="Type email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                list="users-list"
              />
              <datalist id="users-list">
                {users.map((user) => (
                  <option key={user.id} value={user.email}>
                    {user.name}
                  </option>
                ))}
              </datalist>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Permissions</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="canView"
                  checked={permissions.canView}
                  onCheckedChange={(checked) => setPermissions({ ...permissions, canView: !!checked })}
                />
                <Label htmlFor="canView">Can view</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="canEdit"
                  checked={permissions.canEdit}
                  onCheckedChange={(checked) => setPermissions({ ...permissions, canEdit: !!checked })}
                />
                <Label htmlFor="canEdit">Can edit</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="canUpload"
                  checked={permissions.canUpload}
                  onCheckedChange={(checked) => setPermissions({ ...permissions, canUpload: !!checked })}
                />
                <Label htmlFor="canUpload">Can upload new versions</Label>
              </div>
            </div>
          </div>

          {sharedUsers.length > 0 && (
            <div className="space-y-2">
              <Label>Currently shared with</Label>
              <div className="space-y-2 rounded-md border p-2 max-h-[30vh] overflow-y-auto">
                {sharedUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{user.userName}</p>
                      <p className="text-xs text-muted-foreground">{user.userEmail}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveAccess(user.userId)}>
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleShare} disabled={isLoading || !email} className="w-full sm:w-auto">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Share
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
