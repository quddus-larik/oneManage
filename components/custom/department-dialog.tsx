"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import * as React from "react"

export function AddDepartmentDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [depData, setDepData] = React.useState({
    name: "",
    description: "",
    professionalDetails: "",
  })

  const handleAdd = () => {
    console.log(depData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Department</DialogTitle>
          <DialogDescription>Enter details for the new department.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-3">
          <Label>Department Name</Label>
          <Input value={depData.name} onChange={(e) => setDepData({ ...depData, name: e.target.value })} />
          <Label>Description</Label>
          <Textarea value={depData.description} onChange={(e) => setDepData({ ...depData, description: e.target.value })} />
          <Label>Professional Details</Label>
          <Textarea value={depData.professionalDetails} onChange={(e) => setDepData({ ...depData, professionalDetails: e.target.value })} />
        </div>
        <DialogFooter>
          <Button onClick={handleAdd}>Add Department</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
