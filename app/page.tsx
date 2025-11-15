// app/page.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Check } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground antialiased">
      <header className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/onemanage.png" className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold"/>
          <div className="leading-tight">
            <h1 className="text-lg font-semibold">oneManage</h1>
            <p className="text-xs text-muted-foreground">Simple HR & Task management for small businesses</p>
          </div>
        </div>

        <nav className="flex items-center gap-3">
          <Link href="/"><span className="text-sm hover:underline">Home</span></Link>
          <Link href="/auth/sign-up"><Button size="sm">Get started</Button></Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center py-12">
        <div className="space-y-6">
          <Badge>Built for small teams</Badge>
          <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight">
            oneManage — HR, Tasks, Emails, all in one simple app
          </h2>
          <p className="text-muted-foreground max-w-xl">
            Run your team with clarity. Create tasks, assign employees and track completion, simple — all from a single dashboard built for founders, managers and small businesses.
          </p>

          <div className="flex gap-3">
            <Link href="/auth/sign-up">
              <Button size="lg">Start free</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg">Dashboard</Button>
            </Link>
          </div>

          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-sm">Task management & assignments</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-sm">Simple employee directories</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-sm">Email notifications & reports</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Quick demo</CardTitle>
              <CardDescription>Example task — open & notify team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col gap-3">
                <div>
                  <div className="text-sm font-medium">Go school</div>
                  <div className="text-xs text-muted-foreground">Priority: Medium — Due: 2025-11-01</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm">Complete</Button>
                  <Button size="sm" variant="destructive">Incomplete</Button>
                </div>
              </div>
              <Separator />
              <div className="text-xs text-muted-foreground">
                Assigned to: <strong>Abdul Quddus</strong>, <strong>Ali</strong>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <h3 className="text-2xl font-semibold mb-6">What oneManage gives you</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard title="Tasks" desc="Create, assign and track tasks with deadlines and priorities." />
          <FeatureCard title="Employees" desc="Manage employee profiles, contact info and departments." />
          <FeatureCard title="Notifications" desc="Notify employees by email and track completion." />
          <FeatureCard title="Reporting" desc="Simple charts and stats to monitor your team." />
        </div>
      </section>

      {/* Stats / Callout */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-2 bg-card border border-border rounded-lg p-6">
            <h4 className="text-xl font-semibold">Trusted by small teams</h4>
            <p className="text-muted-foreground mt-2">Built to be lightweight and reliable so your team can focus on what matters.</p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Stat label="Teams" value="128" />
              <Stat label="Tasks/month" value="8,942" />
              <Stat label="Active users" value="2,034" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h4 className="text-lg font-semibold">Ready to grow</h4>
            <p className="text-muted-foreground mt-2">Sign up and get your first team onboarded in minutes.</p>
            <div className="mt-4">
              <Link href="/auth/sign-up"><Button>Get started</Button></Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <img src="/onemanage.png" className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-semibold"/>
            <div>
              <div className="font-medium">oneManage</div>
              <div className="text-xs text-muted-foreground">© {new Date().getFullYear()} oneManage</div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <Link href="/privacy" className="mr-4 hover:underline">Privacy</Link>
            <Link href="/terms" className="hover:underline">Terms</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* small helper components */
function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <h5 className="font-semibold">{title}</h5>
      <p className="text-sm text-muted-foreground mt-2">{desc}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background/40 border border-border rounded-md p-3 min-w-[120px]">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}
