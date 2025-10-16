// lib/db.ts
import { MongoClient, Db } from "mongodb"

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017"
const dbName = process.env.MONGODB_DB || "one-manage"

// ⚡ Create a fresh MongoDB connection each time
export async function mongoDB() {
  if (!uri) {
    throw new Error("❌ Please define the MONGODB_URI environment variable inside .env.local")
  }

  const client = new MongoClient(uri)
  await client.connect()
  const db = client.db(dbName)

  console.log(`✅ Connected to MongoDB: ${dbName}`)

  return { client, db }
}

// 🧩 Generic helper for collection access
export async function getCollection<T = any>(collectionName: string) {
  const { db } = await mongoDB()
  return db.collection<T>(collectionName)
}

// 🧠 Example CRUD utilities
export async function fetchAll(collectionName: string) {
  const collection = await getCollection(collectionName)
  const result = await collection.find({}).toArray()
  return result
}

export async function insertOne(collectionName: string, data: any) {
  const collection = await getCollection(collectionName)
  const result = await collection.insertOne(data)
  return result
}

export async function findOne(collectionName: string, query: any) {
  const collection = await getCollection(collectionName)
  const result = await collection.findOne(query)
  return result
}

export async function updateOne(collectionName: string, filter: any, update: any) {
  const collection = await getCollection(collectionName)
  const result = await collection.updateOne(filter, { $set: update })
  return result
}

export async function deleteOne(collectionName: string, filter: any) {
  const collection = await getCollection(collectionName)
  const result = await collection.deleteOne(filter)
  return result
}
