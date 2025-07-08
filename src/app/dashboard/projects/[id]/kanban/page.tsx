"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { projects, users } from "@/lib/data";
import { Filter, PlusCircle, Users } from "lucide-react";
import KanbanBoard from "@/components/kanban/kanban-board";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AssigneeSuggester } from "@/components/tasks/assignee-suggester";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function KanbanPage({ params }: { params: { id: string } }) {
  const project = projects.find((p) => p.id === params.id);

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-[calc(100vh-theme(spacing.24))]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold font-headline">{project.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex -space-x-2 overflow-hidden">
                {project.members.map((member) => (
                  <Avatar
                    key={member.id}
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-background"
                  >
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
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
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  New Task
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                  <DialogDescription>
                    Fill in the details for the new task. Use the AI Suggester to find the right person for the job.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="task-title">Task Title</Label>
                    <Textarea id="task-title" placeholder="e.g., Implement dark mode feature" />
                  </div>
                  <AssigneeSuggester allUsers={users} />
                </div>
                <Button type="submit" className="w-full">Create Task</Button>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          <KanbanBoard projectId={project.id} />
        </div>
      </div>
    </DndProvider>
  );
}
