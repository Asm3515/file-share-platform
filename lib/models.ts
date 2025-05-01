import type { ObjectId } from "mongodb"

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

export enum AccessLevel {
  PUBLIC = "PUBLIC",
  GATED = "GATED",
  PRIVATE = "PRIVATE",
}

export interface User {
  _id?: ObjectId
  email: string
  password: string
  fullName: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export interface FileMetadata {
  _id?: ObjectId
  fileName: string
  contentType: string
  size: number
  blobUrl: string
  accessLevel: AccessLevel
  ownerId: ObjectId
  createdAt: Date
  updatedAt: Date
}

export interface FileAccess {
  _id?: ObjectId
  fileId: ObjectId
  userId: ObjectId
  canView: boolean
  canEdit: boolean
  canUpload: boolean
  createdAt: Date
  updatedAt: Date
}

export interface AccessLog {
  _id?: ObjectId
  fileId: ObjectId
  userId?: ObjectId
  action: string
  ipAddress?: string
  userAgent?: string
  timestamp: Date
}
