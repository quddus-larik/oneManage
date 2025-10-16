import { NextRequest, NextResponse } from "next/server"
import { mongoDB } from "@/lib/db"
import { currentUser } from "@clerk/nextjs/server"

// ------------------- GET TASKS -------------------
export async function GET(req: NextRequest) {
  try {
    const authUser = await currentUser();
    const email = authUser?.primaryEmailAddress?.emailAddress;

    if (!email) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { db } = await mongoDB();
    const users = db.collection("users");

    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get("id"); // get id from query params

    // Fetch user tasks
    const userDoc = await users.findOne(
      { email },
      { projection: { tasks: 1, _id: 0 } }
    );

    if (!userDoc?.tasks) {
      return NextResponse.json({ success: true, data: [] });
    }

    // If an ID is provided, find the specific task
    if (taskId) {
      const task = userDoc.tasks.find((t: any) => t.id === taskId); // assuming tasks have `id` field
      return NextResponse.json({ success: true, data: task || null });
    }

    // If no ID, return all tasks
    return NextResponse.json({ success: true, data: userDoc.tasks });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// ------------------- CREATE TASK -------------------
export async function POST(req: NextRequest) {
  try {
    const authUser = await currentUser()
    const email = authUser?.primaryEmailAddress?.emailAddress
    if (!email) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })

    const { title, description, priority, dueDate, assigned } = await req.json()
    if (!title) return NextResponse.json({ success: false, message: "Task title required" }, { status: 400 })

    const { db } = await mongoDB()
    const users = db.collection("users")

    const newTask = {
      _id: crypto.randomUUID(),
      title,
      description,
      priority: priority || "Low",
      dueDate: new Date(dueDate),
      assigned: assigned.map((a: any) => ({ ...a, completed: false })),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await users.updateOne({ email }, { $push: { tasks: newTask } as any, $set: { updatedAt: new Date() } })

    return NextResponse.json({ success: true, message: "Task created", data: newTask }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 })
  }
}

// ------------------- UPDATE TASK -------------------
export async function PUT(req: NextRequest) {
  try {
    const authUser = await currentUser()
    const email = authUser?.primaryEmailAddress?.emailAddress
    if (!email) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })

    const { taskId, title, description, priority, dueDate, assigned } = await req.json()
    if (!taskId) return NextResponse.json({ success: false, message: "Task ID required" }, { status: 400 })

    const { db } = await mongoDB()
    const users = db.collection("users")

    const userDoc = await users.findOne({ email })
    if (!userDoc) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })

    const updatedTasks = (userDoc.tasks || []).map((t: any) =>
      t._id === taskId
        ? {
            ...t,
            title: title ?? t.title,
            description: description ?? t.description,
            priority: priority ?? t.priority,
            dueDate: dueDate ? new Date(dueDate) : t.dueDate,
            assigned: assigned ?? t.assigned,
            updatedAt: new Date(),
          }
        : t
    )

    await users.updateOne({ email }, { $set: { tasks: updatedTasks, updatedAt: new Date() } })
    const updatedTask = updatedTasks.find((t: any) => t._id === taskId)

    return NextResponse.json({ success: true, message: "Task updated", data: updatedTask })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 })
  }
}

// ------------------- DELETE TASK -------------------
export async function DELETE(req: NextRequest) {
  try {
    const authUser = await currentUser()
    const email = authUser?.primaryEmailAddress?.emailAddress
    if (!email) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const taskId = searchParams.get("id")
    if (!taskId) return NextResponse.json({ success: false, message: "Task ID required" }, { status: 400 })

    const { db } = await mongoDB()
    const users = db.collection("users")

    const userDoc = await users.findOne({ email })
    if (!userDoc) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })

    const updatedTasks = (userDoc.tasks || []).filter((t: any) => t._id !== taskId)
    await users.updateOne({ email }, { $set: { tasks: updatedTasks, updatedAt: new Date() } })

    return NextResponse.json({ success: true, message: "Task deleted" })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 })
  }
}
