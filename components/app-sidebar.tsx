"use client"

import React, { useEffect, useMemo } from "react"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconListDetails,
  IconReport,
} from "@tabler/icons-react"
import { useUser } from "@clerk/nextjs"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// ---- Static Nav Data ----
const NAV_DATA = {
  navMain: [
    { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
    { title: "Employees", url: "/employees", icon: IconListDetails },
    { title: "Departments", url: "/departments", icon: IconChartBar },
    { title: "Tasks", url: "/tasks", icon: IconFolder },
  ],
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { isLoaded, isSignedIn, user } = useUser()

  // ---- Memoized User Object ----
  const userData = useMemo(
    () =>
      user
        ? {
            name: user.firstName || "User",
            email: user.primaryEmailAddress?.emailAddress || "",
            avatar: user.imageUrl || "",
          }
        : null,
    [user]
  )

  // ---- Initialize user in DB ----
  useEffect(() => {
    if (!userData) return

    const addUser = async () => {
      try {
        const query = new URLSearchParams({
          name: userData.name,
          email: userData.email,
          avatar: userData.avatar,
        })

        const res = await fetch(`/api/v1/init-user?${query.toString()}`, {
          method: "POST",
        })

        if (!res.ok) throw new Error("Failed to initialize user")
        console.log("User initialized successfully")
      } catch (error) {
        console.error("User init error:", error)
      }
    }

    addUser()
  }, [userData])

  // ---- Return ----
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      {/* Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="/dashboard" className="flex items-center gap-2">
                <img src="/onemanage.svg" alt="Logo" className="h-6" />
                <span className="text-base font-semibold">OneManage</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent>
        <NavMain items={NAV_DATA.navMain} />
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>
        {userData && <NavUser user={userData as any} />}
      </SidebarFooter>
    </Sidebar>
  )
}
