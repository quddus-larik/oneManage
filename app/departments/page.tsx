"use client"

import * as React from "react"
import { TitleHeader } from "@/components/custom/main-heading"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"

// 🧱 Mock Departments Data
const initialDepartments = [
  {
    id: 1,
    name: "Engineering",
    type: "Technical",
    description: "Handles product development and code maintenance.",
    employees: 25,
    professionalDetails: "Core product and infrastructure team.",
  },
  {
    id: 2,
    name: "Human Resources",
    type: "Administrative",
    description: "Manages recruitment and employee relations.",
    employees: 8,
    professionalDetails: "Responsible for policies, onboarding, and culture.",
  },
  {
    id: 3,
    name: "Design",
    type: "Creative",
    description: "Focuses on product design and user experience.",
    employees: 10,
    professionalDetails: "UI/UX and brand visual identity.",
  },
  {
    id: 4,
    name: "Sales & Marketing",
    type: "Business",
    description: "Responsible for growth and client relationships.",
    employees: 12,
    professionalDetails: "Leads campaigns, partnerships, and sales funnels.",
  },
  {
    id: 5,
    name: "Finance",
    type: "Administrative",
    description: "Oversees budgeting and payroll.",
    employees: 6,
    professionalDetails: "Manages accounts, reports, and compliance.",
  },
]

export default function Page() {
  const [search, setSearch] = React.useState("")
  const [filter, setFilter] = React.useState("All")
  const [departments, setDepartments] = React.useState(initialDepartments)
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)
  const [editingDept, setEditingDept] = React.useState<any>(null)

  const [formData, setFormData] = React.useState({
    name: "",
    type: "",
    description: "",
    professionalDetails: "",
  })

  // 🔍 Filter + Search logic
  const filteredDepartments = departments.filter((dept) => {
    const matchesSearch =
      dept.name.toLowerCase().includes(search.toLowerCase()) ||
      dept.description.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === "All" ? true : dept.type === filter
    return matchesSearch && matchesFilter
  })

  // 🧩 Open Drawer for Add or Edit
  const openDrawer = (dept?: any) => {
    if (dept) {
      setEditingDept(dept)
      setFormData({
        name: dept.name,
        type: dept.type,
        description: dept.description,
        professionalDetails: dept.professionalDetails || "",
      })
    } else {
      setEditingDept(null)
      setFormData({
        name: "",
        type: "",
        description: "",
        professionalDetails: "",
      })
    }
    setIsDrawerOpen(true)
  }

  // 💾 Save or Update Department
  const handleSave = () => {
    if (!formData.name.trim()) return

    if (editingDept) {
      setDepartments((prev) =>
        prev.map((d) =>
          d.id === editingDept.id ? { ...d, ...formData } : d
        )
      )
    } else {
      const newDepartment = {
        id: departments.length + 1,
        name: formData.name,
        type: formData.type,
        description: formData.description,
        employees: Math.floor(Math.random() * 10) + 3,
        professionalDetails: formData.professionalDetails,
      }
      setDepartments([...departments, newDepartment])
    }

    setIsDrawerOpen(false)
    setEditingDept(null)
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* 🏷️ Page Header */}
      <TitleHeader
        label="Departments"
        span="Manage your departments across employees."
      />

      {/* 🔍 Search + Filter + Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <Input
            type="text"
            placeholder="Search departments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Select onValueChange={setFilter} defaultValue="All">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Technical">Technical</SelectItem>
              <SelectItem value="Administrative">Administrative</SelectItem>
              <SelectItem value="Creative">Creative</SelectItem>
              <SelectItem value="Business">Business</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ➕ Add Department Button */}
        <Button className="w-full sm:w-auto" onClick={() => openDrawer()}>
          + Add Department
        </Button>
      </div>

      {/* 🧱 Departments Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredDepartments.length > 0 ? (
          filteredDepartments.map((dept) => (
            <Card key={dept.id} className="hover:shadow-md transition-all">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex justify-between">
                  {dept.name}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openDrawer(dept)}
                  >
                    Edit
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {dept.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    👥 {dept.employees} employees
                  </span>
                  <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md">
                    {dept.type}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground text-center col-span-full py-10">
            No departments found.
          </p>
        )}
      </div>

      {/* 🧩 Add/Edit Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="sm:max-w-[420px] ml-2 border-l bg-background">
          <DrawerHeader>
            <DrawerTitle>
              {editingDept ? "Edit Department" : "Add New Department"}
            </DrawerTitle>
            <DrawerDescription>
              {editingDept
                ? "Update the department information below."
                : "Fill in the details to create a new department."}
            </DrawerDescription>
          </DrawerHeader>

          <Separator />

          <div className="px-4 pb-4 max-h-[65vh] overflow-y-auto space-y-3">
            <div className="grid gap-2">
              <Label>Department Name</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Engineering"
              />
            </div>

            <div className="grid gap-2">
              <Label>Type</Label>
              <Select
                value={formData.type}
                onValueChange={(val) =>
                  setFormData({ ...formData, type: val })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technical">Technical</SelectItem>
                  <SelectItem value="Administrative">Administrative</SelectItem>
                  <SelectItem value="Creative">Creative</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Write a short department overview..."
              />
            </div>

            <div className="grid gap-2">
              <Label>Professional Details</Label>
              <Textarea
                value={formData.professionalDetails}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    professionalDetails: e.target.value,
                  })
                }
                placeholder="Add strategic or professional details..."
              />
            </div>
          </div>

          <Separator />

          <DrawerFooter>
            <Button onClick={handleSave}>
              {editingDept ? "Save Changes" : "Add Department"}
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
