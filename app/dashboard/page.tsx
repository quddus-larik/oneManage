"use client";

import React, { useEffect, useState } from "react";
import { ChartEmployeesSalary } from "@/components/chart-area-interactive";
import Dashboard from "@/app/provider/ui";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Employee {
  id: string;
  name: string;
  salary: number;
  createdAt?: string;
}

export default function Page() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch("/api/v1/employees", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch employees");
        const result = await res.json();
        setEmployees(result.employees || []);
      } catch (err) {
        console.error("Failed to load employees:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const totalEmployees = employees.length;
  const avgSalary = employees.length
    ? Math.round(employees.reduce((sum, e) => sum + e.salary, 0) / employees.length)
    : 0;

  const newMembers = employees.filter((emp) => {
    const date = emp.createdAt ? new Date(emp.createdAt) : null;
    const days = date ? (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24) : 999;
    return days <= 30; // joined within last month
  }).length;

  const growthRate = totalEmployees > 0 ? ((newMembers / totalEmployees) * 100).toFixed(1) : "0";

  const SectionCard = () => {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {/* Total Members */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Total Members</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {loading ? "..." : totalEmployees}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconTrendingUp />
                +12.5%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="flex gap-2 font-medium">
              Trending up this month <IconTrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground">Members for the last 6 months</div>
          </CardFooter>
        </Card>

        {/* New Members */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>New Members</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {loading ? "..." : newMembers}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                {newMembers > 10 ? <IconTrendingUp /> : <IconTrendingDown />}
                {newMembers > 10 ? "+9%" : "-9%"}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="flex gap-2 font-medium">
              {newMembers > 10 ? (
                <>
                  Up this month <IconTrendingUp className="size-4" />
                </>
              ) : (
                <>
                  Down this month <IconTrendingDown className="size-4" />
                </>
              )}
            </div>
            <div className="text-muted-foreground">Employee acquisition rate</div>
          </CardFooter>
        </Card>

        {/* Reports (Average Salary) */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Average Salary</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {loading ? "..." : `$ ${avgSalary.toLocaleString()}`}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconTrendingUp />
                +5.4%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="flex gap-2 font-medium">
              Salary trend stable <IconTrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground">Consistent pay scale growth</div>
          </CardFooter>
        </Card>

        {/* Growth Rate */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Growth Rate</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {loading ? "..." : `${growthRate}%`}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconTrendingUp />
                +{growthRate}%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="flex gap-2 font-medium">
              Steady performance increase <IconTrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground">Meets growth projections</div>
          </CardFooter>
        </Card>
      </div>
    );
  };

  return (
    <Dashboard>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCard />
            <div className="px-4 lg:px-6">
              <ChartEmployeesSalary />
            </div>
          </div>
        </div>
      </div>
    </Dashboard>
  );
}
