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
  added_at?: string;
}

export default function Page() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Employees
  useEffect(() => {
    let active = true;
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/v1/employees", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch employees");
        const result = await res.json();
        setEmployees(result.data)
      } catch (err: any) {
        console.error("Fetch error:", err);
        if (active) setError("Unable to load employee data.");
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchEmployees();
    return () => {
      active = false;
    };
  }, []);

  // Derived Metrics
  const totalEmployees = employees?.length || 0;
  const avgSalary = totalEmployees
    ? Math.round(employees.reduce((sum, e) => sum + e.salary, 0) / totalEmployees)
    : 0;

  const newMembers = employees.filter((emp) => {
    if (!emp.added_at) return false;
    const diff = Date.now() - new Date(emp.added_at).getTime();
    return diff / (1000 * 60 * 60 * 24) <= 15;
  }).length;

  const growthRate =
    totalEmployees > 0 ? ((newMembers / totalEmployees) * 100).toFixed(1) : "0";

  const statCards = [
    {
      title: "Total Members",
      value: totalEmployees.toString(),
      trend: "+12.5%",
      icon: <IconTrendingUp />,
      footer: "Members for the last 6 months",
      subtext: "Trending up this month",
    },
    {
      title: "New Members",
      value: newMembers,
      trend: newMembers > 10 ? "+9%" : "-9%",
      icon: newMembers > 10 ? <IconTrendingUp /> : <IconTrendingDown />,
      footer: "Employee acquisition rate",
      subtext:
        newMembers > 10 ? "Up this month" : "Down this month",
    },
    {
      title: "Average Salary",
      value: `$ ${avgSalary.toLocaleString()}`,
      trend: "+5.4%",
      icon: <IconTrendingUp />,
      footer: "Consistent pay scale growth",
      subtext: "Salary trend stable",
    },
    {
      title: "Growth Rate",
      value: `${growthRate}%`,
      trend: `+${growthRate}%`,
      icon: <IconTrendingUp />,
      footer: "Meets growth projections",
      subtext: "Steady performance increase",
    },
  ];

  return (
    <Dashboard>
      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-6 py-6 px-4 lg:px-6">
          {/* Loading / Error */}
          {error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {statCards.map((card, i) => (
                <Card key={i}>
                  <CardHeader>
                    <CardDescription>{card.title}</CardDescription>
                    <CardTitle className="text-3xl font-semibold tabular-nums">
                      {loading ? (
                        <div className="h-6 w-24 animate-pulse rounded bg-muted" />
                      ) : (
                        card.value
                      )}
                    </CardTitle>
                    <CardAction>
                      <Badge variant="outline">
                        {card.icon}
                        {card.trend}
                      </Badge>
                    </CardAction>
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="flex gap-2 font-medium">
                      {card.subtext} {card.icon}
                    </div>
                    <div className="text-muted-foreground">{card.footer}</div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {/* Chart Section */}
          {!error && (
            <div className="mt-6">
              <ChartEmployeesSalary />
            </div>
          )}
        </div>
      </div>
    </Dashboard>
  );
}
