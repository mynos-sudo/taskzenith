"use client";

import { useState, useCallback, useEffect } from "react";
import { kanbanColumns } from "@/lib/data";
import type { Task, TaskStatus, KanbanColumn as KanbanColumnType } from "@/lib/types";
import { KanbanColumn } from "./kanban-column";
import { Skeleton } from "@/components/ui/skeleton";

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
      // Optionally set an error state to display to the user
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, refreshTrigger]);
  
  const moveTask = useCallback((taskId: string, targetColumnId: TaskStatus) => {
    // In a real app, you'd make an API call here to persist the change.
    // For now, we optimistically update the UI.
    setColumns(prevColumns => {
      const newColumns = prevColumns.map(c => ({...c, tasks: [...c.tasks]}));
      let taskToMove: Task | undefined;
      let sourceColumn: KanbanColumnType | undefined;

      // Find and remove task from source column
      for (const col of newColumns) {
        const taskIndex = col.tasks.findIndex(t => t.id === taskId);
        if (taskIndex > -1) {
          sourceColumn = col;
          [taskToMove] = col.tasks.splice(taskIndex, 1);
          break;
        }
      }

      if (!taskToMove || !sourceColumn) {
        return prevColumns; // Should not happen
      }

      // Update task status
      taskToMove.status = targetColumnId;

      // Find target column and add task
      const targetColumn = newColumns.find(col => col.id === targetColumnId);
      if (targetColumn) {
        targetColumn.tasks.push(taskToMove);
      } else {
        // If something goes wrong, return task to source column
        sourceColumn.tasks.push(taskToMove);
        return prevColumns;
      }

      return newColumns;
    });
  }, []);

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
