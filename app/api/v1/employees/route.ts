import { NextRequest, NextResponse } from "next/server";
import { supabase, getUserByEmail } from "@/lib/supabase";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    const authUser = await currentUser();
    const email = authUser?.primaryEmailAddress?.emailAddress;
    if (!email)
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const user = await getUserByEmail(email);
    if (!user)
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    const { data: employees, error } = await supabase
      .from("employees")
      .select("*")
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: employees || [],
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await currentUser();
    const email = authUser?.primaryEmailAddress?.emailAddress;
    if (!email)
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { employee } = await req.json();
    if (!employee?.email)
      return NextResponse.json(
        { success: false, message: "Employee email required" },
        { status: 400 }
      );

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(employee.email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      );
    }

    const user = await getUserByEmail(email);
    if (!user)
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    const { data: existing } = await supabase
      .from("employees")
      .select("id")
      .eq("user_id", user.id)
      .eq("email", employee.email)
      .single();

    if (existing) {
      return NextResponse.json({
        success: false,
        message: "Employee with this email already exists",
      }, { status: 409 });
    }

    const { data: newEmployee, error } = await supabase
      .from("employees")
      .insert([{
        user_id: user.id,
        department_id: employee.department_id || null,
        name: employee.name || "",
        email: employee.email,
        position: employee.position || null,
        phone: employee.phone || null,
        salary: employee.salary ?? 0, // ✅ ADD THIS
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Employee added successfully",
      data: newEmployee,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authUser = await currentUser();
    const email = authUser?.primaryEmailAddress?.emailAddress;
    if (!email)
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { employee } = await req.json();
    if (!employee?.email || !employee?.id)
      return NextResponse.json({ success: false, message: "Employee email and ID required" }, { status: 400 });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(employee.email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      );
    }

    const user = await getUserByEmail(email);
    if (!user)
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    const { data: updatedEmployee, error } = await supabase
      .from("employees")
      .update({
        name: employee.name || "",
        email: employee.email,
        position: employee.position || null,
        phone: employee.phone || null,
        department_id: employee.department_id || null,
        salary: employee.salary ?? 0, 
        updated_at: new Date().toISOString(),
        date_of_birth: employee.date_of_birth,
        gender: employee.gender
      })
      .eq("id", employee.id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Employee updated successfully",
      data: updatedEmployee,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authUser = await currentUser();
    const email = authUser?.primaryEmailAddress?.emailAddress;
    if (!email)
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("id");
    if (!employeeId)
      return NextResponse.json({ success: false, message: "Employee ID required" }, { status: 400 });

    const user = await getUserByEmail(email);
    if (!user)
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    const { error } = await supabase
      .from("employees")
      .delete()
      .eq("id", employeeId)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Employee deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
