import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { mongoDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress;

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email not found." },
        { status: 400 }
      );
    }

    const { db } = await mongoDB();
    const users = db.collection("users");

    // Fetch user with only departments
    const dbUser = await users.findOne(
      { email },
      { projection: { departments: 1, _id: 0 } }
    );

    if (!dbUser) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    // 🔹 Get query params
    const { searchParams } = new URL(req.url);
    const depId = searchParams.get("id"); // ?id=departmentId

    let filteredDepartments = dbUser.departments || [];

    if (depId) {
      // Filter departments by _id
      filteredDepartments = filteredDepartments.filter(
        (dep: any) => dep._id === depId
      );
    }

    return NextResponse.json({
      success: true,
      count: filteredDepartments.length,
      data: filteredDepartments,
    });
  } catch (error: any) {
    console.error("❌ Error fetching departments:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
