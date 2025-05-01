import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import clientPromise from "@/lib/mongodb"
import type { AccessLevel } from "@/lib/models"
import { ObjectId } from "mongodb"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    const accessLevelStr = (formData.get("accessLevel") as string) || "PRIVATE"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: "public",
    })

    const client = await clientPromise
    const db = client.db()

    // Save file metadata to MongoDB
    const fileMetadata = {
      fileName: file.name,
      contentType: file.type,
      size: file.size,
      blobUrl: blob.url,
      accessLevel: accessLevelStr as AccessLevel,
      ownerId: new ObjectId(session.user.id),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("files").insertOne(fileMetadata)

    // Log the upload action
    await db.collection("accessLogs").insertOne({
      fileId: result.insertedId,
      userId: new ObjectId(session.user.id),
      action: "UPLOAD",
      timestamp: new Date(),
    })

    return NextResponse.json(
      {
        id: result.insertedId.toString(),
        fileName: file.name,
        contentType: file.type,
        size: file.size,
        accessLevel: accessLevelStr,
        createdAt: new Date(),
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("File upload error:", error)
    return NextResponse.json({ error: "An error occurred during file upload" }, { status: 500 })
  }
}
