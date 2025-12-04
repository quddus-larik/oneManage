"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PenLine } from "lucide-react";
import { DeleteEmployeeDialog } from "./delete-employee-dialog";

type Employee = {
  id: string;
  name: string;
  email: string;
  position: string;
  phone: string;
  department_id: string;
  department_name?: string;
};

interface EmployeesTableProps {
  employees: Employee[];
  filteredEmployees: Employee[];
  departments: Map<string, string>;
  isLoading?: boolean;
  onEdit: (employee: Employee) => void;
  onDelete: (email: string) => Promise<void>;
}

export function EmployeesTable({
  filteredEmployees,
  departments,
  isLoading = false,
  onEdit,
  onDelete,
}: EmployeesTableProps) {
  return (
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
              <TableCell>{departments.get(emp.department_id) || "—"}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEdit(emp)}
                  disabled={isLoading}
                >
                  <PenLine className="h-4 w-4" />
                </Button>
                <DeleteEmployeeDialog
                  employeeName={emp.name}
                  employeeEmail={emp.email}
                  onDelete={onDelete}
                />
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
  );
}
