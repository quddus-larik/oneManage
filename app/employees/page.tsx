"use client";

import React from "react";
import { TitleHeader } from "@/components/custom/main-heading";
import Dashboard from "@/app/provider/ui";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { PenLine, Trash } from "lucide-react";

type Employee = {
  id: string;
  name: string;
  email: string;
  position: string;
  phone: string;
  department_id: string;
  salary: number | 0;
};

type Department = {
  id: string;
  name: string;
};

type EmployeeFormData = {
  name: string;
  email: string;
  position: string;
  phone: string;
  department_id: string;
  salary?: number | 0;
};

export default function Page() {
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [search, setSearch] = React.useState("");
  const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | null>(null);
  const [isAddDrawerOpen, setIsAddDrawerOpen] = React.useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [addFormData, setAddFormData] = React.useState<EmployeeFormData>({
    name: "",
    email: "",
    position: "",
    phone: "",
    department_id: "",
  });
  const [editFormData, setEditFormData] = React.useState<EmployeeFormData>({
    name: "",
    email: "",
    position: "",
    phone: "",
    department_id: "",
  });
  const [isAddLoading, setIsAddLoading] = React.useState(false);
  const [isEditLoading, setIsEditLoading] = React.useState(false);
  const [deleteDialog, setDeleteDialog] = React.useState<{ isOpen: boolean; id: string; email: string; name: string }>({
    isOpen: false,
    id: "",
    email: "",
    name: "",
  });
  const [isDeleteLoading, setIsDeleteLoading] = React.useState(false);

  // Fetch employees
  const fetchEmployees = React.useCallback(async () => {
    try {
      const res = await fetch("/api/v1/employees");
      const data = await res.json();
      if (data.success) {
        setEmployees(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    }
  }, []);

  // Fetch departments
  const fetchDepartments = React.useCallback(async () => {
    try {
      const res = await fetch("/api/v1/departments");
      const data = await res.json();
      if (data.success) {
        setDepartments(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch departments:", err);
    }
  }, []);

  // Initial load
  React.useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await Promise.all([fetchEmployees(), fetchDepartments()]);
      setIsLoading(false);
    };
    load();
  }, [fetchEmployees, fetchDepartments]);

  // Filter employees
  const filteredEmployees = React.useMemo(() => {
    return employees.filter(
      (emp) =>
        emp.name?.toLowerCase().includes(search.toLowerCase()) ||
        emp.email?.toLowerCase().includes(search.toLowerCase()) ||
        emp.position?.toLowerCase().includes(search.toLowerCase())
    );
  }, [employees, search]);

  // Create department map for quick lookup
  const departmentMap = React.useMemo(() => {
    const map = new Map<string, string>();
    departments.forEach((dept) => map.set(dept.id, dept.name));
    return map;
  }, [departments]);

  // Add employee
  const handleAddEmployee = async () => {
    if (!addFormData.name || !addFormData.email || !addFormData.position || !addFormData.department_id) {
      alert("Please fill all required fields");
      return;
    }

    setIsAddLoading(true);
    try {
      const res = await fetch("/api/v1/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employee: addFormData }),
      });
      const result = await res.json();
      if (result.success) {
        await fetchEmployees();
        setAddFormData({ name: "", email: "", position: "", phone: "", department_id: "", salary: 0 });
        setIsAddDrawerOpen(false);
      } else {
        alert(result.message || "Failed to add employee");
      }
    } catch (err) {
      console.error("Failed to add employee:", err);
      alert("An error occurred while adding employee");
    } finally {
      setIsAddLoading(false);
    }
  };

  // Update employee
  const handleUpdateEmployee = async () => {
    if (!editFormData.name || !editFormData.email || !editFormData.position || !editFormData.department_id) {
      alert("Please fill all required fields");
      return;
    }

    if (!selectedEmployee) return;

    setIsEditLoading(true);
    try {
      const res = await fetch(`/api/v1/employees`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employee: { ...editFormData, id: selectedEmployee.id } }),
      });
      const result = await res.json();
      if (result.success) {
        await fetchEmployees();
        setIsEditDrawerOpen(false);
      } else {
        alert(result.message || "Failed to update employee");
      }
    } catch (err) {
      console.error("Failed to update employee:", err);
      alert("An error occurred while updating employee");
    } finally {
      setIsEditLoading(false);
    }
  };

  // Delete employee
  const handleDeleteEmployee = async () => {
    setIsDeleteLoading(true);
    try {
      const res = await fetch(`/api/v1/employees?id=${deleteDialog.id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.success) {
        await fetchEmployees();
        setDeleteDialog({ isOpen: false, id: "", email: "", name: "" });
      } else {
        alert(result.message || "Failed to delete employee");
      }
    } catch (err) {
      console.error("Failed to delete employee:", err);
      alert("An error occurred while deleting employee");
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const handleEditClick = (emp: Employee) => {
  setSelectedEmployee(emp);
  setEditFormData({
    name: emp.name,
    email: emp.email,
    position: emp.position,
    phone: emp.phone,
    department_id: emp.department_id,
    salary: emp.salary ?? 0,
  });
  setIsEditDrawerOpen(true);
};


  return (
    <Dashboard>
      <div className="flex gap-6 flex-col p-4 lg:p-8 h-full">
        {/* Header Section */}
        <div className="space-y-2">
          <TitleHeader
            label="Employee Management"
            span="Manage your workforce with comprehensive employee information and controls."
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-gradient-to-br from-background to-muted/30 rounded-lg border border-border/50 p-6 overflow-y-auto">
          {/* Search + Add */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <Input
              type="text"
              placeholder="Search by name, email, or position..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
              disabled={isLoading}
            />
            <Button
              onClick={() => setIsAddDrawerOpen(true)}
              disabled={isLoading || departments.length === 0}
            >
              + Add Employee
            </Button>
          </div>

          {/* Table */}
          <Table>
            <TableCaption>
              {filteredEmployees.length === 0
                ? "No employees found."
                : `Showing ${filteredEmployees.length} employee(s)`}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">{emp.name}</TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell>{emp.position}</TableCell>
                    <TableCell>{emp.phone}</TableCell>
                    <TableCell>{departmentMap.get(emp.department_id) || "—"}</TableCell>
                    <TableCell>{emp.salary?.toLocaleString() ?? "—"}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEditClick(emp)}
                        disabled={isLoading}
                      >
                        <PenLine className="h-4 w-4" />
                      </Button>
                      <Dialog open={deleteDialog.isOpen && deleteDialog.email === emp.email} onOpenChange={(open) => {
                        if (!open) {
                          setDeleteDialog({ isOpen: false, id: "", email: "", name: "" });
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => setDeleteDialog({ isOpen: true, id: emp.id, email: emp.email, name: emp.name })}
                            disabled={isDeleteLoading}
                          >
                            <Trash />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Employee</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete employee {deleteDialog.name}? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <Separator />
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setDeleteDialog({ isOpen: false, id: "", email: "", name: "" })}
                              disabled={isDeleteLoading}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={handleDeleteEmployee}
                              disabled={isDeleteLoading}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              {isDeleteLoading ? "Deleting..." : "Delete"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No employees found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Add Employee Drawer */}
          <Drawer open={isAddDrawerOpen} onOpenChange={setIsAddDrawerOpen}>
            <DrawerContent className="sm:max-w-[480px] ml-0 sm:ml-auto flex flex-col max-h-[90vh]">
              <DrawerHeader>
                <DrawerTitle>Add Employee</DrawerTitle>
                <DrawerDescription>Fill out the form to create a new employee.</DrawerDescription>
              </DrawerHeader>

              <div className="flex-1 overflow-y-auto px-4 space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="add-name">Name</Label>
                  <Input
                    id="add-name"
                    value={addFormData.name}
                    onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                    placeholder="Employee name"
                    disabled={isAddLoading}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="add-email">Email</Label>
                  <Input
                    id="add-email"
                    type="email"
                    value={addFormData.email}
                    onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                    placeholder="employee@company.com"
                    disabled={isAddLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="add-salary">Salary</Label>
                  <Input
                    id="add-salary"
                    type="number"
                    value={addFormData.salary ?? ""}
                    onChange={(e) =>
                      setAddFormData({
                        ...addFormData,
                        salary: Number(e.target.value),
                      })
                    }
                  /></div>


                <div className="grid gap-2">
                  <Label htmlFor="add-position">Position</Label>
                  <Input
                    id="add-position"
                    value={addFormData.position}
                    onChange={(e) => setAddFormData({ ...addFormData, position: e.target.value })}
                    placeholder="Job title"
                    disabled={isAddLoading}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="add-phone">Phone</Label>
                  <Input
                    id="add-phone"
                    type="tel"
                    value={addFormData.phone}
                    onChange={(e) => setAddFormData({ ...addFormData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    disabled={isAddLoading}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="add-department">Department</Label>
                  <Select
                    value={addFormData.department_id}
                    onValueChange={(val) => setAddFormData({ ...addFormData, department_id: val })}
                    disabled={isAddLoading}
                  >
                    <SelectTrigger id="add-department">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DrawerFooter>
                <Button onClick={handleAddEmployee} disabled={isAddLoading}>
                  {isAddLoading ? "Adding..." : "Add Employee"}
                </Button>
                <DrawerClose asChild>
                  <Button variant="outline" disabled={isAddLoading}>
                    Cancel
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          {/* Edit Employee Drawer */}
          <Drawer open={isEditDrawerOpen} onOpenChange={setIsEditDrawerOpen}>
            <DrawerContent className="sm:max-w-[480px] ml-0 sm:ml-auto flex flex-col max-h-[90vh]">
              <DrawerHeader>
                <DrawerTitle>Edit Employee</DrawerTitle>
                <DrawerDescription>Update employee information below.</DrawerDescription>
              </DrawerHeader>

              {selectedEmployee && (
                <div className="flex-1 overflow-y-auto px-4 space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-name">Name</Label>
                    <Input
                      id="edit-name"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      placeholder="Employee name"
                      disabled={isEditLoading}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      placeholder="employee@company.com"
                      disabled={isEditLoading}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="edit-position">Position</Label>
                    <Input
                      id="edit-position"
                      value={editFormData.position}
                      onChange={(e) => setEditFormData({ ...editFormData, position: e.target.value })}
                      placeholder="Job title"
                      disabled={isEditLoading}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="edit-salary">Salary</Label>
                    <Input
                      id="edit-salary"
                      type="number"
                      value={editFormData.salary ?? ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          salary: Number(e.target.value),
                        })
                      }
                    />
                  </div>


                  <div className="grid gap-2">
                    <Label htmlFor="edit-phone">Phone</Label>
                    <Input
                      id="edit-phone"
                      type="tel"
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      disabled={isEditLoading}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="edit-department">Department</Label>
                    <Select
                      value={editFormData.department_id}
                      onValueChange={(val) => setEditFormData({ ...editFormData, department_id: val })}
                      disabled={isEditLoading}
                    >
                      <SelectTrigger id="edit-department">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <DrawerFooter>
                <Button onClick={handleUpdateEmployee} disabled={isEditLoading}>
                  {isEditLoading ? "Saving..." : "Save Changes"}
                </Button>
                <DrawerClose asChild>
                  <Button variant="outline" disabled={isEditLoading}>
                    Cancel
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </Dashboard>
  );
}