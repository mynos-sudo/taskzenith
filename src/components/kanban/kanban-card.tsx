"use client";

import { useDrag } from "react-dnd";
import { format } from "date-fns";
import { CalendarDays, MessageSquare } from "lucide-react";
import type { Priority, Task } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface KanbanCardProps {
  task: Task;
  onCardClick: (task: Task) => void;
}

const priorityVariantMap: Record<Priority, BadgeProps["variant"]> = {
    low: "outline",
    medium: "secondary",
    high: "default",
    critical: "destructive",
}

export function KanbanCard({ task, onCardClick }: KanbanCardProps) {
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
      onClick={() => onCardClick(task)}
      className={`cursor-pointer ${isDragging ? "opacity-50" : "opacity-100"}`}
    >
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-base">{task.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-3">
        {task.description && (
          <p className="text-xs text-muted-foreground truncate">{task.description}</p>
        )}
        <div className="flex items-center text-xs text-muted-foreground">
            {task.dueDate && (
            <>
                <CalendarDays className="h-4 w-4 mr-1.5" />
                <span>Due on {format(new Date(task.dueDate), "MMM d, yyyy")}</span>
            </>
            )}
        </div>
        <div className="flex items-center justify-between">
            <Badge variant={priorityVariantMap[task.priority] || "default"} className="capitalize">{task.priority}</Badge>
            <div className="flex items-center gap-2">
                {task.comments.length > 0 && (
                    <div className="flex items-center text-xs text-muted-foreground">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        <span>{task.comments.length}</span>
                    </div>
                )}
                <div className="flex -space-x-2 overflow-hidden">
                    {task.assignees.map((assignee) => (
                        <Avatar key={assignee.id} className="inline-block h-6 w-6 rounded-full ring-2 ring-background">
                            <AvatarImage src={assignee.avatar} />
                            <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    ))}
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
