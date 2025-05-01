import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const fileId = params.id
    const { userId, canView = true, canEdit = false, canUpload = false } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    // Get the file
    const file = await db.collection("files").findOne({
      _id: new ObjectId(fileId),
    })

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // Check if user is owner
    if (file.ownerId.toString() !== session.user.id) {
      return NextResponse.json({ error: "You do not have permission to share this file" }, { status: 403 })
    }

    // Check if target user exists
    const targetUser = await db.collection("users").findOne({
      _id: new ObjectId(userId),
    })

    if (!targetUser) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 })
    }

    // Check if file is already shared with user
    const existingAccess = await db.collection("fileAccess").findOne({
      fileId: new ObjectId(fileId),
      userId: new ObjectId(userId),
    })

    if (existingAccess) {
      // Update existing access
      await db.collection("fileAccess").updateOne(
        {
          fileId: new ObjectId(fileId),
          userId: new ObjectId(userId),
        },
        {
          $set: {
            canView,
            canEdit,
            canUpload,
            updatedAt: new Date(),
          },
        },
      )
    } else {
      // Create new access
      await db.collection("fileAccess").insertOne({
        fileId: new ObjectId(fileId),
        userId: new ObjectId(userId),
        canView,
        canEdit,
        canUpload,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    // Log the share action
    await db.collection("accessLogs").insertOne({
      fileId: new ObjectId(fileId),
      userId: new ObjectId(session.user.id),
      action: "SHARE",
      timestamp: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Share file error:", error)
    return NextResponse.json({ error: "An error occurred while sharing the file" }, { status: 500 })
  }
}
