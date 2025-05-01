import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { AccessLevel } from "@/lib/models"

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const fileId = params.id
    const { accessLevel } = await req.json()

    if (!Object.values(AccessLevel).includes(accessLevel)) {
      return NextResponse.json({ error: "Invalid access level" }, { status: 400 })
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
      return NextResponse.json({ error: "You do not have permission to update this file" }, { status: 403 })
    }

    // Update access level
    await db.collection("files").updateOne(
      { _id: new ObjectId(fileId) },
      {
        $set: {
          accessLevel,
          updatedAt: new Date(),
        },
      },
    )

    // Log the update
    await db.collection("accessLogs").insertOne({
      fileId: new ObjectId(fileId),
      userId: new ObjectId(session.user.id),
      action: "UPDATE_ACCESS",
      timestamp: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update file access error:", error)
    return NextResponse.json({ error: "An error occurred while updating file access" }, { status: 500 })
  }
}
