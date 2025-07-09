"use client";

import { useState, useCallback, useEffect } from "react";
import { kanbanColumns } from "@/lib/data";
import type { Task, TaskStatus, KanbanColumn as KanbanColumnType } from "@/lib/types";
import { KanbanColumn } from "./kanban-column";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function KanbanBoard({ 
  projectId, 
  refreshTrigger,
  onTaskSelect
}: { 
  projectId: string, 
  refreshTrigger: number,
  onTaskSelect: (task: Task) => void;
}) {
  const [columns, setColumns] = useState<KanbanColumnType[]>(() => 
    kanbanColumns.map(col => ({ ...col, tasks: [] }))
  );
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/tasks`);
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const tasks: Task[] = await response.json();
      setColumns(prevColumns => {
        const columnsMap = new Map<TaskStatus, Task[]>();
        prevColumns.forEach(col => columnsMap.set(col.id, []));
        tasks.forEach(task => {
            if (columnsMap.has(task.status)) {
                columnsMap.get(task.status)!.push(task);
            }
        });
        return prevColumns.map(col => ({
          ...col,
          tasks: columnsMap.get(col.id) || []
        }));
      });
    } catch (error) {
      console.error("Failed to fetch tasks", error);
      toast({
          title: "Error",
          description: "Could not fetch tasks for this project.",
          variant: "destructive"
      })
    } finally {
      setIsLoading(false);
    }
  }, [projectId, toast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, refreshTrigger]);
  
  const moveTask = useCallback(async (taskId: string, targetColumnId: TaskStatus) => {
    let originalColumns = columns;
    // Optimistic UI update
    let taskToMove: Task | undefined;

    const newColumns = columns.map(col => {
        const taskIndex = col.tasks.findIndex(t => t.id === taskId);
        if (taskIndex > -1) {
            taskToMove = col.tasks[taskIndex];
            col.tasks.splice(taskIndex, 1);
        }
        return col;
    });

    if (taskToMove) {
        taskToMove.status = targetColumnId;
        const targetColumn = newColumns.find(col => col.id === targetColumnId);
        targetColumn?.tasks.push(taskToMove);
        setColumns(newColumns);
    } else {
        return; // Should not happen
    }

    // API call to persist the change
    try {
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: targetColumnId, title: taskToMove.title, priority: taskToMove.priority }), // Send required fields
        });
        if (!response.ok) {
            throw new Error('Failed to update task status');
        }
    } catch (error) {
        console.error("Failed to move task", error);
        toast({
            title: "Update Failed",
            description: "Could not update task status. Reverting change.",
            variant: "destructive"
        });
        // Revert UI on failure
        setColumns(originalColumns);
    }

  }, [columns, toast]);

  if (isLoading) {
    return (
      <div className="flex gap-4 p-1 pb-4 h-full">
        {kanbanColumns.map(column => (
          <div key={column.id} className="flex flex-col w-72 shrink-0 bg-muted/50 rounded-lg p-2">
            <div className="flex items-center justify-between p-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-8 rounded-full" />
            </div>
            <div className="flex-1 overflow-y-auto p-1 space-y-2">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-4 p-1 pb-4 h-full">
      {columns.map((column) => (
        <KanbanColumn
          key={column.id}
          column={column}
          moveTask={moveTask}
          onCardClick={onTaskSelect}
        />
      ))}
    </div>
  );
}
