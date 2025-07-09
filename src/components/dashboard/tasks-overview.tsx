"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import type { Task, User } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";

export default function TasksOverview() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchUserAndTasks = async () => {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
          setIsLoading(false);
          return;
      }
      
      // We don't have the full profile here, but the id is enough for the query.
      const simplifiedUser = { id: user.id, name: '', email: user.email || '', avatar: '' };
      setCurrentUser(simplifiedUser);

      // We fetch all tasks and filter client-side for this overview
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*, projects(name, color), task_assignees!inner(user_id)')
          .eq('task_assignees.user_id', user.id)
          .neq('status', 'done')
          .limit(5);

        if (error) throw error;
        
        const myTasks: Task[] = data.map((task: any) => ({
            id: task.id,
            title: task.title,
            projectId: task.project_id,
            priority: task.priority,
            project: task.projects,
            // The full task properties are not all needed for this component,
            // so we can partially fill them.
            status: 'todo',
            assignees: [],
            createdAt: '',
            updatedAt: '',
            comments: []
        }));
        
        setTasks(myTasks);
      } catch (error) {
        console.error("Failed to fetch tasks for overview", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndTasks();
  }, []);


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
