"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  salary: {
    label: "Salary",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

interface Employee {
  name: string;
  salary: number;
}

export function ChartEmployeesSalary() {
  const [data, setData] = React.useState<Employee[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch("/api/v1/employees", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch employees");

        const result = await res.json();
        const employees = result.employees || [];

        // Format data for recharts
        const chartData = employees.map((emp: any) => ({
          name: emp.name,
          salary: emp.salary,
        }));

        setData(chartData);
      } catch (err) {
        console.error("Failed to load employees:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Employees Salary Chart</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Employees Salary Comparison</CardTitle>
        <CardDescription>Compare employee salaries visually</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
          <AreaChart
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
          >
            <defs>
              <linearGradient id="fillSalary" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-salary)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-salary)" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="salary"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              label={{ value: "Salary", position: "insideBottom", dy: 10 }}
            />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              axisLine={false}
              width={100}
            />

            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="salary"
              type="monotone"
              fill="url(#fillSalary)"
              stroke="var(--color-salary)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
