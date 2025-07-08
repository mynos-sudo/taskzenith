"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import type { Project } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
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

import { CreateProjectForm } from "@/components/projects/create-project-form";
import { useToast } from "@/hooks/use-toast";

const statusVariantMap: { [key: string]: "default" | "secondary" | "destructive" } = {
    "On Track": "default",
    "At Risk": "secondary",
    "Off Track": "destructive",
    "Completed": "default",
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateProjectOpen, setCreateProjectOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const { toast } = useToast();

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("Failed to fetch projects", error);
      toast({
        title: "Error fetching projects",
        description: "Could not retrieve project data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);
  
  const handleSuccess = () => {
    fetchProjects();
  }
  
  const handleDelete = async () => {
    if (!projectToDelete) return;
    try {
      const response = await fetch(`/api/projects/${projectToDelete.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error("Failed to delete project.");
      toast({
        title: "Success",
        description: `Project "${projectToDelete.name}" has been deleted.`,
      });
      fetchProjects();
    } catch (error) {
       toast({
        title: "Error",
        description: "Could not delete the project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProjectToDelete(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-headline">All Projects</h1>
          <p className="text-muted-foreground">Manage all your team's projects here.</p>
        </div>
        <Dialog open={isCreateProjectOpen} onOpenChange={setCreateProjectOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <CreateProjectForm
              onSuccess={() => {
                handleSuccess();
                setCreateProjectOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
          <CardDescription>
            A list of all projects in your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Members</TableHead>
                <TableHead className="hidden md:table-cell">Progress</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-8 w-32" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-36" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : (
                projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: project.color }}></span>
                        <Link href={`/dashboard/projects/${project.id}/kanban`} className="hover:underline">
                          {project.name}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={project.status === 'Completed' ? "outline" : statusVariantMap[project.status] || "default"}>{project.status}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                       <div className="flex -space-x-2 overflow-hidden">
                          {project.members.map((member) => (
                          <Avatar key={member.user.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
                              <AvatarImage src={member.user.avatar} />
                              <AvatarFallback>{member.user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          ))}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                          <Progress value={project.progress} className="h-2 w-24" />
                          <span>{project.progress}%</span>
                      </div>
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
                          <DropdownMenuItem onSelect={() => setProjectToEdit(project)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Archive</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onSelect={() => setProjectToDelete(project)} className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={!!projectToEdit} onOpenChange={(isOpen) => !isOpen && setProjectToEdit(null)}>
        <DialogContent className="sm:max-w-[480px]">
           <CreateProjectForm
              project={projectToEdit}
              onSuccess={() => {
                handleSuccess();
                setProjectToEdit(null);
              }}
            />
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!projectToDelete} onOpenChange={(isOpen) => !isOpen && setProjectToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the project &quot;{projectToDelete?.name}&quot; and all its associated tasks.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
