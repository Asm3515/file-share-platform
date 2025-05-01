import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()

    // Get all users except the current user
    const users = await db
      .collection("users")
      .find({ _id: { $ne: new ObjectId(session.user.id) } })
      .project({ password: 0 }) // Exclude password
      .toArray()

    // Format the response
    const formattedUsers = users.map((user) => ({
      id: user._id.toString(),
      name: user.fullName,
      email: user.email,
      role: user.role,
    }))

    return NextResponse.json(formattedUsers)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
