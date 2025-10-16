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

type Employee = {
  name: string
  email: string
  phone?: string
  role?: string
  department?: string // store department _id
  age?: number
  nationality?: string
  language?: string
  address?: string
  summary?: string
  salary?: string
}

type Department = {
  _id: string
  name: string
}

export function EmployeeTable({ userEmail }: { userEmail: string }) {
  const [employees, setEmployees] = React.useState<Employee[]>([])
  const [departments, setDepartments] = React.useState<Department[]>([])
  const [search, setSearch] = React.useState("")
  const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)
  const [isAddDrawerOpen, setIsAddDrawerOpen] = React.useState(false)
  const [newEmployee, setNewEmployee] = React.useState<Employee>({
    name: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    age: undefined,
    nationality: "",
    language: "",
    address: "",
    summary: "",
    salary: "$0",
  })

  // 🔹 Fetch employees
  const fetchEmployees = async () => {
    try {
      const res = await fetch("/api/v1/employees")
      const data = await res.json()
      if (data.success) setEmployees(data.data)
    } catch (err) {
      console.error("Failed to fetch employees", err)
    }
  }

  // 🔹 Fetch departments
  const fetchDepartments = async () => {
    try {
      const res = await fetch("/api/v1/departments")
      const data = await res.json()
      if (data.success) setDepartments(data.data)
    } catch (err) {
      console.error("Failed to fetch departments", err)
    }
  }

  React.useEffect(() => {
    fetchEmployees()
    fetchDepartments()
  }, [])

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name?.toLowerCase().includes(search.toLowerCase()) ||
      emp.email?.toLowerCase().includes(search.toLowerCase()) ||
      emp.role?.toLowerCase().includes(search.toLowerCase())
  )

  const handleAddEmployee = async () => {
    try {
      const res = await fetch("/api/v1/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employee: newEmployee }),
      })
      const data = await res.json()
      if (data.success) {
        setEmployees((prev) => [...prev, data.data])
        setIsAddDrawerOpen(false)
        setNewEmployee({
          name: "",
          email: "",
          phone: "",
          role: "",
          department: "",
          age: undefined,
          nationality: "",
          language: "",
          address: "",
          summary: "",
          salary: "$0",
        })
      }
    } catch (err) {
      console.error("Failed to add employee", err)
    }
  }

  const handleUpdateEmployee = async (emp: Employee) => {
    try {
      const res = await fetch("/api/v1/employees", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employee: emp }),
      })
      const data = await res.json()
      if (data.success) {
        setEmployees((prev) => prev.map((e) => (e.email === emp.email ? emp : e)))
        setIsDrawerOpen(false)
      }
    } catch (err) {
      console.error("Failed to update employee", err)
    }
  }

  const handleDeleteEmployee = async (empEmail: string) => {
    try {
      const res = await fetch(`/api/v1/employees?employeeEmail=${empEmail}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (data.success) {
        setEmployees((prev) => prev.filter((e) => e.email !== empEmail))
      }
    } catch (err) {
      console.error("Failed to delete employee", err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Search + Add */}
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

      {/* Table */}
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
          {filteredEmployees.length ? (
            filteredEmployees.map((emp) => (
              <TableRow key={emp.email}>
                <TableCell>{emp.name}</TableCell>
                <TableCell>{emp.email}</TableCell>
                <TableCell>{emp.phone}</TableCell>
                <TableCell>{emp.role}</TableCell>
                <TableCell>
                  {departments.find((d) => d._id === emp.department)?.name || ""}
                </TableCell>
                <TableCell>{emp.salary}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedEmployee(emp) || setIsDrawerOpen(true)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteEmployee(emp.email)}
                  >
                    Delete
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

      {/* Add Employee Drawer */}
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
                {key === "department" ? (
                  <Select
                    value={newEmployee.department}
                    onValueChange={(val) =>
                      setNewEmployee({ ...newEmployee, department: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => (
                        <SelectItem key={d._id} value={d._id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : key === "address" || key === "summary" ? (
                  <Textarea
                    value={newEmployee[key as keyof Employee] || ""}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, [key]: e.target.value })
                    }
                  />
                ) : (
                  <Input
                    value={newEmployee[key as keyof Employee] || ""}
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

      {/* Edit Employee Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="sm:max-w-[420px] ml-2 border-l bg-background">
          <DrawerHeader>
            <DrawerTitle>Edit Employee</DrawerTitle>
            <DrawerDescription>Update employee information below.</DrawerDescription>
          </DrawerHeader>
          <Separator />
          {selectedEmployee && (
            <div className="px-4 pb-4 max-h-[65vh] overflow-y-auto space-y-3">
              {Object.keys(selectedEmployee).map((key) => (
                <div className="grid gap-2" key={key}>
                  <Label className="capitalize">{key}</Label>
                  {key === "department" ? (
                    <Select
                      value={selectedEmployee.department || ""}
                      onValueChange={(val) =>
                        setSelectedEmployee({ ...selectedEmployee, department: val })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((d) => (
                          <SelectItem key={d._id} value={d._id}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : key === "address" || key === "summary" ? (
                    <Textarea
                      defaultValue={selectedEmployee[key as keyof Employee] as string}
                      onChange={(e) =>
                        setSelectedEmployee({ ...selectedEmployee, [key]: e.target.value })
                      }
                    />
                  ) : (
                    <Input
                      defaultValue={selectedEmployee[key as keyof Employee] as string}
                      onChange={(e) =>
                        setSelectedEmployee({ ...selectedEmployee, [key]: e.target.value })
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          )}
          <Separator />
          <DrawerFooter>
            <Button onClick={() => selectedEmployee && handleUpdateEmployee(selectedEmployee)}>
              Save Changes
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
