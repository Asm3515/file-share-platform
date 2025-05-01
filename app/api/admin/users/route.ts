import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import clientPromise from "@/lib/mongodb"
import { UserRole } from "@/lib/models"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()

    const users = await db.collection("users").find({}).project({ password: 0 }).toArray()

    const formattedUsers = users.map((user) => ({
      id: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      createdAt: user.createdAt,
    }))

    return NextResponse.json(formattedUsers)
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json({ error: "An error occurred while fetching users" }, { status: 500 })
  }
}
