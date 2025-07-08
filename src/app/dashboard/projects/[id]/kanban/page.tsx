"use client";

import { useEffect, useState, use } from "react";
import type { Project, Task } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { users } from "@/lib/data";
import { Filter, PlusCircle, Users, Loader2 } from "lucide-react";
import KanbanBoard from "@/components/kanban/kanban-board";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateTaskForm } from "@/components/tasks/create-task-form";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskDetails } from "@/components/tasks/task-details";

export default function KanbanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateTaskOpen, setCreateTaskOpen] = useState(false);
  const [tasksVersion, setTasksVersion] = useState(0);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleBoardUpdate = () => {
    setTasksVersion(v => v + 1);
    setCreateTaskOpen(false);
    if (selectedTask) {
      setSelectedTask(null);
    }
  };

  useEffect(() => {
    const fetchProject = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) {
          if (response.status === 404) {
             throw new Error("Project not found");
          }
          throw new Error("Failed to fetch project data");
        }
        const data = await response.json();
        setProject(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-theme(spacing.24))]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-center text-destructive bg-destructive/10 rounded-md">Error: {error}</div>;
  }

  if (!project) {
    return <div>Project could not be loaded.</div>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-[calc(100vh-theme(spacing.24))]">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold font-headline">{project.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <div className="flex -space-x-2 overflow-hidden">
                {project.members.map((member) => (
                  <Avatar
                    key={member.user.id}
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-background"
                  >
                    <AvatarImage src={member.user.avatar} />
                    <AvatarFallback>{member.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Manage Members
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Dialog open={isCreateTaskOpen} onOpenChange={setCreateTaskOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  New Task
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[625px] max-h-[90vh] flex flex-col">
                <CreateTaskForm
                  projectId={project.id}
                  allUsers={users}
                  onSuccess={handleBoardUpdate}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          <KanbanBoard projectId={project.id} refreshTrigger={tasksVersion} onTaskSelect={setSelectedTask} />
        </div>
        
        <Dialog open={!!selectedTask} onOpenChange={(isOpen) => !isOpen && setSelectedTask(null)}>
          <DialogContent className="sm:max-w-[725px] max-h-[90vh] flex flex-col">
              {selectedTask && <TaskDetails task={selectedTask} onUpdate={handleBoardUpdate} />}
          </DialogContent>
        </Dialog>

      </div>
    </DndProvider>
  );
}
