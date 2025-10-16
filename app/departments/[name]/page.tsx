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

export default function DepartmentPage() {
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const [department, setDepartment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [allEmployees, setAllEmployees] = useState<any[]>([]);
    const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editDepartment, setEditDepartment] = useState<any>(null);

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
        }
    };

    if (loading) return <div className="p-6">Loading department...</div>;
    if (error) return <div className="p-6 text-red-500">{error}</div>;
    if (!department) return <div className="p-6 text-gray-500">No department data.</div>;

    return (
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
            <Button onClick={openEditDrawer}>Edit Department</Button>

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
                                <Input value={editDepartment.name} onChange={(e) => setEditDepartment({ ...editDepartment, name: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <label>Type</label>
                                <Input value={editDepartment.type} onChange={(e) => setEditDepartment({ ...editDepartment, type: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <label>Description</label>
                                <Textarea value={editDepartment.description} onChange={(e) => setEditDepartment({ ...editDepartment, description: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <label>Professional Details</label>
                                <Textarea value={editDepartment.professionalDetails} onChange={(e) => setEditDepartment({ ...editDepartment, professionalDetails: e.target.value })} />
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
                        <Button onClick={handleUpdate}>Save Changes</Button>
                        <DrawerClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </div>
    );
}
