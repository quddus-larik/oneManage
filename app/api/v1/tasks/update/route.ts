import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface Assigned {
  id: string;
  name: string;
  email: string;
  completed?: boolean;
}

interface Task {
  id: string;
  title: string;
  description: string;
  priority: string;
  due_date: string;
}

interface UserDoc {
  id: string;
  name: string;
  email: string;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const admin = url.searchParams.get("admin");
  const task_id = url.searchParams.get("task_id");

  if (!admin || !task_id) {
    return NextResponse.json({ error: "admin and task_id required" }, { status: 400 });
  }

  try {
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", admin)
      .single();

    if (userError || !user) return NextResponse.json({ error: "Admin not found" }, { status: 404 });

    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", task_id)
      .eq("user_id", user.id)
      .single();

    if (taskError || !task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const { data: assignments } = await supabase
      .from("task_assignments")
      .select("*, employees(*)")
      .eq("task_id", task_id);

    return NextResponse.json({ task: { ...task, assigned: assignments || [] } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { admin, task_id, completed } = body as { admin: string; task_id: string; completed: boolean };

    if (!admin || !task_id || typeof completed !== "boolean") {
      return NextResponse.json({ error: "admin, task_id, and completed required" }, { status: 400 });
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", admin)
      .single();

    if (userError || !user) return NextResponse.json({ error: "Admin not found" }, { status: 404 });

    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", task_id)
      .eq("user_id", user.id)
      .single();

    if (taskError || !task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const { data: assignments, error: assignError } = await supabase
      .from("task_assignments")
      .select("*")
      .eq("task_id", task_id);

    if (assignError) throw assignError;

    if (assignments && assignments.length > 0) {
      const { error: updateError } = await supabase
        .from("task_assignments")
        .update({ completed, completed_at: completed ? new Date().toISOString() : null })
        .eq("task_id", task_id);

      if (updateError) throw updateError;
    }

    return NextResponse.json({ message: "Task updated successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
