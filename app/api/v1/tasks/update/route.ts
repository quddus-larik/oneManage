import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const task_id = url.searchParams.get("task_id");

  if (!task_id) {
    return NextResponse.json({ error: "task_id is required" }, { status: 400 });
  }

  try {
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", task_id)
      .single();

    if (taskError || !task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const { data: assignments, error: assignError } = await supabase
      .from("task_assignments")
      .select(`completed, employee_id, employees(name,email)`)
      .eq("task_id", task_id);

    if (assignError) throw assignError;

    const assigned = (assignments || []).map((a: any) => ({
      name: a.employees?.name,
      email: a.employees?.email,
      completed: a.completed,
    }));

    return NextResponse.json({
      task: {
        _id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        dueDate: task.due_date,
        assigned,
      },
    });
  } catch (err) {
    console.error("GET task error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { task_id, email, completed } = await req.json();

    if (!task_id || !email || typeof completed !== "boolean") {
      return NextResponse.json(
        { error: "task_id, email, and completed are required" },
        { status: 400 }
      );
    }

    const { data: employee, error: empError } = await supabase
      .from("employees")
      .select("id")
      .eq("email", email)
      .single();

    if (empError || !employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const { error: updateError } = await supabase
      .from("task_assignments")
      .update({ completed, completed_at: completed ? new Date().toISOString() : null })
      .eq("task_id", task_id)
      .eq("employee_id", employee.id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, message: "Task status updated successfully" });
  } catch (err) {
    console.error("PUT task error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

