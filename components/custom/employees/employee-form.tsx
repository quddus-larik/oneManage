"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export type EmployeeFormData = {
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

interface EmployeeFormProps {
  data: EmployeeFormData;
  onChange: (data: EmployeeFormData) => void;
  departments: Department[];
  isLoading?: boolean;
}

export function EmployeeForm({
  data,
  onChange,
  departments,
  isLoading = false,
}: EmployeeFormProps) {
  return (
    <div className="space-y-4 overflow-y-auto">
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={data.name}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          placeholder="Employee name"
          disabled={isLoading}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={data.email}
          onChange={(e) => onChange({ ...data, email: e.target.value })}
          placeholder="employee@company.com"
          disabled={isLoading}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="position">Position</Label>
        <Input
          id="position"
          value={data.position}
          onChange={(e) => onChange({ ...data, position: e.target.value })}
          placeholder="Job title"
          disabled={isLoading}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          type="tel"
          value={data.phone}
          onChange={(e) => onChange({ ...data, phone: e.target.value })}
          placeholder="+1 (555) 000-0000"
          disabled={isLoading}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="department">Department</Label>
        <Select
          value={data.department_id}
          onValueChange={(val) => onChange({ ...data, department_id: val })}
          disabled={isLoading}
        >
          <SelectTrigger id="department">
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

      <Separator />
    </div>
  );
}
