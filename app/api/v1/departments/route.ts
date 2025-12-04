import { NextRequest, NextResponse } from "next/server";
import { supabase, getUserByEmail } from "@/lib/supabase";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    const authUser = await currentUser();
    const email = authUser?.primaryEmailAddress?.emailAddress;
    if (!email) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const user = await getUserByEmail(email);
    if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    const { data: departments, error } = await supabase
      .from("departments")
      .select("*")
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      count: departments?.length || 0,
      data: departments || [],
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await currentUser();
    const email = authUser?.primaryEmailAddress?.emailAddress;
    if (!email) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, type, description, professionalDetails } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, message: "Department name required" }, { status: 400 });
    }

    const user = await getUserByEmail(email);
    if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    const { data: newDepartment, error } = await supabase
      .from("departments")
      .insert([
        {
          user_id: user.id,
          name: name.trim(),
          type: type || "General",
          description: description || "",
          professional_details: professionalDetails || "",
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Department created", data: newDepartment }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authUser = await currentUser();
    const email = authUser?.primaryEmailAddress?.emailAddress;
    if (!email) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { departmentId, name, type, description, professionalDetails } = body;
    
    if (!departmentId) return NextResponse.json({ success: false, message: "Department ID required" }, { status: 400 });
    if (!name || !name.trim()) return NextResponse.json({ success: false, message: "Department name required" }, { status: 400 });

    const user = await getUserByEmail(email);
    if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    const { data: updatedDepartment, error } = await supabase
      .from("departments")
      .update({
        name: name.trim(),
        type,
        description,
        professional_details: professionalDetails,
        updated_at: new Date().toISOString(),
      })
      .eq("id", departmentId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Department updated", data: updatedDepartment });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authUser = await currentUser();
    const email = authUser?.primaryEmailAddress?.emailAddress;
    if (!email) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get("id");
    if (!departmentId) return NextResponse.json({ success: false, message: "Department ID required" }, { status: 400 });

    const user = await getUserByEmail(email);
    if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    const { error } = await supabase
      .from("departments")
      .delete()
      .eq("id", departmentId)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Department deleted" });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
