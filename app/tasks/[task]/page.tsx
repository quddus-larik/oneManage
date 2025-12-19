"use client";

import { TitleHeader } from "@/components/custom/main-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Dashboard from "@/app/provider/ui";

interface Assigned {
  id?: string;
  name: string;
  email: string;
  avatar?: string;
  completed?: boolean;
}

interface Task {
  id: string;
  title: string;
  description: string;
  priority: "Low" | "Medium" | "High";
  assigned: Assigned[];
  due_date: string;
}

export default function Page() {
  const searchParams = useSearchParams();
  const { user } = useUser();

  const id = searchParams.get("id");
  const admin = user?.primaryEmailAddress?.emailAddress; // admin from Clerk session

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !admin) return;

    const fetchTask = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/tasks?id=${id}`);
        if (!res.ok) throw new Error(`Failed to fetch task: ${res.status}`);
        const data = await res.json();
        if (data.success && data.data) setTask(data.data);
        else setError("Task not found.");
      } catch (err: any) {
        setError(err.message || "Unknown error occurred");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id, admin]);

  const notifyEmployee = async (employeeEmail: string) => {
    if (!id) return;
    setSendingEmail(employeeEmail);

    try {
      const res = await fetch("/api/v1/tasks/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admin,
          email: employeeEmail,
          task_id: id,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Notification sent to ${employeeEmail}`);
      } else {
        alert(`Failed to send: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error sending email.");
    } finally {
      setSendingEmail(null);
    }
  };

  if (loading) return <p className="text-center py-8">Loading task...</p>;
  if (error) return <p className="text-center text-red-500 py-8">{error}</p>;
  if (!task) return <p className="text-center py-8">Task not found.</p>;

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();

  return (
    <Dashboard>
      <div className="flex gap-6 flex-col p-4 lg:p-8 h-full">
        {/* Header Section */}
        <div className="space-y-2">
          <TitleHeader label={task.title} span={task.description} />
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-gradient-to-br from-background to-muted/30 rounded-lg border border-border/50 p-6 overflow-y-auto">
          {/* Task Info */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Badge variant={task.priority === "High" ? "destructive" : task.priority === "Medium" ? "secondary" : "default"}>
                Priority: {task.priority}
              </Badge>
              <Badge variant="outline">Due: {formatDate(task.due_date)}</Badge>
            </div>
          </div>

          {/* Assigned Employees */}
          <div className="mt-4 space-y-3">
            <h3 className="text-lg font-semibold">Assigned Employees</h3>
            <div className="flex flex-col gap-2">
              {task.assigned.map((emp) => (
                <div
                  key={emp.email}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 border rounded-md hover:bg-muted/30 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <Badge>{emp.name}</Badge>
                    <Badge variant={emp.completed ? "outline" : "destructive"}>
                      {emp.completed ? "Completed" : "Incomplete"}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => notifyEmployee(emp.email)}
                    disabled={sendingEmail === emp.email}
                  >
                    {sendingEmail === emp.email ? "Sending..." : `Notify ${emp.name}`}
                  </Button>
                </div>
              ))}

            </div>
          </div>
        </div>
      </div>
    </Dashboard>
  );
}
