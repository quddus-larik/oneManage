"use client";

import * as React from "react";
import { TitleHeader } from "@/components/custom/main-heading";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardContent,
    CardTitle,
    CardDescription,
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
} from "@/components/ui/dialog";
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
import { ArrowUpRight, Eclipse, Ellipsis, Trash, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

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

    const handleGoToTask = (task: Task) => {
        // Navigate to task page
        router.push(`/tasks/${task._id}`); // or use task.title if you really want, but _id is safer
    };

     const handleEditTask = (task: Task) => {
        // For example, navigate to edit page or open modal
        router.push(`/tasks/${task._id}/edit`);
    };

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

    const filteredTasks = tasks.filter(
        (task) =>
            task.title.toLowerCase().includes(search.toLowerCase()) ||
            task.description.toLowerCase().includes(search.toLowerCase())
    );

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

    const handleDeleteTask = async (taskId: string) => {
        if (!confirm("Are you sure you want to delete this task?")) return;
        try {
            const res = await fetch(`/api/v1/tasks?id=${taskId}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (data.success) setTasks((prev) => prev.filter((t) => t._id !== taskId));
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
        <div className="p-4 lg:p-6 space-y-6">
            <TitleHeader
                label="Tasks"
                span="Monitor and assign your employees tasks."
            />

            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                {/* Search Input */}
                <Input
                    placeholder="Search tasks by title or description..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm sm:max-w-md"
                />

                {/* Add Task Dialog */}
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>+ Add Task</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>New Task</DialogTitle>
                            <DialogDescription>Fill out task details</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3 mt-2">
                            <div className="grid gap-2">
                                <label htmlFor="task-title">Task Title</label>
                                <Input
                                    id="task-title"
                                    value={newTask.title}
                                    onChange={(e) =>
                                        setNewTask({ ...newTask, title: e.target.value })
                                    }
                                    placeholder="Enter task name"
                                />
                            </div>

                            <div className="grid gap-2">
                                <label htmlFor="task-description">Description</label>
                                <Textarea
                                    id="task-description"
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
                                    items={employees.map((e) => ({ id: e.email, name: e.name }))}
                                    selected={newTask.assignees}
                                    onChange={(checked) =>
                                        setNewTask({ ...newTask, assignees: checked })
                                    }
                                    span="Employees"
                                />
                            </div>

                            <div className="grid gap-2">
                                <label htmlFor="due-date">Due Date</label>
                                <Input
                                    id="due-date"
                                    type="date"
                                    value={newTask.dueDate}
                                    onChange={(e) =>
                                        setNewTask({ ...newTask, dueDate: e.target.value })
                                    }
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleAddTask}>Create Task</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                        <Card
                            key={task._id}
                            className="hover:shadow-md transition-all cursor-pointer"
                        >
                            <CardHeader className="flex justify-between items-start">
                                <CardTitle className="text-lg font-semibold line-clamp-2">
                                    {task.title}
                                </CardTitle>
                                <Badge
                                    className={`capitalize text-white ${getPriorityColor(task.priority)} px-2 py-1 rounded-full text-xs`}
                                >
                                    {task.priority}
                                </Badge>
                            </CardHeader>

                            <CardContent className="space-y-3 ">
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                    {task.description || "No description provided."}
                                </p>
                                <Badge className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-md">
                                    Due: {task.dueDate || "N/A"}
                                </Badge>
                            </CardContent>

                            <CardFooter className="flex justify-between items-center">
                                <span className="text-muted-foreground flex items-center gap-1">
                                    👥 {task.assigned.length} assignees
                                </span>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button size="icon" variant="outline" aria-label="Task actions">
                                            <Ellipsis className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56" align="start">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem onClick={() => handleGoToTask(task)}>
                                                Go to task
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleEditTask(task)}>
                                                Quick edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                variant="destructive"
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

        </div>
    );
}
