"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "../ui/separator"

// 🧱 Mock Employee Data
const defaultEmployees = [
  {
    id: 1,
    name: "Aisha Rahman",
    phone: "+1 555-102-8473",
    email: "aisha.rahman@example.com",
    role: "Frontend Developer",
    department: "Engineering",
    age: 28,
    nationality: "Bangladeshi",
    language: "English",
    address: "Dhaka, Bangladesh",
    salary: "$75,000",
  },
  {
    id: 2,
    name: "David Kim",
    phone: "+1 555-222-9473",
    email: "david.kim@example.com",
    role: "Backend Engineer",
    department: "Engineering",
    age: 31,
    nationality: "Korean",
    language: "English, Korean",
    address: "Seoul, South Korea",
    salary: "$85,000",
  },
]

export function EmployeeTable() {
  const [employees, setEmployees] = React.useState(defaultEmployees)
  const [search, setSearch] = React.useState("")
  const [selectedEmployee, setSelectedEmployee] = React.useState<any>(null)
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)
  const [isAddDrawerOpen, setIsAddDrawerOpen] = React.useState(false)
  const [newEmployee, setNewEmployee] = React.useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    age: "",
    nationality: "",
    language: "",
    address: "",
  })

  // 🔍 Filter employees
  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      emp.role.toLowerCase().includes(search.toLowerCase())
  )

  const handleEdit = (emp: any) => {
    setSelectedEmployee(emp)
    setIsDrawerOpen(true)
  }

  const handleAddEmployee = () => {
    setEmployees([
      ...employees,
      {
        id: employees.length + 1,
        ...newEmployee,
        salary: "$0",
      },
    ])
    setNewEmployee({
      name: "",
      email: "",
      phone: "",
      role: "",
      department: "",
      age: "",
      nationality: "",
      language: "",
      address: "",
    })
    setIsAddDrawerOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* 🔍 Search + Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Input
          type="text"
          placeholder="Search employees..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Button onClick={() => setIsAddDrawerOpen(true)}>+ Add Employee</Button>
      </div>

      {/* 🧾 Table */}
      <Table>
        <TableCaption>Employee Directory</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Salary</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((emp) => (
              <TableRow key={emp.id}>
                <TableCell>{emp.name}</TableCell>
                <TableCell>{emp.email}</TableCell>
                <TableCell>{emp.phone}</TableCell>
                <TableCell>{emp.role}</TableCell>
                <TableCell>{emp.department}</TableCell>
                <TableCell>{emp.salary}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(emp)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No employees found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* ✏️ Edit Employee Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="sm:max-w-[420px] ml-2 border-l bg-background">
          <DrawerHeader>
            <DrawerTitle>Edit Employee</DrawerTitle>
            <DrawerDescription>Update employee information below.</DrawerDescription>
          </DrawerHeader>
          <Separator />

          {selectedEmployee && (
            <div className="px-4 pb-4 max-h-[65vh] overflow-y-auto space-y-3">
              <div className="grid gap-2">
                <Label>Name</Label>
                <Input defaultValue={selectedEmployee.name} />
              </div>

              <div className="grid gap-2">
                <Label>Email</Label>
                <Input defaultValue={selectedEmployee.email} />
              </div>

              <div className="grid gap-2">
                <Label>Phone</Label>
                <Input defaultValue={selectedEmployee.phone} />
              </div>

              <div className="grid gap-2">
                <Label>Role</Label>
                <Select defaultValue={selectedEmployee.role}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Frontend Developer">Frontend Developer</SelectItem>
                    <SelectItem value="Backend Engineer">Backend Engineer</SelectItem>
                    <SelectItem value="UI/UX Designer">UI/UX Designer</SelectItem>
                    <SelectItem value="Project Manager">Project Manager</SelectItem>
                    <SelectItem value="QA Engineer">QA Engineer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Department</Label>
                <Select defaultValue={selectedEmployee.department}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Management">Management</SelectItem>
                    <SelectItem value="Quality Assurance">Quality Assurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Age</Label>
                <Input type="number" defaultValue={selectedEmployee.age || ""} />
              </div>

              <div className="grid gap-2">
                <Label>Nationality</Label>
                <Input defaultValue={selectedEmployee.nationality || ""} />
              </div>

              <div className="grid gap-2">
                <Label>Language</Label>
                <Input defaultValue={selectedEmployee.language || ""} />
              </div>

              <div className="grid gap-2">
                <Label>Address</Label>
                <Textarea defaultValue={selectedEmployee.address} />
              </div>

              <div className="grid gap-2">
                <Label>Professional Summary</Label>
                <Textarea
                  defaultValue={selectedEmployee.summary || ""}
                  placeholder="Add notes, achievements, or experience..."
                />
              </div>
            </div>
          )}
          <Separator />
          <DrawerFooter>
            <Button onClick={() => setIsDrawerOpen(false)}>Save Changes</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* ➕ Add Employee Drawer */}
      <Drawer open={isAddDrawerOpen} onOpenChange={setIsAddDrawerOpen}>
        <DrawerContent className="sm:max-w-[420px] border-l bg-background ml-2">
          <DrawerHeader>
            <DrawerTitle>Add Employee</DrawerTitle>
            <DrawerDescription>Fill out the form to create a new employee.</DrawerDescription>
          </DrawerHeader>
          <Separator />

          <div className="px-4 pb-4 overflow-y-auto space-y-3">
            {Object.keys(newEmployee).map((key) => (
              <div className="grid gap-2" key={key}>
                <Label className="capitalize">{key}</Label>
                {key === "address" || key === "summary" ? (
                  <Textarea
                    value={newEmployee[key as keyof typeof newEmployee]}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, [key]: e.target.value })
                    }
                  />
                ) : (
                  <Input
                    value={newEmployee[key as keyof typeof newEmployee]}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, [key]: e.target.value })
                    }
                  />
                )}
              </div>
            ))}
          </div>
          <Separator />
          <DrawerFooter>
            <Button onClick={handleAddEmployee}>Add Employee</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
