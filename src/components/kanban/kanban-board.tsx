"use client";

import { useState, useCallback } from "react";
import { getProjectTasks, kanbanColumns } from "@/lib/data";
import type { Task, TaskStatus, KanbanColumn as KanbanColumnType } from "@/lib/types";
import { KanbanColumn } from "./kanban-column";

export default function KanbanBoard({ projectId }: { projectId: string }) {
  const initialTasks = getProjectTasks(projectId);
  const [columns, setColumns] = useState<KanbanColumnType[]>(() => {
    return kanbanColumns.map(col => ({
        ...col,
        tasks: initialTasks.filter(task => task.status === col.id)
    }))
  });

  const moveTask = useCallback((taskId: string, targetColumnId: TaskStatus) => {
    setColumns(prevColumns => {
      const newColumns = [...prevColumns];
      let taskToMove: Task | undefined;
      let sourceColumnIndex = -1;

      // Find and remove task from source column
      for (let i = 0; i < newColumns.length; i++) {
        const taskIndex = newColumns[i].tasks.findIndex(t => t.id === taskId);
        if (taskIndex > -1) {
          sourceColumnIndex = i;
          [taskToMove] = newColumns[i].tasks.splice(taskIndex, 1);
          break;
        }
      }

      if (!taskToMove || sourceColumnIndex === -1) {
        return prevColumns; // Should not happen
      }

      // Update task status
      taskToMove.status = targetColumnId;

      // Find target column and add task
      const targetColumnIndex = newColumns.findIndex(col => col.id === targetColumnId);
      if (targetColumnIndex > -1) {
        newColumns[targetColumnIndex].tasks.push(taskToMove);
      } else {
        // If something goes wrong, return task to source column
        newColumns[sourceColumnIndex].tasks.push(taskToMove);
        return prevColumns;
      }

      return newColumns;
    });
  }, []);

  return (
    <div className="flex gap-4 p-1 pb-4 h-full">
      {columns.map((column) => (
        <KanbanColumn
          key={column.id}
          column={column}
          moveTask={moveTask}
        />
      ))}
    </div>
  );
}
