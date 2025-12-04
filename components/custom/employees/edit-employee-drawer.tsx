"use client";

import React from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { EmployeeForm, EmployeeFormData } from "./employee-form";

type Department = {
  id: string;
  name: string;
};

type Employee = {
  id: string;
  name: string;
  email: string;
  position: string;
  phone: string;
  department_id: string;
};

interface EditEmployeeDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  departments: Department[];
  onUpdateEmployee: (data: EmployeeFormData) => Promise<void>;
}

export function EditEmployeeDrawer({
  isOpen,
  onOpenChange,
  employee,
  departments,
  onUpdateEmployee,
}: EditEmployeeDrawerProps) {
  const [formData, setFormData] = React.useState<EmployeeFormData>(
    employee
      ? {
          name: employee.name,
          email: employee.email,
          position: employee.position,
          phone: employee.phone,
          department_id: employee.department_id,
        }
      : {
          name: "",
          email: "",
          position: "",
          phone: "",
          department_id: "",
        }
  );
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        email: employee.email,
        position: employee.position,
        phone: employee.phone,
        department_id: employee.department_id,
      });
    }
  }, [employee]);

  const handleUpdate = async () => {
    if (!formData.name || !formData.email || !formData.position || !formData.department_id) {
      alert("Please fill all required fields");
      return;
    }

    setIsLoading(true);
    try {
      await onUpdateEmployee(formData);
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="sm:max-w-[420px] ml-2 border-l bg-background flex flex-col h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>Edit Employee</DrawerTitle>
          <DrawerDescription>Update employee information below.</DrawerDescription>
        </DrawerHeader>

        {employee && (
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <EmployeeForm
              data={formData}
              onChange={setFormData}
              departments={departments}
              isLoading={isLoading}
            />
          </div>
        )}

        <DrawerFooter>
          <Button onClick={handleUpdate} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" disabled={isLoading}>
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
