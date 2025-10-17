"use client";

import { useEffect, useState } from "react";
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

export default function Page() {
  const params = useSearchParams();
  const id = params.get("id") || "";
  const admin = params.get("admin") || "";

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);

  // Fetch task on load
  useEffect(() => {
    if (!id || !admin) return;

    const fetchTask = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/tasks/update?admin=${admin}&task_id=${id}`);
        const data = await res.json();
        if (res.ok) setTask(data.task);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id, admin]);

  // Update task completed status
  const updateTaskStatus = async (completed: boolean) => {
    if (!task) return;
    setUpdating(true);

    try {
      const res = await fetch("/api/v1/tasks/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin, task_id: task._id, completed }),
      });

      const data = await res.json();
      if (res.ok && task.assigned.length > 0) {
        // update locally for UI
        setTask((prev) =>
          prev
            ? {
                ...prev,
                assigned: prev.assigned.map((a) => ({ ...a, completed })),
              }
            : prev
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading task...</p>;
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
            The task assigned by admin is currently:{" "}
            <span className={completedStatus ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
              {completedStatus ? "Completed" : "Incomplete"}
            </span>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
