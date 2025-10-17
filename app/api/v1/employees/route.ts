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

        const userDoc = await users.findOne(
            { email },
            { projection: { employees: 1, _id: 0 } }
        );
        

        return NextResponse.json({ success: true, data: userDoc?.employees || [] });
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
        if (!employee?.email || !employee?.department)
            return NextResponse.json(
                { success: false, message: "Employee email and department required" },
                { status: 400 }
            );



        const { db } = await mongoDB();
        const users = db.collection("users");

        const userDoc = await users.findOne({ email });
        if (!userDoc) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

        const now = new Date();

        await users.updateOne(
            { email },
            { $push: { employees: { ...employee, addedAt: now, updatedAt: now } } }
        );

        const deptIndex = userDoc.departments.findIndex((d: any) => d._id === employee.department);
        if (deptIndex !== -1) {
            const deptKey = `departments.${deptIndex}.employees`;
            await users.updateOne(
                { email },
                { $push: { [deptKey]: { ...employee, addedAt: now, updatedAt: now } } }
            );
        }

        return NextResponse.json({ success: true, message: "Employee added successfully", data: employee });
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
        if (!employee?.email)
            return NextResponse.json({ success: false, message: "Employee email required" }, { status: 400 });

        const { db } = await mongoDB();
        const users = db.collection("users");

        const userDoc = await users.findOne({ email });
        if (!userDoc) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

        const now = new Date();

        const updatedEmployees = (userDoc.employees || []).map((e: any) =>
            e.email === employee.email ? { ...e, ...employee, updatedAt: now } : e
        );
        
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

        return NextResponse.json({ success: true, message: "Employee updated successfully", data: employee });
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
        const employeeEmail = searchParams.get("employeeEmail");
        if (!employeeEmail)
            return NextResponse.json({ success: false, message: "Employee email required" }, { status: 400 });

        const { db } = await mongoDB();
        const users = db.collection("users");

        const userDoc = await users.findOne({ email });
        if (!userDoc) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

        // Remove from user employees array
        await users.updateOne({ email }, { $pull: { employees: { email: employeeEmail } } as any });

        // Remove from all department employees
        const updatedDepartments = userDoc.departments.map((dept: any) => ({
            ...dept,
            employees: (dept.employees || []).filter((e: any) => e.email !== employeeEmail),
        }));

        await users.updateOne({ email }, { $set: { departments: updatedDepartments, updatedAt: new Date() } });

        return NextResponse.json({ success: true, message: "Employee deleted successfully" });
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
