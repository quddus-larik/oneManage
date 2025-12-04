import { NextResponse } from "next/server"
import { getUserByEmail, createUser } from "@/lib/supabase"

export async function POST(req: Request) {
  try {
    const { name, email, avatar } = await req.json();

    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: "Name and Email are required." },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format." },
        { status: 400 }
      );
    }

    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { success: true, message: "User already exists.", data: existingUser },
        { status: 200 }
      )
    }

    const newUser = await createUser(name, email, avatar || null)

    return NextResponse.json(
      {
        success: true,
        message: "User added successfully.",
        data: newUser,
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
