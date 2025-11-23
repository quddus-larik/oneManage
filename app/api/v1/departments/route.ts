import { NextRequest, NextResponse } from "next/server";
import { mongoDB } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    const authUser = await currentUser();
    const email = authUser?.primaryEmailAddress?.emailAddress;
    if (!email) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { db } = await mongoDB();
    const users = db.collection("users");

    const dbUser = await users.findOne(
      { email },
      { projection: { departments: 1, _id: 0 } }
    );

    return NextResponse.json({
      success: true,
      count: dbUser?.departments?.length || 0,
      data: dbUser?.departments || [],
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
    const { name, type, description, professionalDetails, employees } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, message: "Department name required" }, { status: 400 });
    }

    const { db } = await mongoDB();
    const users = db.collection("users");

    const userDoc = await users.findOne({ email });
    if (!userDoc) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });


    const newDepartment = {
      _id: crypto.randomUUID(),
      name: name.trim(),
      type: type || "General",
      description: description || "",
      professionalDetails: professionalDetails || "",
      employees: employees || [],
      createdAt: new Date(),
    };

    await users.updateOne(
      { email },
      { $push: { departments: newDepartment as any }, $set: { updatedAt: new Date() } }
    );

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
    const { departmentId, name, type, description, professionalDetails, employeeEmails } = body;
    
    if (!departmentId) return NextResponse.json({ success: false, message: "Department ID required" }, { status: 400 });
    if (!name || !name.trim()) return NextResponse.json({ success: false, message: "Department name required" }, { status: 400 });
    if (!employeeEmails) return NextResponse.json({ success: false, message: "Employee emails required" }, { status: 400 });

    const { db } = await mongoDB();
    const users = db.collection("users");

    const userDoc = await users.findOne({ email });
    if (!userDoc) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    
    const selectedEmployees = (userDoc.employees || []).filter((emp: any) =>
      employeeEmails.includes(emp.email)
    ).map((emp: any) => ({ ...emp, addedAt: new Date(), updatedAt: new Date(), department: departmentId }));

    const updatedDepartments = (userDoc.departments || []).map((dept: any) =>
      dept._id === departmentId
        ? { ...dept, name: name.trim(), type, description, professionalDetails, employees: selectedEmployees }
        : dept
    );

    await users.updateOne({ email }, { $set: { departments: updatedDepartments, updatedAt: new Date() } });

    return NextResponse.json({ success: true, message: "Department updated", data: updatedDepartments.find((d: any) => d._id === departmentId) });
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

    const { db } = await mongoDB();
    const users = db.collection("users");

    const userDoc = await users.findOne({ email });
    if (!userDoc) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    const updatedDepartments = (userDoc.departments || []).filter((dept: any) => dept._id !== departmentId);

    await users.updateOne({ email }, { $set: { departments: updatedDepartments, updatedAt: new Date() } });

    return NextResponse.json({ success: true, message: "Department deleted" });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
