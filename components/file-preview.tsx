"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Download, ExternalLink, FileText, ImageIcon, FileCode, Film, Music, File } from "lucide-react"
import Image from "next/image"
import { formatFileSize } from "@/lib/utils"

interface FilePreviewProps {
  file: any
  onClose: () => void
}

export function FilePreview({ file, onClose }: FilePreviewProps) {
  const [loading, setLoading] = useState(true)
  const [previewContent, setPreviewContent] = useState<string | null>(null)
  const [previewError, setPreviewError] = useState<string | null>(null)

  useEffect(() => {
    if (!file) return

    const loadPreview = async () => {
      setLoading(true)
      setPreviewError(null)

      try {
        if (isTextFile(file.contentType)) {
          const response = await fetch(file.blobUrl)
          const text = await response.text()
          setPreviewContent(text)
        }
      } catch (error) {
        console.error("Error loading preview:", error)
        setPreviewError("Failed to load preview content")
      } finally {
        setLoading(false)
      }
    }

    loadPreview()
  }, [file])

  const isImageFile = (contentType: string) => {
    return contentType.startsWith("image/")
  }

  const isPdfFile = (contentType: string) => {
    return contentType === "application/pdf"
  }

  const isTextFile = (contentType: string) => {
    return (
      contentType.startsWith("text/") ||
      contentType === "application/json" ||
      contentType === "application/xml" ||
      contentType === "application/javascript"
    )
  }

  const isVideoFile = (contentType: string) => {
    return contentType.startsWith("video/")
  }

  const isAudioFile = (contentType: string) => {
    return contentType.startsWith("audio/")
  }

  const getFileIcon = () => {
    if (isImageFile(file.contentType)) return <ImageIcon className="h-12 w-12 text-primary" />
    if (isPdfFile(file.contentType)) return <FileText className="h-12 w-12 text-red-500" />
    if (isTextFile(file.contentType)) return <FileCode className="h-12 w-12 text-blue-500" />
    if (isVideoFile(file.contentType)) return <Film className="h-12 w-12 text-purple-500" />
    if (isAudioFile(file.contentType)) return <Music className="h-12 w-12 text-green-500" />
    return <File className="h-12 w-12 text-gray-500" />
  }

  const renderPreview = () => {
    if (loading) {
      return (
        <div className="flex h-96 items-center justify-center">
          <Skeleton className="h-full w-full" />
        </div>
      )
    }

    if (previewError) {
      return (
        <div className="flex h-96 flex-col items-center justify-center gap-4 text-center">
          <div className="text-red-500">{previewError}</div>
          <Button onClick={() => window.open(file.blobUrl, "_blank")}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Open in new tab
          </Button>
        </div>
      )
    }

    if (isImageFile(file.contentType)) {
      return (
        <div className="flex h-96 items-center justify-center overflow-hidden">
          <Image
            src={file.blobUrl || "/placeholder.svg"}
            alt={file.fileName}
            className="max-h-full max-w-full object-contain"
            width={800}
            height={600}
          />
        </div>
      )
    }

    if (isPdfFile(file.contentType)) {
      return (
        <div className="h-96">
          <iframe src={`${file.blobUrl}#view=FitH`} className="h-full w-full" title={file.fileName} />
        </div>
      )
    }

    if (isTextFile(file.contentType) && previewContent) {
      return (
        <div className="h-96 overflow-auto">
          <pre className="whitespace-pre-wrap break-words p-4 text-sm">{previewContent}</pre>
        </div>
      )
    }

    if (isVideoFile(file.contentType)) {
      return (
        <div className="flex h-96 items-center justify-center">
          <video controls className="max-h-full max-w-full">
            <source src={file.blobUrl} type={file.contentType} />
            Your browser does not support the video tag.
          </video>
        </div>
      )
    }

    if (isAudioFile(file.contentType)) {
      return (
        <div className="flex h-96 flex-col items-center justify-center gap-4">
          <div className="text-6xl">{getFileIcon()}</div>
          <audio controls>
            <source src={file.blobUrl} type={file.contentType} />
            Your browser does not support the audio tag.
          </audio>
        </div>
      )
    }

    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <div className="text-6xl">{getFileIcon()}</div>
        <div className="text-center">
          <p className="mb-2 text-lg font-medium">Preview not available</p>
          <p className="text-sm text-muted-foreground">This file type cannot be previewed in the browser.</p>
        </div>
        <Button onClick={() => window.open(file.blobUrl, "_blank")}>
          <ExternalLink className="mr-2 h-4 w-4" />
          Open in new tab
        </Button>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-4xl">
      <Tabs defaultValue="preview">
        <div className="flex items-center justify-between border-b px-4 py-2">
          <div className="flex items-center gap-2">
            {getFileIcon()}
            <div>
              <h3 className="text-lg font-medium">{file.fileName}</h3>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(file.size)} • {file.contentType}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TabsList>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
            <Button variant="outline" onClick={() => window.open(file.blobUrl, "_blank")}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <span className="sr-only">Close</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </Button>
          </div>
        </div>
        <CardContent className="p-0">
          <TabsContent value="preview" className="mt-0">
            {renderPreview()}
          </TabsContent>
          <TabsContent value="details" className="mt-0">
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <h4 className="mb-1 text-sm font-medium">File Name</h4>
                  <p className="text-sm">{file.fileName}</p>
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-medium">Type</h4>
                  <p className="text-sm">{file.contentType}</p>
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-medium">Size</h4>
                  <p className="text-sm">{formatFileSize(file.size)}</p>
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-medium">Owner</h4>
                  <p className="text-sm">{file.ownerName}</p>
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-medium">Uploaded</h4>
                  <p className="text-sm">{new Date(file.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-medium">Last Modified</h4>
                  <p className="text-sm">{new Date(file.updatedAt).toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-medium">Access Level</h4>
                  <p className="text-sm">{file.accessLevel}</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  )
}
