import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(req: Request, { params }: { params: { id: string } }) {
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

    // Check if user has access to the file
    const isOwner = file.ownerId.toString() === session.user.id
    const isPublic = file.accessLevel === "PUBLIC"

    let hasAccess = isOwner || isPublic

    if (!hasAccess && file.accessLevel === "GATED") {
      // Check if user has been granted access
      const fileAccess = await db.collection("fileAccess").findOne({
        fileId: new ObjectId(fileId),
        userId: new ObjectId(session.user.id),
        canView: true,
      })

      hasAccess = !!fileAccess
    }

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Log the download
    await db.collection("accessLogs").insertOne({
      fileId: new ObjectId(fileId),
      userId: new ObjectId(session.user.id),
      action: "DOWNLOAD",
      ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      userAgent: req.headers.get("user-agent") || "unknown",
      timestamp: new Date(),
    })

    // Return the blob URL
    return NextResponse.json(file.blobUrl)
  } catch (error) {
    console.error("Download file error:", error)
    return NextResponse.json({ error: "An error occurred while downloading the file" }, { status: 500 })
  }
}
