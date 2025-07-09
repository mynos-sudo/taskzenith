"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { users } from "@/lib/data";
import type { Task } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";

export default function TasksOverview() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentUser = users[0]; // mock current user

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        // We fetch all tasks and filter client-side for this overview
        const response = await fetch('/api/tasks');
        if (!response.ok) {
            throw new Error('Failed to fetch tasks');
        }
        const allTasks: Task[] = await response.json();
        const myTasks = allTasks
          .filter(task => task.assignees.some(assignee => assignee.id === currentUser.id))
          .filter(task => task.status !== 'done') // Only show active tasks
          .slice(0, 5); // Limit to 5 tasks
        setTasks(myTasks);
      } catch (error) {
        console.error("Failed to fetch tasks for overview", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [currentUser.id]);


  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center p-2">
            <div className="ml-4 space-y-2 w-full">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-5 w-12 ml-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
        <div className="text-center text-muted-foreground py-8">
            <p>You have no active tasks assigned.</p>
            <p className="text-sm">Enjoy your clear schedule!</p>
        </div>
    )
  }

  return (
    <div className="space-y-4">
        {tasks.map((task) => {
            return (
              <Link href={`/dashboard/projects/${task.projectId}/kanban`} key={task.id} passHref>
                <div className="flex items-center p-2 hover:bg-muted/50 rounded-lg cursor-pointer">
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{task.title}</p>
                        <p className="text-sm text-muted-foreground">{task.project?.name}</p>
                    </div>
                    <div className="ml-auto font-medium capitalize text-sm text-muted-foreground">{task.priority}</div>
                </div>
              </Link>
            )
        })}
    </div>
  )
}
