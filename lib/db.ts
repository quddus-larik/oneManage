import { MongoClient, Db } from "mongodb"

const uri = process.env.MONGODB_URI as string || "mongodb://localhost:27017"
const dbName = process.env.MONGODB_DB || "one-manage"

if (!uri) {
  throw new Error("❌ Missing MONGODB_URI in environment variables")
}

let client: MongoClient | null = null
let db: Db | null = null

// ✅ Reuse the same connection across hot reloads and requests
export async function mongoDB() {
  if (db && client) return { client, db }

  client = new MongoClient(uri, {
    serverApi: {
      version: "1",
      strict: true,
      deprecationErrors: true,
    },
  })

  await client.connect()
  db = client.db(dbName)

  console.log(`✅ MongoDB connected → ${dbName}`)
  return { client, db }
}

// 🧩 Generic collection accessor
export async function getCollection<T = any>(collectionName: string) {
  const { db } = await mongoDB()
  return db.collection<any>(collectionName)
}

// 🧠 Example CRUD helpers
export async function fetchAll<T = any>(collectionName: string) {
  const collection = await getCollection<T>(collectionName)
  return await collection.find({}).toArray()
}

export async function insertOne<T = any>(collectionName: string, data: T) {
  const collection = await getCollection<T>(collectionName)
  return await collection.insertOne(data)
}

export async function findOne<T = any>(collectionName: string, query: any) {
  const collection = await getCollection<T>(collectionName)
  return await collection.findOne(query)
}

export async function updateOne(collectionName: string, filter: any, update: any) {
  const collection = await getCollection(collectionName)
  return await collection.updateOne(filter, { $set: update })
}

export async function deleteOne(collectionName: string, filter: any) {
  const collection = await getCollection(collectionName)
  return await collection.deleteOne(filter)
}
