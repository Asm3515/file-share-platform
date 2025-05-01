import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { AccessLevel } from "@/lib/models"

export async function GET(req: Request) {
  try {
    const client = await clientPromise
    const db = client.db()

    // Get public files
    const files = await db.collection("files").find({ accessLevel: AccessLevel.PUBLIC }).toArray()

    // Get user info for each file
    const userIds = files.map((file) => file.ownerId)
    const users = await db
      .collection("users")
      .find({ _id: { $in: userIds } })
      .project({ _id: 1, fullName: 1 })
      .toArray()

    const usersMap = users.reduce((map, user) => {
      map[user._id.toString()] = user.fullName
      return map
    }, {})

    const filesWithOwnerNames = files.map((file) => ({
      id: file._id.toString(),
      fileName: file.fileName,
      contentType: file.contentType,
      size: file.size,
      accessLevel: file.accessLevel,
      ownerId: file.ownerId.toString(),
      ownerName: usersMap[file.ownerId.toString()] || "Unknown",
      blobUrl: file.blobUrl,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
    }))

    return NextResponse.json(filesWithOwnerNames)
  } catch (error) {
    console.error("Get public files error:", error)
    return NextResponse.json({ error: "An error occurred while fetching public files" }, { status: 500 })
  }
}
