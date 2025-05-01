import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../auth/[...nextauth]/route"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { UserRole } from "@/lib/models"

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = params.id
    const { role } = await req.json()

    if (!Object.values(UserRole).includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
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

    // Update user role
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          role,
          updatedAt: new Date(),
        },
      },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update user role error:", error)
    return NextResponse.json({ error: "An error occurred while updating user role" }, { status: 500 })
  }
}
