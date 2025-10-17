"use client";

import { useEffect, useState } from "react";
import { TitleHeader } from "@/components/custom/main-heading";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DropdownCheckboxes } from "@/components/custom/multiselect";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { DialogTitle, DialogTrigger } from "@radix-ui/react-dialog";
import { Ellipsis, PenLine, Trash, Loader2 } from "lucide-react";
import Dashboard from "@/app/provider/ui";

export default function Page() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [department, setDepartment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [allEmployees, setAllEmployees] = useState<any[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editDepartment, setEditDepartment] = useState<any>(null);

  // New button loading states
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch department and employees
  useEffect(() => {
    if (!id) return;

    const fetchDepartment = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/v1/departments/name?id=${encodeURIComponent(id)}`);
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          setDepartment(data.data[0]);
          setSelectedEmployees((data.data[0].employees || []).map((e: any) => e.email));
        } else {
          setError(data.message || "Department not found.");
        }
      } catch (err: any) {
        setError("Failed to fetch department.");
      } finally {
        setLoading(false);
      }
    };

    const fetchEmployees = async () => {
      try {
        const res = await fetch("/api/v1/employees");
        const data = await res.json();
        if (data.success) setAllEmployees(data.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDepartment();
    fetchEmployees();
  }, [id]);

  const openEditDrawer = () => {
    setEditDepartment({ ...department });
    setSelectedEmployees((department.employees || []).map((e: any) => e.email));
    setIsDrawerOpen(true);
  };

  const handleUpdate = async () => {
    try {
      setIsUpdating(true);
      const body = {
        departmentId: id,
        name: editDepartment.name,
        type: editDepartment.type,
        description: editDepartment.description,
        professionalDetails: editDepartment.professionalDetails,
        employeeEmails: selectedEmployees,
      };
      const res = await fetch("/api/v1/departments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setDepartment(data.data);
        setIsDrawerOpen(false);
      } else {
        alert("Failed to update department");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/v1/departments?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        alert("Department deleted successfully!");
        window.location.href = "/departments";
      } else {
        alert("Failed to delete department: " + data.message);
      }
    } catch (err) {
      console.error("Error deleting department:", err);
      alert("An error occurred while deleting the department.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <div className="p-6">Loading department...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!department) return <div className="p-6 text-gray-500">No department data.</div>;

  return (
    <Dashboard>
      <div className="p-6 space-y-4">
        <TitleHeader label={department.name} span={department.description} />
        <div className="flex flex-col lg:flex-row gap-3 ">
          <Badge variant={"outline"}>
            <p className="text-sm">Type: {department.type}</p>
          </Badge>
          <Badge variant={"outline"}>
            <p className="text-sm">Created: {new Date(department.createdAt).toLocaleString()}</p>
          </Badge>
        </div>

        <div className="flex flex-col lg:flex-row gap-1 ">
          <Button onClick={openEditDrawer}>
            <PenLine className="mr-2 h-4 w-4" /> Edit department
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant={"outline"} size={"icon"}>
                <Trash />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Danger Zone</DialogTitle>
                <DialogDescription>Are you sure you want to delete this department?</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant={"destructive"}
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Employees Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Salary</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {department.employees && department.employees.length ? (
              department.employees.map((emp: any) => (
                <TableRow key={emp.email}>
                  <TableCell>{emp.name}</TableCell>
                  <TableCell>{emp.email}</TableCell>
                  <TableCell>{emp.phone || "-"}</TableCell>
                  <TableCell>{emp.salary || "-"}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No employees assigned
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Drawer for Update */}
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerContent className="sm:max-w-[600px] border-l bg-background ml-2">
            <DrawerHeader>
              <DrawerTitle>Edit Department</DrawerTitle>
            </DrawerHeader>
            <Separator />
            {editDepartment && (
              <div className="px-4 pb-4 space-y-3 max-h-[70vh] overflow-y-auto">
                <div className="grid gap-2">
                  <label>Name</label>
                  <Input
                    value={editDepartment.name}
                    onChange={(e) => setEditDepartment({ ...editDepartment, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <label>Type</label>
                  <Input
                    value={editDepartment.type}
                    onChange={(e) => setEditDepartment({ ...editDepartment, type: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <label>Description</label>
                  <Textarea
                    value={editDepartment.description}
                    onChange={(e) =>
                      setEditDepartment({ ...editDepartment, description: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <label>Professional Details</label>
                  <Textarea
                    value={editDepartment.professionalDetails}
                    onChange={(e) =>
                      setEditDepartment({
                        ...editDepartment,
                        professionalDetails: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Multi-select for employees */}
                <div className="grid gap-2 mt-2">
                  <label>Select Employees</label>
                  <DropdownCheckboxes
                    items={allEmployees.map((emp) => ({ id: emp.email, name: emp.name }))}
                    onChange={setSelectedEmployees}
                    selected={selectedEmployees}
                    span="Employees"
                  />
                </div>
              </div>
            )}
            <Separator />
            <DrawerFooter>
              <Button onClick={handleUpdate} disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </Dashboard>
  );
}
