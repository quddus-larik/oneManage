"use client"

import * as React from "react"
import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { toast } from "react-toastify"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
}) {
  const router = useRouter()
  const [employees, setEmployees] = React.useState<{ email: string; name: string }[]>([])
  const [selectedEmail, setSelectedEmail] = React.useState("")
  const [message, setMessage] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch("/api/v1/employees")
        const data = await res.json()
        if (data.success) setEmployees(data.data)
      } catch (err) {
        console.error(err)
        toast.error("Failed to fetch employees")
      }
    }
    fetchEmployees()
  }, [])

  const handleSendMail = async () => {
    if (!selectedEmail || !message.trim()) {
      toast.warning("Please select employee and enter message")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/v1/send-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: selectedEmail, message }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("Mail sent successfully!")
        setMessage("")
        setSelectedEmail("")
      } else {
        toast.error(data.error || "Failed to send mail")
      }
    } catch (err) {
      console.error(err)
      toast.error("Error sending mail")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <SidebarMenuButton
                  tooltip="Quick Create"
                  className="bg-primary text-primary-foreground hover:bg-primary/10 min-w-8 duration-200 ease-linear"
                >
                  <IconCirclePlusFilled />
                  <span>Quick Mail</span>
                </SidebarMenuButton>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Quick Mail</DialogTitle>
                  <DialogDescription>Send a quick message to an employee</DialogDescription>
                </DialogHeader>
                <Separator />

                <div className="flex flex-col gap-3 py-2">
                  <div className="grid gap-2">
                    <Label>Select Employee</Label>
                    <Select
                      value={selectedEmail}
                      onValueChange={setSelectedEmail}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((emp) => (
                          <SelectItem key={emp.email} value={emp.email}>
                            {emp.name} ({emp.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label>Message</Label>
                    <Textarea
                      placeholder="Type your message here..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    onClick={handleSendMail}
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send Mail"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
              onClick={()=> window.location.href = "https://mail.google.com/mail/"}
            >
              <IconMail />
              <span className="sr-only">Inbox</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem
              key={item.title}
              onClick={() => router.push(item.url)}
            >
              <SidebarMenuButton tooltip={item.title}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
