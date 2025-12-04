"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmployeesTable } from "./employees-table";
import { AddEmployeeDrawer } from "./add-employee-drawer";
import { EditEmployeeDrawer } from "./edit-employee-drawer";
import { EmployeeFormData } from "./employee-form";

type Employee = {
  id: string;
  name: string;
  email: string;
  position: string;
  phone: string;
  department_id: string;
};

type Department = {
  id: string;
  name: string;
};

export function EmployeeManager() {
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [search, setSearch] = React.useState("");
  const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | null>(null);
  const [isAddDrawerOpen, setIsAddDrawerOpen] = React.useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

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
  const handleAddEmployee = async (data: EmployeeFormData) => {
    try {
      const res = await fetch("/api/v1/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        await fetchEmployees();
      } else {
        alert(result.message || "Failed to add employee");
      }
    } catch (err) {
      console.error("Failed to add employee:", err);
      alert("An error occurred while adding employee");
    }
  };

  // Update employee
  const handleUpdateEmployee = async (data: EmployeeFormData) => {
    if (!selectedEmployee) return;
    try {
      const res = await fetch(`/api/v1/employees/${selectedEmployee.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        await fetchEmployees();
      } else {
        alert(result.message || "Failed to update employee");
      }
    } catch (err) {
      console.error("Failed to update employee:", err);
      alert("An error occurred while updating employee");
    }
  };

  // Delete employee
  const handleDeleteEmployee = async (email: string) => {
    try {
      const res = await fetch(`/api/v1/employees?email=${email}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.success) {
        await fetchEmployees();
      } else {
        alert(result.message || "Failed to delete employee");
      }
    } catch (err) {
      console.error("Failed to delete employee:", err);
      alert("An error occurred while deleting employee");
    }
  };

  return (
    <div className="space-y-6">
      {/* Search + Add */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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
      <EmployeesTable
        employees={employees}
        filteredEmployees={filteredEmployees}
        departments={departmentMap}
        isLoading={isLoading}
        onEdit={(emp) => {
          setSelectedEmployee(emp);
          setIsEditDrawerOpen(true);
        }}
        onDelete={handleDeleteEmployee}
      />

      {/* Add Employee Drawer */}
      <AddEmployeeDrawer
        isOpen={isAddDrawerOpen}
        onOpenChange={setIsAddDrawerOpen}
        departments={departments}
        onAddEmployee={handleAddEmployee}
      />

      {/* Edit Employee Drawer */}
      <EditEmployeeDrawer
        isOpen={isEditDrawerOpen}
        onOpenChange={setIsEditDrawerOpen}
        employee={selectedEmployee}
        departments={departments}
        onUpdateEmployee={handleUpdateEmployee}
      />
    </div>
  );
}
