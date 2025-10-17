"use client";

import * as React from "react";
import { TitleHeader } from "@/components/custom/main-heading";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DropdownCheckboxes } from "@/components/custom/multiselect";
import { Ellipsis, FilePlus, Plus, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import Dashboard from "@/app/provider/ui";
import { CalendarPicker } from "@/components/custom/datepicker";

interface Task {
  _id: string;
  title: string;
  description: string;
  priority: "Low" | "Medium" | "High";
  assigned: {
    name: string;
    email: string;
    avatar?: string;
    completed?: boolean;
  }[];
  dueDate: string;
}

interface Employee {
  name: string;
  email: string;
  avatar?: string;
}

export default function Page() {
  const router = useRouter();

  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [search, setSearch] = React.useState("");

  const [newTask, setNewTask] = React.useState({
    title: "",
    description: "",
    priority: "Low" as Task["priority"],
    assignees: [] as string[],
    dueDate: "",
  });

  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  // Fetch data
  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/v1/tasks");
      const data = await res.json();
      if (data.success) setTasks(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch("/api/v1/employees");
      const data = await res.json();
      if (data.success) setEmployees(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    fetchTasks();
    fetchEmployees();
  }, []);

  // Filtered tasks
  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description.toLowerCase().includes(search.toLowerCase())
  );

  // Add new task
  const handleAddTask = async () => {
    if (!newTask.title) return;
    try {
      const res = await fetch("/api/v1/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTask.title,
          description: newTask.description,
          priority: newTask.priority,
          dueDate: newTask.dueDate,
          assigned: newTask.assignees.map((email) => {
            const emp = employees.find((e) => e.email === email);
            return { name: emp?.name || email, email, avatar: emp?.avatar };
          }),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTasks((prev) => [...prev, data.data]);
        setNewTask({
          title: "",
          description: "",
          priority: "Low",
          assignees: [],
          dueDate: "",
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      const res = await fetch(`/api/v1/tasks?id=${taskId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success)
        setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err) {
      console.error(err);
    }
  };

  // Edit Navigation
  const handleGoToTask = (task: Task) => {
    router.push(`/tasks/${task.title}?id=${task._id}`);
  };

  // Edit handler
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsDrawerOpen(true);
  };

  const handleUpdateTask = async () => {
    if (!editingTask) return;
    try {
      const res = await fetch(`/api/v1/tasks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: editingTask._id,
          title: editingTask.title,
          description: editingTask.description,
          priority: editingTask.priority,
          dueDate: editingTask.dueDate,
          assigned: editingTask.assigned,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTasks((prev) =>
          prev.map((t) => (t._id === data.data._id ? data.data : t))
        );
        setIsDrawerOpen(false);
        setEditingTask(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "High":
        return "bg-red-500 hover:bg-red-600";
      case "Medium":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "Low":
        return "bg-green-500 hover:bg-green-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  return (
    <Dashboard>
      <div className="p-4 lg:p-6 space-y-6">
        <TitleHeader label="Tasks" span="Monitor and assign your employees tasks." />

        {/* Search and Add */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <Input
            placeholder="Search tasks by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />

          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-1" /> Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>New Task</DialogTitle>
                <DialogDescription>Fill out task details</DialogDescription>
              </DialogHeader>

              <div className="space-y-3 mt-2">
                <div className="grid gap-2">
                  <label>Task Title</label>
                  <Input
                    value={newTask.title}
                    onChange={(e) =>
                      setNewTask({ ...newTask, title: e.target.value })
                    }
                    placeholder="Enter task name"
                  />
                </div>

                <div className="grid gap-2">
                  <label>Description</label>
                  <Textarea
                    value={newTask.description}
                    onChange={(e) =>
                      setNewTask({ ...newTask, description: e.target.value })
                    }
                    placeholder="Describe the task..."
                  />
                </div>

                <div className="grid gap-2">
                  <label>Priority</label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(val: Task["priority"]) =>
                      setNewTask({ ...newTask, priority: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <label>Assignees</label>
                  <DropdownCheckboxes
                    items={employees.map((e) => ({
                      id: e.email,
                      name: e.name,
                    }))}
                    selected={newTask.assignees}
                    onChange={(checked) =>
                      setNewTask({ ...newTask, assignees: checked })
                    }
                    span="Employees"
                  />
                </div>

                <div className="grid gap-2">
                  <CalendarPicker
                    label="Due Date"
                    initialDate={
                      newTask.dueDate ? new Date(newTask.dueDate) : undefined
                    }
                    onChange={(date) =>
                      setNewTask({
                        ...newTask,
                        dueDate: date.toISOString().split("T")[0],
                      })
                    }
                  />
                </div>
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button onClick={handleAddTask}>
                    <FilePlus className="h-4 w-4 mr-1" /> Create Task
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Task Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <Card key={task._id} className="hover:shadow-md transition-all">
                <CardHeader className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold line-clamp-2">
                    {task.title}
                  </CardTitle>
                  <Badge
                    className={`capitalize text-white ${getPriorityColor(
                      task.priority
                    )} px-2 py-1 rounded-full text-xs`}
                  >
                    {task.priority}
                  </Badge>
                </CardHeader>

                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {task.description || "No description provided."}
                  </p>
                  <Badge className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-md">
                    Due: {task.dueDate || "N/A"}
                  </Badge>
                </CardContent>

                <CardFooter className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Users size={15}/> {task.assigned.length} assignees
                  </span>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="outline">
                        <Ellipsis className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="start">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuGroup>
                        <DropdownMenuItem
                          onClick={() => handleGoToTask(task)}
                        >
                          Navigate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEditTask(task)}
                        >
                          Quick edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteTask(task._id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardFooter>
              </Card>
            ))
          ) : (
            <p className="text-muted-foreground text-center col-span-full py-10">
              No tasks found. Try adding a new task! 📝
            </p>
          )}
        </div>

        {/* Drawer for Quick Edit */}
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerContent className="sm:max-w-md mx-2 my-3">
            <DrawerHeader>
              <DrawerTitle>Edit Task</DrawerTitle>
              <DrawerDescription>Update task details</DrawerDescription>
            </DrawerHeader>
            <Separator />
            {editingTask && (
              <div className="space-y-3 mt-2 py-1 px-2">
                <div className="grid gap-2">
                  <label>Title</label>
                  <Input
                    value={editingTask.title}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, title: e.target.value })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <label>Description</label>
                  <Textarea
                    value={editingTask.description}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <label>Priority</label>
                  <Select
                    value={editingTask.priority}
                    onValueChange={(val: Task["priority"]) =>
                      setEditingTask({ ...editingTask, priority: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <label>Assignees</label>
                  <DropdownCheckboxes
                    items={employees.map((e) => ({
                      id: e.email,
                      name: e.name,
                    }))}
                    selected={editingTask.assigned.map((a) => a.email)}
                    onChange={(checked) => {
                      setEditingTask({
                        ...editingTask,
                        assigned: checked.map((email) => {
                          const emp = employees.find((e) => e.email === email);
                          return {
                            name: emp?.name || email,
                            email,
                            avatar: emp?.avatar,
                          };
                        }),
                      });
                    }}
                    span="Employees"
                  />
                </div>

                <div className="grid gap-2">
                  <CalendarPicker
                    label="Due Date"
                    initialDate={
                      editingTask.dueDate
                        ? new Date(editingTask.dueDate)
                        : undefined
                    }
                    onChange={(date) =>
                      setEditingTask({
                        ...editingTask,
                        dueDate: date.toISOString().split("T")[0],
                      })
                    }
                  />
                </div>
              </div>
            )}

            <DrawerFooter>
              <Button onClick={handleUpdateTask}>Save Changes</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </Dashboard>
  );
}
