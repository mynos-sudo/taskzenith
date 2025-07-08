"use client";

import { useDrag } from "react-dnd";
import type { Priority, Task } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface KanbanCardProps {
  task: Task;
}

const priorityVariantMap: Record<Priority, BadgeProps["variant"]> = {
    low: "outline",
    medium: "secondary",
    high: "default",
    critical: "destructive",
}

export function KanbanCard({ task }: KanbanCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "card",
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <Card
      ref={drag}
      className={`cursor-grab ${isDragging ? "opacity-50" : "opacity-100"}`}
    >
      <CardHeader className="p-4">
        <CardTitle className="text-base">{task.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-center justify-between">
            <Badge variant={priorityVariantMap[task.priority] || "default"}>{task.priority}</Badge>
            <div className="flex -space-x-2 overflow-hidden">
                {task.assignees.map((assignee) => (
                    <Avatar key={assignee.id} className="inline-block h-6 w-6 rounded-full ring-2 ring-background">
                        <AvatarImage src={assignee.avatar} />
                        <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                ))}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
