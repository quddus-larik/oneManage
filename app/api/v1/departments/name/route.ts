import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { supabase, getUserByEmail } from "@/lib/supabase";

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

    const dbUser = await getUserByEmail(email);
    if (!dbUser) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const depId = searchParams.get("id");

    let query = supabase
      .from("departments")
      .select("*")
      .eq("user_id", dbUser.id);

    if (depId) {
      query = query.eq("id", depId);
    }

    const { data: departments, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      count: departments?.length || 0,
      data: departments || [],
    });
  } catch (error: any) {
    console.error("❌ Error fetching departments:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
