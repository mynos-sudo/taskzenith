"use client"

import { useEffect, useState } from "react";
import type { Project } from "@/lib/types";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";

const chartConfig = {
  progress: {
    label: "Progress",
  },
} satisfies ChartConfig;

export default function ProjectsChart() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/projects?limit=5');
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const data = await response.json();
        // Filter out completed projects to keep the chart focused on active work
        setProjects(data.filter((p: Project) => p.status !== 'Completed'));
      } catch (error) {
        console.error("Failed to fetch projects for chart", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const chartData = projects.map(p => ({
      name: p.name,
      progress: p.progress,
      fill: p.color
  }));

  if (isLoading) {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Active Projects Progress</CardTitle>
                <CardDescription>
                    Loading progress of your most recent active projects...
                </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                 <Skeleton className="h-[300px] w-full" />
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>Active Projects Progress</CardTitle>
            <CardDescription>
                Progress of your most recent active projects.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <BarChart
                accessibilityLayer
                data={chartData}
                layout="vertical"
                margin={{
                    left: 0,
                    right: 20,
                }}
            >
                <CartesianGrid horizontal={false} />
                <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 20) + (value.length > 20 ? '...' : '')}
                    className="text-sm font-medium"
                    width={140}
                />
                <XAxis dataKey="progress" type="number" hide />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent 
                        formatter={(value, name, item) => (
                            <div className="flex items-center gap-2 min-w-[200px]">
                                <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: item.payload.fill}} />
                                <div className="flex flex-1 items-center justify-between">
                                  <span className="text-muted-foreground">{item.payload.name}</span>
                                  <span className="font-bold">{`${value}%`}</span>
                                </div>
                            </div>
                        )}
                        hideLabel={true}
                        indicator="dot" 
                     />}
                />
                <Bar dataKey="progress" layout="vertical" radius={5}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill || 'hsl(var(--primary))'} />
                    ))}
                </Bar>
            </BarChart>
            </ChartContainer>
        </CardContent>
    </Card>
  );
}
