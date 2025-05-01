"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileList } from "@/components/file-list"
import { UserRole } from "@/lib/models"
import { Loader2, Settings } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [myFiles, setMyFiles] = useState([])
  const [sharedFiles, setSharedFiles] = useState([])
  const [isLoadingMyFiles, setIsLoadingMyFiles] = useState(true)
  const [isLoadingSharedFiles, setIsLoadingSharedFiles] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      fetchMyFiles()
      fetchSharedFiles()
    }
  }, [status])

  const fetchMyFiles = async () => {
    setIsLoadingMyFiles(true)
    setError("")
    try {
      const response = await fetch("/api/files")
      if (!response.ok) {
        throw new Error("Failed to fetch files")
      }
      const data = await response.json()
      setMyFiles(data)
    } catch (error) {
      setError("Error loading files. Please try again.")
      console.error(error)
    } finally {
      setIsLoadingMyFiles(false)
    }
  }

  const fetchSharedFiles = async () => {
    setIsLoadingSharedFiles(true)
    try {
      const response = await fetch("/api/files/shared")
      if (!response.ok) {
        throw new Error("Failed to fetch shared files")
      }
      const data = await response.json()
      setSharedFiles(data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoadingSharedFiles(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">Profile</h1>
        <Button variant="outline" asChild>
          <Link href="/settings">
            <Settings className="mr-2 h-4 w-4" />
            Edit Settings
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col items-center gap-4 md:flex-row">
            <Avatar className="h-20 w-20">
              <AvatarImage src={`https://avatar.vercel.sh/${session?.user?.email}`} alt={session?.user?.name || ""} />
              <AvatarFallback className="text-lg">{getInitials(session?.user?.name || "User")}</AvatarFallback>
            </Avatar>
            <div className="space-y-1 text-center md:text-left">
              <CardTitle className="text-2xl">{session?.user?.name}</CardTitle>
              <CardDescription className="text-base">{session?.user?.email}</CardDescription>
              <div className="flex justify-center gap-2 md:justify-start">
                <Badge
                  variant="outline"
                  className={
                    session?.user?.role === UserRole.ADMIN
                      ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  }
                >
                  {session?.user?.role}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="my-files" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="my-files">My Files</TabsTrigger>
              <TabsTrigger value="shared-files">Shared with me</TabsTrigger>
            </TabsList>
            <TabsContent value="my-files" className="mt-4">
              {myFiles.length > 0 ? (
                <FileList files={myFiles} onDelete={fetchMyFiles} showOwner={false} isLoading={isLoadingMyFiles} />
              ) : (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <h3 className="mb-2 text-lg font-medium">No files yet</h3>
                  <p className="mb-4 text-sm text-muted-foreground">Upload your first file to get started</p>
                  <Button asChild>
                    <Link href="/upload">Upload a file</Link>
                  </Button>
                </div>
              )}
            </TabsContent>
            <TabsContent value="shared-files" className="mt-4">
              {sharedFiles.length > 0 ? (
                <FileList
                  files={sharedFiles}
                  onDelete={fetchSharedFiles}
                  showOwner={true}
                  isLoading={isLoadingSharedFiles}
                />
              ) : (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <h3 className="mb-2 text-lg font-medium">No shared files</h3>
                  <p className="text-sm text-muted-foreground">No one has shared any files with you yet</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
