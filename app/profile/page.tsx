"use client";

import { useUser } from "@clerk/nextjs";
import Dashboard from "@/app/provider/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Mail, CalendarDays, User } from "lucide-react";
import { IconBrandGoogleFilled } from "@tabler/icons-react";

export default function Page() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return <div className="p-8">Loading...</div>;
  if (!user) return <div className="p-8 text-red-500">User not found</div>;

  return (
    <Dashboard>
      <div className="max-w-3xl mx-auto py-12 px-4 font-[Poppins]">
        <div className="bg-card border border-border rounded-2xl shadow-sm p-8">
          {/* Profile Header */}
          <div className="flex items-center space-x-6">
            <img
              src={user.imageUrl || "/default-avatar.png"}
              alt="Profile"
              className="w-24 h-24 rounded-xl shadow-lg object-cover"
            />
            <div>
              <h2 className="text-3xl font-semibold">{user.fullName || "No Name"}</h2>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <Mail size={16} /> {user.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Profile Details */}
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-muted-foreground flex items-center gap-2">
                <User size={16} /> Username
              </label>
              <Input
                value={user.fullName || "—"}
                readOnly
                className="bg-background border-border"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-muted-foreground flex items-center gap-2">
                <CalendarDays size={16} /> Joined At
              </label>
              <Input
                value={
                  user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "—"
                }
                readOnly
                className="bg-background border-border"
              />
            </div>
          </div>

          {/* Button Section */}
          <div className="flex justify-end mt-8">
            <Button className="px-6" variant={"outline"}><IconBrandGoogleFilled/>Google Connected</Button>
            <Button className="px-6 ml-2">Logout</Button>
          </div>
        </div>
      </div>
    </Dashboard>
  );
}
