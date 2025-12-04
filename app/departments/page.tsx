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
import { ArrowUpRight, Loader2, Users } from "lucide-react";
import { DropdownCheckboxes } from "@/components/custom/multiselect";
import Dashboard from "@/app/provider/ui";

export default function DepartmentsPage() {
  const { user } = useUser();
  const router = useRouter();

  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState("All");
  const [departments, setDepartments] = React.useState<any[]>([]);
  const [employees, setEmployees] = React.useState<any[]>([]);
  const [openDialog, setOpenDialog] = React.useState(false);

  const [loadingSave, setLoadingSave] = React.useState(false); // loading for add department
  const [loadingDeptId, setLoadingDeptId] = React.useState<string | null>(null); // per-department loading

  const [formData, setFormData] = React.useState({
    name: "",
    type: "",
    description: "",
    professionalDetails: "",
    selectedEmployees: [] as string[],
  });

  // Fetch data
  React.useEffect(() => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    const fetchDepartments = async () => {
      try {
        const res = await fetch(`/api/v1/departments`);
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

  // Add employee count to departments
  const departmentsWithCounts = React.useMemo(() => {
    return departments.map((dept) => ({
      ...dept,
      length: employees.filter((e) => e.department_id === dept.id).length,
    }));
  }, [departments, employees]);

  const filteredDepartments = React.useMemo(() => {
    return departmentsWithCounts.filter((dept) => {
      const matchesSearch =
        dept.name?.toLowerCase().includes(search.toLowerCase()) ||
        dept.description?.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === "All" ? true : dept.type === filter;
      return matchesSearch && matchesFilter;
    });
  }, [departmentsWithCounts, search, filter]);
  console.log(filteredDepartments)

  // Save new department
  const handleSave = async () => {
    if (!formData.name.trim() || !user?.primaryEmailAddress?.emailAddress) return;
    setLoadingSave(true);
    try {
      const payload = {
        name: formData.name.trim(),
        type: formData.type,
        description: formData.description,
        professionalDetails: formData.professionalDetails,
      };

      const res = await fetch("/api/v1/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        // If employees are selected, update them to belong to this department
        if (formData.selectedEmployees.length > 0) {
          for (const employeeId of formData.selectedEmployees) {
            const employee = employees.find((e) => e.id === employeeId);
            if (employee) {
              await fetch("/api/v1/employees", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  employee: {
                    ...employee,
                    department_id: data.data.id,
                  },
                }),
              });
            }
          }
        }
        setDepartments((prev) => [...prev, data.data]);
        setFormData({ name: "", type: "", description: "", professionalDetails: "", selectedEmployees: [] });
        setOpenDialog(false);
      } else console.error("Failed to add department:", data.message);
    } catch (err) {
      console.error("Error saving department:", err);
    } finally {
      setLoadingSave(false);
    }
  };

  const handleRoute = async (id: string, name: string) => {
    setLoadingDeptId(id);
    router.push(`/departments/${name}?id=${id}`);
  };

  return (
    <Dashboard>
      <div className="flex gap-6 flex-col p-4 lg:p-8 h-full">
        {/* Header Section */}
        <div className="space-y-2">
          <TitleHeader label="Department Management" span="Organize and manage your company's departments with team assignments." />
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-gradient-to-br from-background to-muted/30 rounded-lg border border-border/50 p-6 overflow-y-auto">
          {/* Search and Add Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
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

              <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
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

                  <div className="grid gap-2">
                    <Label>Assign Employees</Label>
                    <DropdownCheckboxes
                      label="Employees"
                      span="Employees"
                      items={employees.map((e) => ({ id: e.id, name: e.name }))}
                      selected={formData.selectedEmployees}
                      onChange={(checked) => setFormData({ ...formData, selectedEmployees: checked })}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button onClick={handleSave} disabled={loadingSave}>
                    {loadingSave ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Add Department"
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setOpenDialog(false)} disabled={loadingSave}>
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
                <Card
                  key={dept.id}
                  className="hover:shadow-md transition-all"
                >
                  <CardHeader className="flex justify-between items-center">
                    <CardTitle className="text-lg font-semibold">{dept.name}</CardTitle>
                    <Button
                      size="icon"
                      variant="outline"
                      disabled={loadingDeptId === dept.id}
                      onClick={() => handleRoute(dept.id, dept.name)}
                    >
                      {loadingDeptId === dept.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowUpRight />
                      )}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-3">{dept.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex w-full gap-2"><Users className="size-4"/> {dept.length} {dept.length === 1 ? 'employee' : 'employees'}</span>
                      <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md">
                        {dept.type}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-muted-foreground text-center col-span-full py-10">
                No departments found.
              </p>
            )}
          </div>
        </div>
      </div>
    </Dashboard>
  );
}
