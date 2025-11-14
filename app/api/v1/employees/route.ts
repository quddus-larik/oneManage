import { NextRequest, NextResponse } from "next/server";
import { mongoDB } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    const authUser = await currentUser();
    const email = authUser?.primaryEmailAddress?.emailAddress;
    if (!email)
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { db } = await mongoDB();
    const users = db.collection("users");

    const userDoc = await users.aggregate([
  // 1. Match the document you want to find
  { $match: { email: email } },

  // 2. Project the 'employees' array
  {
    $project: {
      _id: 0, // Exclude the top-level _id

      employees: {
        // Iterate over the 'employees' array
        $map: {
          input: "$employees",
          as: "employee",
          in: {
            // Convert the employee object to an array of { k: key, v: value } objects
            $arrayToObject: {
              $filter: {
                // Input is the array of key/value pairs
                input: { $objectToArray: "$$employee" },
                as: "field",
                // Condition: Keep the field if its key (k) is NOT 'updatedAt' or 'createdAt'
                cond: {
                  $not: {
                    $in: ["$$field.k", ["updatedAt", "addedAt"]]
                  }
                }
              }
            }
          }
        }
      }
    }
  }
]).next(); 

    return NextResponse.json({
      success: true,
      data: userDoc?.employees || [],
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// ✅ ADD employee (no duplication)
export async function POST(req: NextRequest) {
  try {
    const authUser = await currentUser();
    const email = authUser?.primaryEmailAddress?.emailAddress;
    if (!email)
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { employee } = await req.json();
    if (!employee?.email || !employee?.department)
      return NextResponse.json(
        { success: false, message: "Employee email and department required" },
        { status: 400 }
      );

    const { db } = await mongoDB();
    const users = db.collection("users");

    const userDoc = await users.findOne({ email });
    if (!userDoc)
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    const now = new Date();

    // Check if already exists
    const exists = (userDoc.employees || []).some((e: any) => e.email === employee.email);
    if (exists) {
      return NextResponse.json({
        success: false,
        message: "Employee with this email already exists",
      });
    }

    const newEmployee = { ...employee, addedAt: now, updatedAt: now };

    // Add to global employees
    await users.updateOne({ email }, { $push: { employees: newEmployee } });

    // Add to correct department employees
    const deptIndex = userDoc.departments.findIndex((d: any) => d._id === employee.department);
    if (deptIndex !== -1) {
      const deptKey = `departments.${deptIndex}.employees`;
      await users.updateOne({ email }, { $push: { [deptKey]: newEmployee } });
    }

    return NextResponse.json({
      success: true,
      message: "Employee added successfully",
      data: newEmployee,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// ✅ UPDATE employee (no duplication, full sync)
export async function PUT(req: NextRequest) {
  try {
    const authUser = await currentUser();
    const email = authUser?.primaryEmailAddress?.emailAddress;
    if (!email)
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { employee } = await req.json();
    if (!employee?.email)
      return NextResponse.json({ success: false, message: "Employee email required" }, { status: 400 });

    const { db } = await mongoDB();
    const users = db.collection("users");

    const userDoc = await users.findOne({ email });
    if (!userDoc)
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    const now = new Date();

    // Update global employees
    const updatedEmployees = (userDoc.employees || []).map((e: any) =>
      e.email === employee.email ? { ...e, ...employee, updatedAt: now } : e
    );

    // Sync departments: replace employee if matched
    const updatedDepartments = userDoc.departments.map((dept: any) => {
      const updatedDeptEmployees = (dept.employees || []).map((e: any) =>
        e.email === employee.email ? { ...e, ...employee, updatedAt: now } : e
      );
      return { ...dept, employees: updatedDeptEmployees };
    });

    await users.updateOne(
      { email },
      { $set: { employees: updatedEmployees, departments: updatedDepartments, updatedAt: now } }
    );



    return NextResponse.json({
      success: true,
      message: "Employee updated successfully",
      data: employee,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// ✅ DELETE employee (clean remove)
export async function DELETE(req: NextRequest) {
  try {
    const authUser = await currentUser();
    const email = authUser?.primaryEmailAddress?.emailAddress;
    if (!email)
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const employeeEmail = searchParams.get("employeeEmail");
    if (!employeeEmail)
      return NextResponse.json({ success: false, message: "Employee email required" }, { status: 400 });

    const { db } = await mongoDB();
    const users = db.collection("users");

    const userDoc = await users.findOne({ email });
    if (!userDoc)
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    // Remove from global employees
    await users.updateOne({ email }, { $pull: { employees: { email: employeeEmail } } as any });

    // Clean from department employees
    const updatedDepartments = userDoc.departments.map((dept: any) => ({
      ...dept,
      employees: (dept.employees || []).filter((e: any) => e.email !== employeeEmail),
    }));

    await users.updateOne(
      { email },
      { $set: { departments: updatedDepartments, updatedAt: new Date() } }
    );

    return NextResponse.json({ success: true, message: "Employee deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
