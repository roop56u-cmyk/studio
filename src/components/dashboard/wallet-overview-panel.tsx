
"use client";

import React from "react";
import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { useWallet } from "@/contexts/WalletContext";
import { ScrollArea } from "../ui/scroll-area";
import { format, subDays } from "date-fns";

export function WalletOverviewPanel() {
  const { mainBalance, taskRewardsBalance, interestEarningsBalance, completedTasks } = useWallet();

  const walletData = [
    { name: "Main Balance", value: mainBalance, fill: "hsl(var(--chart-1))" },
    { name: "Task Rewards", value: taskRewardsBalance, fill: "hsl(var(--chart-2))" },
    { name: "Interest Earnings", value: interestEarningsBalance, fill: "hsl(var(--chart-3))" },
  ];

  const chartConfig = {
    balance: {
      label: "Balance",
    },
    main: {
      label: "Main",
      color: "hsl(var(--chart-1))",
    },
    task: {
      label: "Task",
      color: "hsl(var(--chart-2))",
    },
    interest: {
      label: "Interest",
      color: "hsl(var(--chart-3))",
    },
    earnings: {
        label: "Earnings",
        color: "hsl(var(--chart-2))",
    }
  };

  const weeklyEarningsData = React.useMemo(() => {
    const today = new Date();
    const data = Array.from({ length: 7 }).map((_, i) => {
        const date = subDays(today, i);
        const day = format(date, 'eee');
        const earnings = completedTasks
            .filter(task => format(new Date(task.completedAt), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
            .reduce((sum, task) => sum + task.earnings, 0);
        return { day, earnings: parseFloat(earnings.toFixed(2)) };
    }).reverse();
    return data;
  }, [completedTasks]);

  return (
    <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="grid gap-6 pr-6">
            <Card>
                <CardHeader>
                <CardTitle>Fund Distribution</CardTitle>
                <CardDescription>A breakdown of your wallet balances.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[250px]">
                    <PieChart>
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie data={walletData} dataKey="value" nameKey="name" innerRadius={60} />
                     <ChartLegend
                        content={<ChartLegendContent nameKey="name" />}
                        className="-mt-4"
                    />
                    </PieChart>
                </ChartContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                <CardTitle>Weekly Task Earnings</CardTitle>
                <CardDescription>Your total task earnings over the last 7 days.</CardDescription>
                </CardHeader>
                <CardContent>
                <ChartContainer config={chartConfig} className="h-[200px] w-full">
                    <BarChart accessibilityLayer data={weeklyEarningsData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="day"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="earnings" fill="var(--color-earnings)" radius={4} />
                    </BarChart>
                </ChartContainer>
                </CardContent>
            </Card>
        </div>
    </ScrollArea>
  );
}
