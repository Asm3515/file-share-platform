"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { FileList } from "@/components/file-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw } from "lucide-react"

export default function PublicPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [files, setFiles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

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

  const fetchFiles = async () => {
    setIsLoading(true)
    setError("")
    try {
      const response = await fetch("/api/files/public")
      if (!response.ok) {
        throw new Error("Failed to fetch files")
      }
      const data = await response.json()
      setFiles(data)
    } catch (error) {
      setError("Error loading files. Please try again.")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading") {
    return <div className="flex h-full items-center justify-center">Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Public Files</h1>
        <Button variant="outline" onClick={fetchFiles} disabled={isLoading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-red-600">{error}</CardContent>
        </Card>
      )}

      {!error && files.length === 0 && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>No public files</CardTitle>
            <CardDescription>There are no public files available at the moment.</CardDescription>
          </CardHeader>
        </Card>
      )}

      {files.length > 0 && <FileList files={files} onDelete={fetchFiles} showOwner={true} isLoading={isLoading} />}
    </div>
  )
}
