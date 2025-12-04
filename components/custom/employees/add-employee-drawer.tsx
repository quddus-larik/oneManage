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

interface AddEmployeeDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  departments: Department[];
  onAddEmployee: (data: EmployeeFormData) => Promise<void>;
}

const defaultFormData: EmployeeFormData = {
  name: "",
  email: "",
  position: "",
  phone: "",
  department_id: "",
};

export function AddEmployeeDrawer({
  isOpen,
  onOpenChange,
  departments,
  onAddEmployee,
}: AddEmployeeDrawerProps) {
  const [formData, setFormData] = React.useState<EmployeeFormData>(defaultFormData);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleAdd = async () => {
    if (!formData.name || !formData.email || !formData.position || !formData.department_id) {
      alert("Please fill all required fields");
      return;
    }

    setIsLoading(true);
    try {
      await onAddEmployee(formData);
      setFormData(defaultFormData);
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="sm:max-w-[420px] border-l bg-background ml-2">
        <DrawerHeader>
          <DrawerTitle>Add Employee</DrawerTitle>
          <DrawerDescription>Fill out the form to create a new employee.</DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-4 overflow-y-scroll">
          <EmployeeForm
            data={formData}
            onChange={setFormData}
            departments={departments}
            isLoading={isLoading}
          />
        </div>

        <DrawerFooter>
          <Button onClick={handleAdd} disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Employee"}
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
