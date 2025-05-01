import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../auth/[...nextauth]/route"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function DELETE(req: Request, { params }: { params: { id: string; userId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: fileId, userId } = params

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
      return NextResponse.json({ error: "You do not have permission to modify access for this file" }, { status: 403 })
    }

    // Delete file access
    await db.collection("fileAccess").deleteOne({
      fileId: new ObjectId(fileId),
      userId: new ObjectId(userId),
    })

    // Log the removal
    await db.collection("accessLogs").insertOne({
      fileId: new ObjectId(fileId),
      userId: new ObjectId(session.user.id),
      action: "REMOVE_ACCESS",
      timestamp: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Remove file access error:", error)
    return NextResponse.json({ error: "An error occurred while removing file access" }, { status: 500 })
  }
}
