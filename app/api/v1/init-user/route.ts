import { NextResponse } from "next/server"
import { mongoDB } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { name, email, avatar } = await req.json();

    // Validate input
    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: "Name and Email are required." },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format." },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const { db } = await mongoDB()
    const users = db.collection("users")

    // Check if user already exists by email
    const existingUser = await users.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User with this email already exists." },
        { status: 409 } // Conflict
      )
    }

    // Create new user document
    const newUser = {
      name,
      email,
      avatar: avatar || null,
      role: "admin",
      createdAt: new Date(),
      departments: [],
      employees: [],
      tasks: []
    }

    // Insert user into MongoDB
    const result = await users.insertOne(newUser)

    return NextResponse.json(
      {
        success: true,
        message: "User added successfully.",
        data: { _id: result.insertedId, ...newUser },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("❌ Error adding user:", error)
    return NextResponse.json(
      { success: false, message: "Internal Server Error", error: error.message },
      { status: 500 }
    )
  }
}
