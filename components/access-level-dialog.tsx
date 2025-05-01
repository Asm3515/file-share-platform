"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2, Globe, Users, Lock } from "lucide-react"
import { AccessLevel } from "@/lib/models"

interface AccessLevelDialogProps {
  file: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: () => void
}

export function AccessLevelDialog({ file, open, onOpenChange, onUpdate }: AccessLevelDialogProps) {
  const [accessLevel, setAccessLevel] = useState(file?.accessLevel || AccessLevel.PRIVATE)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleUpdate = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/files/${file.id}/access`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessLevel,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update access level")
      }

      onUpdate()
      onOpenChange(false)
    } catch (error) {
      setError(error.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change access level</DialogTitle>
          <DialogDescription>Set who can access "{file?.fileName}"</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <RadioGroup value={accessLevel} onValueChange={setAccessLevel} className="space-y-3">
            <div className="flex items-start space-x-3 rounded-md border p-3">
              <RadioGroupItem value={AccessLevel.PRIVATE} id="private" />
              <div className="space-y-1">
                <div className="flex items-center">
                  <Label htmlFor="private" className="font-medium">
                    <Lock className="mr-2 inline-block h-4 w-4" />
                    Private
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">Only you can access this file</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 rounded-md border p-3">
              <RadioGroupItem value={AccessLevel.GATED} id="gated" />
              <div className="space-y-1">
                <div className="flex items-center">
                  <Label htmlFor="gated" className="font-medium">
                    <Users className="mr-2 inline-block h-4 w-4" />
                    Gated
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">Only specific users you share with can access this file</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 rounded-md border p-3">
              <RadioGroupItem value={AccessLevel.PUBLIC} id="public" />
              <div className="space-y-1">
                <div className="flex items-center">
                  <Label htmlFor="public" className="font-medium">
                    <Globe className="mr-2 inline-block h-4 w-4" />
                    Public
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">Anyone with an account can access this file</p>
              </div>
            </div>
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button onClick={handleUpdate} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
