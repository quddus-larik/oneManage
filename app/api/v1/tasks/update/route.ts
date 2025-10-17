import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/db";

interface Assigned {
  name: string;
  email: string;
  completed?: boolean;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  priority: string;
  dueDate: Date;
  assigned: Assigned[];
}

interface UserDoc {
  _id: string;
  name: string;
  email: string;
  tasks: Task[];
}

// GET method - fetch a task by admin email and task_id
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const admin = url.searchParams.get("admin");
  const task_id = url.searchParams.get("task_id");

  if (!admin || !task_id) {
    return NextResponse.json({ error: "admin and task_id required" }, { status: 400 });
  }

  try {
    const usersCollection = await getCollection<UserDoc>("users");
    const adminDoc = await usersCollection.findOne({ email: admin });

    if (!adminDoc) return NextResponse.json({ error: "Admin not found" }, { status: 404 });

    const task = adminDoc.tasks.find((t: any) => t._id === task_id);
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    return NextResponse.json({ task });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PUT method - update completed status of task
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { admin, task_id, completed } = body as { admin: string; task_id: string; completed: boolean };

    if (!admin || !task_id || typeof completed !== "boolean") {
      return NextResponse.json({ error: "admin, task_id, and completed required" }, { status: 400 });
    }

    const usersCollection = await getCollection<UserDoc>("users");

    // Update completed for all assigned users in the task
    const updateResult = await usersCollection.updateOne(
      { email: admin, "tasks._id": task_id },
      { $set: { "tasks.$.assigned.$[].completed": completed } }
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ error: "Task or admin not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Task updated successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
