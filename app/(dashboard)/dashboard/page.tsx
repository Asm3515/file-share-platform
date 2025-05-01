"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { FileList } from "@/components/file-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Upload, RefreshCw, Search } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [files, setFiles] = useState([])
  const [filteredFiles, setFilteredFiles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      fetchFiles()
    }
  }, [status])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredFiles(files)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = files.filter(
        (file) => file.fileName.toLowerCase().includes(query) || file.contentType.toLowerCase().includes(query),
      )
      setFilteredFiles(filtered)
    }
  }, [searchQuery, files])

  const fetchFiles = async () => {
    setIsLoading(true)
    setError("")
    try {
      const response = await fetch("/api/files")
      if (!response.ok) {
        throw new Error("Failed to fetch files")
      }
      const data = await response.json()
      setFiles(data)
      setFilteredFiles(data)
    } catch (error) {
      setError("Error loading files. Please try again.")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  if (status === "loading") {
    return <div className="flex h-full items-center justify-center">Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">My Files</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchFiles} disabled={isLoading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/upload">
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Link>
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search files by name or type..."
          className="pl-10"
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-red-600">{error}</CardContent>
        </Card>
      )}

      {!error && filteredFiles.length === 0 && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>{searchQuery ? "No matching files found" : "No files yet"}</CardTitle>
            <CardDescription>
              {searchQuery ? "Try a different search term" : "Upload your first file to get started."}
            </CardDescription>
          </CardHeader>
          {!searchQuery && (
            <CardContent>
              <Button asChild>
                <Link href="/upload">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload a file
                </Link>
              </Button>
            </CardContent>
          )}
        </Card>
      )}

      {filteredFiles.length > 0 && (
        <FileList files={filteredFiles} onDelete={fetchFiles} showOwner={false} isLoading={isLoading} />
      )}
    </div>
  )
}
