import { NextRequest, NextResponse } from "next/server"
import { supabase, getUserByEmail } from "@/lib/supabase"
import { currentUser } from "@clerk/nextjs/server"

export async function GET(req: NextRequest) {
    try {
        const authUser = await currentUser();
        const email = authUser?.primaryEmailAddress?.emailAddress;

        if (!email) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const user = await getUserByEmail(email);
        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        const { searchParams } = new URL(req.url);
        const taskId = searchParams.get("id");

        let query = supabase
            .from("tasks")
            .select("*")
            .eq("user_id", user.id);

        if (taskId) {
            query = query.eq("id", taskId);
        }

        const { data: tasks, error } = await query;

        if (error) throw error;

        if (taskId && tasks && tasks.length > 0) {
            return NextResponse.json({ success: true, data: tasks[0] });
        }

        return NextResponse.json({ success: true, data: tasks || [] });
    } catch (err: any) {
        console.error("Task GET Error:", err); 
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await currentUser()
    const email = authUser?.primaryEmailAddress?.emailAddress
    if (!email) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })

    const { title, description, priority, dueDate, assigned } = await req.json()
    
    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, message: "Task title required" }, { status: 400 })
    }

    if (!dueDate || isNaN(new Date(dueDate).getTime())) {
      return NextResponse.json({ success: false, message: "Invalid due date" }, { status: 400 })
    }

    const user = await getUserByEmail(email)
    if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })

    const { data: newTask, error } = await supabase
      .from("tasks")
      .insert([{
        user_id: user.id,
        title: title.trim(),
        description: description || "",
        priority: priority || "Low",
        due_date: new Date(dueDate).toISOString(),
      }])
      .select()
      .single()

    if (error) throw error

    if (assigned && assigned.length > 0 && newTask) {
      const assignments = assigned.map((a: any) => ({
        task_id: newTask.id,
        employee_id: a.id,
        completed: false,
      }))

      const { error: assignError } = await supabase
        .from("task_assignments")
        .insert(assignments)

      if (assignError) throw assignError
    }

    return NextResponse.json({ success: true, message: "Task created", data: newTask }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authUser = await currentUser()
    const email = authUser?.primaryEmailAddress?.emailAddress
    if (!email) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })

    const { taskId, title, description, priority, dueDate } = await req.json()
    if (!taskId) return NextResponse.json({ success: false, message: "Task ID required" }, { status: 400 })

    if (dueDate && isNaN(new Date(dueDate).getTime())) {
      return NextResponse.json({ success: false, message: "Invalid due date" }, { status: 400 })
    }

    const user = await getUserByEmail(email)
    if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })

    const updateData: any = { updated_at: new Date().toISOString() }
    if (title !== undefined) updateData.title = title.trim()
    if (description !== undefined) updateData.description = description
    if (priority !== undefined) updateData.priority = priority
    if (dueDate !== undefined) updateData.due_date = new Date(dueDate).toISOString()

    const { data: updatedTask, error } = await supabase
      .from("tasks")
      .update(updateData)
      .eq("id", taskId)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, message: "Task updated", data: updatedTask })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authUser = await currentUser()
    const email = authUser?.primaryEmailAddress?.emailAddress
    if (!email) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const taskId = searchParams.get("id")
    if (!taskId) return NextResponse.json({ success: false, message: "Task ID required" }, { status: 400 })

    const user = await getUserByEmail(email)
    if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId)
      .eq("user_id", user.id)

    if (error) throw error

    return NextResponse.json({ success: true, message: "Task deleted" })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 })
  }
}
