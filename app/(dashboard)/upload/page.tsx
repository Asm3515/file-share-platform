"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Upload, File, X, Loader2, Globe, Users, Lock } from "lucide-react"
import { AccessLevel } from "@/lib/models"
import { formatFileSize } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

export default function UploadPage() {
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [accessLevel, setAccessLevel] = useState<AccessLevel>(AccessLevel.PRIVATE)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const simulateProgress = () => {
    // Simulate upload progress
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 10
      if (progress > 95) {
        progress = 95
        clearInterval(interval)
      }
      setUploadProgress(progress)
    }, 300)
    return interval
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setError("")
    setUploadProgress(0)

    const progressInterval = simulateProgress()

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("accessLevel", accessLevel)

      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Upload failed")
      }

      setUploadProgress(100)
      clearInterval(progressInterval)

      // Wait a moment to show 100% progress
      setTimeout(() => {
        router.push("/dashboard")
      }, 500)
    } catch (error) {
      clearInterval(progressInterval)
      setError(error.message || "An error occurred during upload")
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const clearSelectedFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Upload File</h1>

      <Card>
        <CardHeader>
          <CardTitle>Select a file to upload</CardTitle>
          <CardDescription>Choose a file from your device to upload to the platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div
            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
              isDragging ? "border-primary bg-primary/10" : ""
            } ${selectedFile ? "border-primary bg-primary/5" : "border-gray-300"}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {selectedFile ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center">
                  <File className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(selectedFile.size)} • {selectedFile.type || "Unknown type"}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="mt-2" onClick={clearSelectedFile}>
                  <X className="mr-2 h-4 w-4" />
                  Remove
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-center">
                  <Upload className={`h-8 w-8 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Drag and drop your file here</p>
                  <p className="text-xs text-muted-foreground">Or click to browse from your device</p>
                </div>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => fileInputRef.current?.click()}>
                  Browse files
                </Button>
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label>Access Level</Label>
            <RadioGroup
              value={accessLevel}
              onValueChange={(value) => setAccessLevel(value as AccessLevel)}
              className="space-y-3"
            >
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
                  <p className="text-sm text-muted-foreground">
                    Only specific users you share with can access this file
                  </p>
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

          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Uploading...</span>
                <span className="text-sm text-muted-foreground">{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2 w-full" />
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleUpload} disabled={!selectedFile || isUploading} className="w-full">
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload File
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
