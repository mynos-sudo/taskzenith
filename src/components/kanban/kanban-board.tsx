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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/tasks`);
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const fetchedTasks: Task[] = await response.json();
      setTasks(fetchedTasks);

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

  useEffect(() => {
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
  }, [tasks])
  
  const moveTask = useCallback(async (taskId: string, targetColumnId: TaskStatus) => {
    let taskToMove = tasks.find(t => t.id === taskId);
    if (!taskToMove) return;

    const originalTasks = [...tasks];
    
    // Optimistic UI update
    const updatedTasks = tasks.map(t => 
        t.id === taskId ? { ...t, status: targetColumnId } : t
    );
    setTasks(updatedTasks);

    // API call to persist the change
    try {
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: targetColumnId }),
        });
        if (!response.ok) {
            throw new Error('Failed to update task status');
        }
        // Optionally update the task with the response from the server
        const updatedTaskFromServer = await response.json();
        setTasks(currentTasks => currentTasks.map(t => t.id === taskId ? updatedTaskFromServer : t));

    } catch (error) {
        console.error("Failed to move task", error);
        toast({
            title: "Update Failed",
            description: "Could not update task status. Reverting change.",
            variant: "destructive"
        });
        // Revert UI on failure
        setTasks(originalTasks);
    }

  }, [tasks, toast]);

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
