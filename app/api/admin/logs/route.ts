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

    const logs = await db.collection("accessLogs").find({}).sort({ timestamp: -1 }).limit(100).toArray()

    // Get file and user info
    const fileIds = logs.map((log) => log.fileId)
    const userIds = logs.filter((log) => log.userId).map((log) => log.userId)

    const files = await db
      .collection("files")
      .find({ _id: { $in: fileIds } })
      .project({ _id: 1, fileName: 1 })
      .toArray()

    const users = await db
      .collection("users")
      .find({ _id: { $in: userIds } })
      .project({ _id: 1, email: 1, fullName: 1 })
      .toArray()

    const filesMap = files.reduce((map, file) => {
      map[file._id.toString()] = file.fileName
      return map
    }, {})

    const usersMap = users.reduce((map, user) => {
      map[user._id.toString()] = user.fullName
      return map
    }, {})

    const formattedLogs = logs.map((log) => ({
      id: log._id.toString(),
      fileId: log.fileId.toString(),
      fileName: filesMap[log.fileId.toString()] || "Unknown",
      userId: log.userId ? log.userId.toString() : null,
      userName: log.userId ? usersMap[log.userId.toString()] || "Unknown" : null,
      action: log.action,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      timestamp: log.timestamp,
    }))

    return NextResponse.json(formattedLogs)
  } catch (error) {
    console.error("Get logs error:", error)
    return NextResponse.json({ error: "An error occurred while fetching logs" }, { status: 500 })
  }
}
