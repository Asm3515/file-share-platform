"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Download, MoreVertical, Trash2, Share2, Globe, Lock, Users, Eye } from "lucide-react"
import { ShareDialog } from "./share-dialog"
import { AccessLevelDialog } from "./access-level-dialog"
import { PreviewDialog } from "./preview-dialog"
import { formatFileSize } from "@/lib/utils"
import { AccessLevel } from "@/lib/models"

interface FileListProps {
  files: any[]
  onDelete: () => void
  showOwner?: boolean
  isLoading?: boolean
}

export function FileList({ files, onDelete, showOwner = true, isLoading = false }: FileListProps) {
  const { data: session } = useSession()
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [accessLevelDialogOpen, setAccessLevelDialogOpen] = useState(false)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)

  const handleDownload = async (fileId: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}/download`)
      if (!response.ok) {
        throw new Error("Failed to get download URL")
      }
      const url = await response.json()
      window.open(url, "_blank")
    } catch (error) {
      console.error("Download error:", error)
      alert("Failed to download file")
    }
  }

  const handleDelete = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) {
      return
    }

    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error("Failed to delete file")
      }
      onDelete()
    } catch (error) {
      console.error("Delete error:", error)
      alert("Failed to delete file")
    }
  }

  const handleShare = (file: any) => {
    setSelectedFile(file)
    setShareDialogOpen(true)
  }

  const handleAccessLevel = (file: any) => {
    setSelectedFile(file)
    setAccessLevelDialogOpen(true)
  }

  const handlePreview = (file: any) => {
    setSelectedFile(file)
    setPreviewDialogOpen(true)
  }

  const getAccessLevelIcon = (accessLevel: string) => {
    switch (accessLevel) {
      case AccessLevel.PUBLIC:
        return <Globe className="h-4 w-4" />
      case AccessLevel.GATED:
        return <Users className="h-4 w-4" />
      case AccessLevel.PRIVATE:
        return <Lock className="h-4 w-4" />
      default:
        return <Lock className="h-4 w-4" />
    }
  }

  const getAccessLevelColor = (accessLevel: string) => {
    switch (accessLevel) {
      case AccessLevel.PUBLIC:
        return "bg-green-100 text-green-800"
      case AccessLevel.GATED:
        return "bg-blue-100 text-blue-800"
      case AccessLevel.PRIVATE:
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getFileTypeIcon = (contentType: string) => {
    if (contentType.startsWith("image/")) {
      return "📷"
    } else if (contentType.startsWith("video/")) {
      return "🎬"
    } else if (contentType.startsWith("audio/")) {
      return "🎵"
    } else if (contentType === "application/pdf") {
      return "📄"
    } else if (
      contentType.startsWith("text/") ||
      contentType === "application/json" ||
      contentType === "application/xml"
    ) {
      return "📝"
    } else {
      return "📁"
    }
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {files.map((file) => (
          <Card key={file.id} className="group overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-xl">{getFileTypeIcon(file.contentType)}</span>
                    <span className="line-clamp-1">{file.fileName}</span>
                  </CardTitle>
                  <CardDescription>
                    {formatFileSize(file.size)} • {file.contentType}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handlePreview(file)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownload(file.id)}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                    {session?.user?.id === file.ownerId && (
                      <>
                        <DropdownMenuItem onClick={() => handleShare(file)}>
                          <Share2 className="mr-2 h-4 w-4" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAccessLevel(file)}>
                          {getAccessLevelIcon(file.accessLevel)}
                          <span className="ml-2">Change access</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(file.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="pb-2 cursor-pointer" onClick={() => handlePreview(file)}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <Badge variant="outline" className={getAccessLevelColor(file.accessLevel)}>
                  {getAccessLevelIcon(file.accessLevel)}
                  <span className="ml-1">{file.accessLevel}</span>
                </Badge>
                {showOwner && <span className="text-sm text-muted-foreground">Owned by {file.ownerName}</span>}
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <p className="text-xs text-muted-foreground">
                Uploaded {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}
              </p>
              <div className="flex ml-auto gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex"
                  onClick={() => handlePreview(file)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="sm:hidden"
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePreview(file)
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {selectedFile && (
        <>
          <ShareDialog file={selectedFile} open={shareDialogOpen} onOpenChange={setShareDialogOpen} />
          <AccessLevelDialog
            file={selectedFile}
            open={accessLevelDialogOpen}
            onOpenChange={setAccessLevelDialogOpen}
            onUpdate={onDelete}
          />
          <PreviewDialog file={selectedFile} open={previewDialogOpen} onOpenChange={setPreviewDialogOpen} />
        </>
      )}
    </>
  )
}
