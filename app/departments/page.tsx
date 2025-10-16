"use client"

import * as React from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ArrowUpRight } from "lucide-react"

export default function DepartmentsPage() {
  const { user } = useUser()
  const router = useRouter() // ✅ moved out of function to prevent re-instantiation

  const [search, setSearch] = React.useState("")
  const [filter, setFilter] = React.useState("All")
  const [departments, setDepartments] = React.useState<any[]>([])
  const [openDialog, setOpenDialog] = React.useState(false)

  const [formData, setFormData] = React.useState({
    name: "",
    type: "",
    description: "",
    professionalDetails: "",
  })

  // 🧩 Fetch user's departments
  React.useEffect(() => {
    if (!user?.primaryEmailAddress?.emailAddress) return

    const fetchDepartments = async () => {
      try {
        const email = user.primaryEmailAddress?.emailAddress
        const res = await fetch(`/api/v1/departments?email=${email}`)
        const data = await res.json()

        if (data.success && Array.isArray(data.data)) {
          setDepartments(data.data)
        } else {
          console.error("❌ Failed to load departments:", data.message)
        }
      } catch (err) {
        console.error("⚠️ Error fetching departments:", err)
      }
    }

    fetchDepartments()
  }, [user])

  // 🔍 Filter + Search logic
  const filteredDepartments = React.useMemo(() => {
    return departments.filter((dept) => {
      const matchesSearch =
        dept.name?.toLowerCase().includes(search.toLowerCase()) ||
        dept.description?.toLowerCase().includes(search.toLowerCase())
      const matchesFilter = filter === "All" ? true : dept.type === filter
      return matchesSearch && matchesFilter
    })
  }, [departments, search, filter])

  // 💾 Save new department
  const handleSave = async () => {
    if (!formData.name.trim()) return
    if (!user?.primaryEmailAddress?.emailAddress) {
      console.warn("⚠️ No logged-in user found.")
      return
    }

    try {
      const payload = {
        email: user.primaryEmailAddress.emailAddress,
        department: {
          name: formData.name.trim(),
          type: formData.type,
          description: formData.description,
          professionalDetails: formData.professionalDetails,
        },
      }

      const res = await fetch("/api/v1/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (data.success) {
        // ✅ Update list dynamically
        setDepartments((prev) => [...prev, data.data])
        setFormData({ name: "", type: "", description: "", professionalDetails: "" })
        setOpenDialog(false)
      } else {
        console.error("❌ Failed to add department:", data.message)
      }
    } catch (err) {
      console.error("⚠️ Error saving department:", err)
    }
  }

  // 🚀 Navigate to department details page
  function handleRoute(id: string, name: string) {
    router.push(`/departments/${name}?id=${id}`)
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* 🏷️ Page Header */}
      <TitleHeader
        label="Departments"
        span="Manage and organize your company's departments."
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

        {/* ➕ Add Department Dialog */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">+ Add Department</Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[420px]">
            <DialogHeader>
              <DialogTitle>Add New Department</DialogTitle>
              <DialogDescription>
                Fill in the details below to create a new department.
              </DialogDescription>
            </DialogHeader>

            <Separator />

            <div className="space-y-3 py-2">
              <div className="grid gap-2">
                <Label>Department Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Engineering"
                />
              </div>

              <div className="grid gap-2">
                <Label>Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(val) => setFormData({ ...formData, type: val })}
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
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Write a short department overview..."
                />
              </div>

              <div className="grid gap-2">
                <Label>Professional Details</Label>
                <Textarea
                  value={formData.professionalDetails}
                  onChange={(e) =>
                    setFormData({ ...formData, professionalDetails: e.target.value })
                  }
                  placeholder="Add strategic or professional details..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleSave}>Add Department</Button>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* 🧱 Departments Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredDepartments.length > 0 ? (
          filteredDepartments.map((dept) => (
            <Card
              key={dept._id || dept.name}
              className="hover:shadow-md transition-all cursor-pointer"
            >
              <CardHeader className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold">{dept.name}</CardTitle>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => handleRoute(dept._id, dept.name)}
                >
                  <ArrowUpRight />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {dept.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    👥 {dept.employees?.length || 0} employees
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
    </div>
  )
}
