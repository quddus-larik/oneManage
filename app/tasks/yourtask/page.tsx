"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Check, X } from "lucide-react";

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
  dueDate: string;
  assigned: Assigned[];
}

function TaskPageContent() {
  const params = useSearchParams();
  const task_id = params.get("id") || "";

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch task
  useEffect(() => {
    if (!task_id) return;

    const fetchTask = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/v1/tasks/update?task_id=${task_id}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to fetch task");
          return;
        }

        setTask(data.task);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch task");
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [task_id]);

  // Update employee task status
  const updateTaskStatus = async (completed: boolean) => {
    if (!task) return;
    setUpdating(true);

    try {
      await Promise.all(
        task.assigned.map((emp) =>
          fetch("/api/v1/tasks/update", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ task_id: task._id, email: emp.email, completed }),
          }).then(async (res) => {
            if (!res.ok) {
              const errData = await res.json();
              throw new Error(errData.error || "Failed to update");
            }
          })
        )
      );

      // Update UI locally
      setTask((prev) =>
        prev
          ? {
              ...prev,
              assigned: prev.assigned.map((a) => ({ ...a, completed })),
            }
          : prev
      );
    } catch (err) {
      console.error(err);
      setError("Failed to update task status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading task...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;
  if (!task) return <p className="text-center mt-10">Task not found</p>;

  const completedStatus = task.assigned.every((a) => a.completed);

  return (
    <div className="w-full h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{task.title}</CardTitle>
          <CardDescription>{task.description}</CardDescription>
        </CardHeader>

        <Separator />

        <CardContent>
          <div className="grid grid-cols-1 gap-2">
            <Button className="w-full" disabled={updating} onClick={() => updateTaskStatus(true)}>
              <Check /> Complete
            </Button>
            <Button className="w-full" variant="destructive" disabled={updating} onClick={() => updateTaskStatus(false)}>
              <X /> Incomplete
            </Button>
          </div>
        </CardContent>

        <Separator />

        <CardFooter>
          <p>
            Task status:{" "}
            <span className={completedStatus ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
              {completedStatus ? "Completed" : "Incomplete"}
            </span>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p className="text-center mt-10">Loading page...</p>}>
      <TaskPageContent />
    </Suspense>
  );
}
