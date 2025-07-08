"use client";

import { useDrop } from "react-dnd";
import type { KanbanColumn as KanbanColumnType, Task, TaskStatus } from "@/lib/types";
import { KanbanCard } from "./kanban-card";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  column: KanbanColumnType;
  moveTask: (taskId: string, columnId: TaskStatus) => void;
}

export function KanbanColumn({ column, moveTask }: KanbanColumnProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "card",
    drop: (item: Task) => moveTask(item.id, column.id),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={cn(
        "flex flex-col w-72 shrink-0 bg-muted/50 rounded-lg p-2 transition-colors",
        isOver && "bg-accent/20"
      )}
    >
      <div className="flex items-center justify-between p-2">
        <h3 className="font-semibold text-lg">{column.title}</h3>
        <span className="text-sm font-semibold text-muted-foreground bg-background rounded-full px-2 py-1">
          {column.tasks.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-1 space-y-2">
        {column.tasks.map((task) => (
          <KanbanCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}
