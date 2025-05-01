import { NextResponse } from "next/server"
import { del } from "@vercel/blob"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { UserRole } from "@/lib/models"

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const fileId = params.id

    const client = await clientPromise
    const db = client.db()

    // Get the file
    const file = await db.collection("files").findOne({
      _id: new ObjectId(fileId),
    })

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // Check if user is owner or admin
    const isOwner = file.ownerId.toString() === session.user.id
    const isAdmin = session.user.role === UserRole.ADMIN

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "You do not have permission to delete this file" }, { status: 403 })
    }

    // Delete from Vercel Blob
    // Extract the blob URL path from the full URL
    const blobUrlObj = new URL(file.blobUrl)
    const blobPath = blobUrlObj.pathname.substring(1) // Remove leading slash
    await del(blobPath)

    // Delete from MongoDB
    await db.collection("files").deleteOne({
      _id: new ObjectId(fileId),
    })

    // Delete associated file access entries
    await db.collection("fileAccess").deleteMany({
      fileId: new ObjectId(fileId),
    })

    // Log the deletion
    await db.collection("accessLogs").insertOne({
      fileId: new ObjectId(fileId),
      userId: new ObjectId(session.user.id),
      action: "DELETE",
      timestamp: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete file error:", error)
    return NextResponse.json({ error: "An error occurred while deleting the file" }, { status: 500 })
  }
}
