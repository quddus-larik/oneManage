"use client";

import * as React from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { TitleHeader } from "@/components/custom/main-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ArrowUpRight } from "lucide-react";
import { DropdownCheckboxes } from "@/components/custom/multiselect"; // import your checkbox dropdown

export default function DepartmentsPage() {
  const { user } = useUser();
  const router = useRouter();

  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState("All");
  const [departments, setDepartments] = React.useState<any[]>([]);
  const [employees, setEmployees] = React.useState<any[]>([]); // fetched employees
  const [openDialog, setOpenDialog] = React.useState(false);

  const [formData, setFormData] = React.useState({
    name: "",
    type: "",
    description: "",
    professionalDetails: "",
    selectedEmployees: [] as string[], // store selected employee emails
  });

  // Fetch user's departments
  React.useEffect(() => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    const fetchDepartments = async () => {
      try {
        const email = user.primaryEmailAddress?.emailAddress;
        const res = await fetch(`/api/v1/departments?email=${email}`);
        const data = await res.json();
        if (data.success) setDepartments(data.data);
      } catch (err) {
        console.error("Error fetching departments:", err);
      }
    };

    const fetchEmployees = async () => {
      try {
        const res = await fetch("/api/v1/employees");
        const data = await res.json();
        if (data.success) setEmployees(data.data);
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };

    fetchDepartments();
    fetchEmployees();
  }, [user]);

  // Filtered departments
  const filteredDepartments = React.useMemo(() => {
    return departments.filter((dept) => {
      const matchesSearch =
        dept.name?.toLowerCase().includes(search.toLowerCase()) ||
        dept.description?.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === "All" ? true : dept.type === filter;
      return matchesSearch && matchesFilter;
    });
  }, [departments, search, filter]);

  // Save new department
  const handleSave = async () => {
    if (!formData.name.trim() || !user?.primaryEmailAddress?.emailAddress) return;

    try {
      const payload = {
        email: user.primaryEmailAddress.emailAddress,
        name: formData.name.trim(),
        type: formData.type,
        description: formData.description,
        professionalDetails: formData.professionalDetails,
        employees: employees.filter((e) => formData.selectedEmployees.includes(e.email)),
      };

      const res = await fetch("/api/v1/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setDepartments((prev) => [...prev, data.data]);
        setFormData({ name: "", type: "", description: "", professionalDetails: "", selectedEmployees: [] });
        setOpenDialog(false);
      } else console.error("Failed to add department:", data.message);
    } catch (err) {
      console.error("Error saving department:", err);
    }
  };

  function handleRoute(id: string, name: string) {
    router.push(`/departments/${name}?id=${id}`);
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <TitleHeader label="Departments" span="Manage and organize your company's departments." />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <Input
            type="text"
            placeholder="Search departments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Select onValueChange={setFilter} defaultValue="All">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Technical">Technical</SelectItem>
              <SelectItem value="Administrative">Administrative</SelectItem>
              <SelectItem value="Creative">Creative</SelectItem>
              <SelectItem value="Business">Business</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Add Department Dialog */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">+ Add Department</Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Add New Department</DialogTitle>
              <DialogDescription>Fill in the details below to create a new department.</DialogDescription>
            </DialogHeader>

            <Separator />

            <div className="space-y-3 py-2">
              <div className="grid gap-2">
                <Label>Department Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Engineering"
                />
              </div>

              <div className="grid gap-2">
                <Label>Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(val) => setFormData({ ...formData, type: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="Administrative">Administrative</SelectItem>
                    <SelectItem value="Creative">Creative</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Write a short department overview..."
                />
              </div>

              <div className="grid gap-2">
                <Label>Professional Details</Label>
                <Textarea
                  value={formData.professionalDetails}
                  onChange={(e) =>
                    setFormData({ ...formData, professionalDetails: e.target.value })
                  }
                  placeholder="Add strategic or professional details..."
                />
              </div>

              {/* Multi-select employee dropdown */}
              <div className="grid gap-2">
                <Label>Assign Employees</Label>
                <DropdownCheckboxes
                  label="Employees"
                  span="Employees"
                  items={employees.map((e) => ({ id: e.email, name: e.name }))}
                  selected={formData.selectedEmployees}
                  onChange={(checked) => setFormData({ ...formData, selectedEmployees: checked })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleSave}>Add Department</Button>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Departments Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredDepartments.length > 0 ? (
          filteredDepartments.map((dept) => (
            <Card key={dept._id || dept.name} className="hover:shadow-md transition-all cursor-pointer">
              <CardHeader className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold">{dept.name}</CardTitle>
                <Button size="icon" variant="outline" onClick={() => handleRoute(dept._id, dept.name)}>
                  <ArrowUpRight />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-3">{dept.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">👥 {dept.employees?.length || 0} employees</span>
                  <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md">
                    {dept.type}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground text-center col-span-full py-10">No departments found.</p>
        )}
      </div>
    </div>
  );
}
