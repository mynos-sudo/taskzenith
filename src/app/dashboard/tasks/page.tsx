
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import type { Task, Project, Priority, TaskStatus } from "@/lib/types";
import { projects, users } from "@/lib/data"; // for getting project name and color
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CreateTaskForm } from "@/components/tasks/create-task-form";
import { TaskDetails } from "@/components/tasks/task-details";


const priorityVariantMap: Record<Priority, BadgeProps["variant"]> = {
    low: "outline",
    medium: "secondary",
    high: "default",
    critical: "destructive",
};

const statusVariantMap: Record<TaskStatus, BadgeProps["variant"]> = {
    "todo": "secondary",
    "in-progress": "default",
    "done": "outline",
    "backlog": "destructive",
};


export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [taskToView, setTaskToView] = useState<Task | null>(null);
  const { toast } = useToast();

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
      toast({
        title: "Error fetching tasks",
        description: "Could not retrieve task data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);
  
  const handleUpdate = () => {
    fetchTasks();
    if (taskToView) {
      // Refresh task details if modal is open
      const updatedTask = tasks.find(t => t.id === taskToView.id);
      setTaskToView(updatedTask || null);
    }
  }

  const handleDelete = async () => {
    if (!taskToDelete) return;
    try {
      const response = await fetch(`/api/tasks/${taskToDelete.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error("Failed to delete task.");
      toast({
        title: "Success",
        description: `Task "${taskToDelete.title}" has been deleted.`,
      });
      fetchTasks();
    } catch (error) {
       toast({
        title: "Error",
        description: "Could not delete the task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setTaskToDelete(null);
    }
  }

  const getProjectById = (projectId: string): Project | undefined => {
    return projects.find(p => p.id === projectId);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-headline">All Tasks</h1>
          <p className="text-muted-foreground">Manage all the tasks from your projects.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
          <CardDescription>
            A list of all tasks across all your projects.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead className="hidden md:table-cell">Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="hidden md:table-cell">Assignees</TableHead>
                <TableHead className="hidden sm:table-cell">Due Date</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-8 w-24" /></TableCell>
                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : (
                tasks.map((task) => {
                  const project = getProjectById(task.projectId);
                  return (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">
                        <button onClick={() => setTaskToView(task)} className="hover:underline text-left">
                          {task.title}
                        </button>
                      </TableCell>
                       <TableCell className="hidden md:table-cell">
                         {project && (
                           <div className="flex items-center gap-2">
                             <span className="h-2 w-2 rounded-full" style={{ backgroundColor: project.color }}></span>
                             <Link href={`/dashboard/projects/${project.id}/kanban`} className="hover:underline text-muted-foreground">
                              {project.name}
                             </Link>
                           </div>
                         )}
                       </TableCell>
                      <TableCell>
                        <Badge variant={statusVariantMap[task.status] || "secondary"} className="capitalize">{task.status.replace('-', ' ')}</Badge>
                      </TableCell>
                       <TableCell>
                        <Badge variant={priorityVariantMap[task.priority] || "default"} className="capitalize">{task.priority}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                         <div className="flex -space-x-2 overflow-hidden">
                            {task.assignees.map((assignee) => (
                            <Avatar key={assignee.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
                                <AvatarImage src={assignee.avatar} />
                                <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            ))}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onSelect={() => setTaskToView(task)}>View Details</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setTaskToEdit(task)}>Edit</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => setTaskToDelete(task)} className="text-destructive">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!taskToEdit} onOpenChange={(isOpen) => !isOpen && setTaskToEdit(null)}>
        <DialogContent className="sm:max-w-[625px]">
          {taskToEdit && (
            <CreateTaskForm 
              task={taskToEdit} 
              projectId={taskToEdit.projectId} 
              allUsers={users}
              onSuccess={() => {
                setTaskToEdit(null);
                fetchTasks();
              }} 
            />
          )}
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!taskToDelete} onOpenChange={(isOpen) => !isOpen && setTaskToDelete(null)}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the task &quot;{taskToDelete?.title}&quot;.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!taskToView} onOpenChange={(isOpen) => !isOpen && setTaskToView(null)}>
        <DialogContent className="sm:max-w-[725px] max-h-[90vh] flex flex-col">
          {taskToView && <TaskDetails task={taskToView} onUpdate={handleUpdate} />}
        </DialogContent>
      </Dialog>

    </div>
  );
}
