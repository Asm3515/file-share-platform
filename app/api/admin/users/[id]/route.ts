import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { UserRole } from "@/lib/models"

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = params.id

    // Prevent deleting yourself
    if (userId === session.user.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    // Check if user exists
    const user = await db.collection("users").findOne({
      _id: new ObjectId(userId),
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Delete user
    await db.collection("users").deleteOne({
      _id: new ObjectId(userId),
    })

    // Delete user's file access entries
    await db.collection("fileAccess").deleteMany({
      userId: new ObjectId(userId),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json({ error: "An error occurred while deleting the user" }, { status: 500 })
  }
}
