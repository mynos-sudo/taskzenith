"use client";

import { useEffect, useState, useCallback, use } from "react";
import type { Project, Task, ProjectSummary, Priority } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { users } from "@/lib/data";
import { Filter, PlusCircle, Users, Loader2, Wand2, Lightbulb, TrendingUp, AlertTriangle, BrainCircuit } from "lucide-react";
import KanbanBoard from "@/components/kanban/kanban-board";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { CreateTaskForm } from "@/components/tasks/create-task-form";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskDetails } from "@/components/tasks/task-details";
import { ManageMembersDialog } from "@/components/projects/manage-members-dialog";
import { summarizeProject } from "@/ai/flows/summarize-project";
import { generateTasks } from "@/ai/flows/generate-tasks-flow";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

const outlookConfig = {
    Positive: { icon: TrendingUp, color: 'text-green-500', bgColor: 'bg-green-500/10' },
    Neutral: { icon: Lightbulb, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
    Concerning: { icon: AlertTriangle, color: 'text-red-500', bgColor: 'bg-red-500/10' },
};

export default function KanbanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = use(params);
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateTaskOpen, setCreateTaskOpen] = useState(false);
  const [tasksVersion, setTasksVersion] = useState(0);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isManageMembersOpen, setManageMembersOpen] = useState(false);
  
  const [isSummaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [summary, setSummary] = useState<ProjectSummary | null>(null);
  const [isSummaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [isGenerateTasksOpen, setGenerateTasksOpen] = useState(false);
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);
  const [aiGoal, setAiGoal] = useState("");

  const fetchProject = useCallback(async () => {
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
  }, [projectId]);

  const handleBoardUpdate = () => {
    setTasksVersion(v => v + 1);
    setCreateTaskOpen(false);
    if (selectedTask) {
      setSelectedTask(null);
    }
  };

  const handleProjectUpdate = () => {
    setManageMembersOpen(false);
    fetchProject();
  };

  const handleGenerateSummary = useCallback(async () => {
    setSummaryDialogOpen(true);
    setSummaryLoading(true);
    setSummary(null);
    setSummaryError(null);
    try {
      const result = await summarizeProject({ projectId });
      setSummary(result);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : "An unknown error occurred";
      setSummaryError(errorMsg);
      toast({
        title: "AI Summary Failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setSummaryLoading(false);
    }
  }, [projectId, toast]);

  const handleGenerateTasks = useCallback(async () => {
    if (!aiGoal) return;
    setIsGeneratingTasks(true);
    try {
        const result = await generateTasks({ goal: aiGoal });
        const createdTasksPromises = result.tasks.map(task => 
            fetch(`/api/projects/${projectId}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: task.title,
                    description: task.description,
                    priority: task.priority,
                }),
            })
        );
        
        const responses = await Promise.all(createdTasksPromises);
        const failedCount = responses.filter(res => !res.ok).length;

        if (failedCount > 0) {
            throw new Error(`${failedCount} tasks could not be created.`);
        }

        toast({
            title: "Success!",
            description: `${result.tasks.length} tasks have been generated and added to your project.`,
        });

        setGenerateTasksOpen(false);
        setAiGoal("");
        handleBoardUpdate();

    } catch (e) {
        const errorMsg = e instanceof Error ? e.message : "An unknown error occurred";
        toast({
            title: "AI Task Generation Failed",
            description: errorMsg,
            variant: "destructive",
        });
    } finally {
        setIsGeneratingTasks(false);
    }
  }, [aiGoal, projectId, toast]);


  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId, fetchProject]);

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
  
  const OutlookIcon = summary ? outlookConfig[summary.outlook].icon : null;

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
              <Dialog open={isManageMembersOpen} onOpenChange={setManageMembersOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Members
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  {project && <ManageMembersDialog project={project} allUsers={users} onSuccess={handleProjectUpdate} />}
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <Dialog open={isGenerateTasksOpen} onOpenChange={setGenerateTasksOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <BrainCircuit className="h-4 w-4 mr-2" />
                  Generate Tasks
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate Tasks with AI</DialogTitle>
                  <DialogDescription>
                    Describe a high-level goal, and the AI will break it down into actionable tasks for this project.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <Textarea 
                      placeholder="e.g., Launch our new mobile app for iOS and Android by the end of Q3."
                      value={aiGoal}
                      onChange={(e) => setAiGoal(e.target.value)}
                      rows={4}
                      disabled={isGeneratingTasks}
                    />
                </div>
                <DialogFooter>
                  <Button onClick={handleGenerateTasks} disabled={isGeneratingTasks || !aiGoal}>
                    {isGeneratingTasks && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Generate
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button variant="outline" onClick={handleGenerateSummary}>
              <Wand2 className="h-4 w-4 mr-2" />
              AI Summary
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

        <Dialog open={isSummaryDialogOpen} onOpenChange={setSummaryDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>AI Project Summary</DialogTitle>
              <DialogDescription>
                An AI-generated summary of '{project.name}'. This is based on the project's current status and tasks.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              {isSummaryLoading && (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
              {summaryError && <div className="text-destructive text-sm">{summaryError}</div>}
              {summary && OutlookIcon && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Summary</h4>
                    <p className="text-sm text-muted-foreground">{summary.summary}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Outlook</h4>
                    <Badge variant="outline" className={`border-0 ${outlookConfig[summary.outlook].bgColor} ${outlookConfig[summary.outlook].color}`}>
                        <OutlookIcon className="h-4 w-4 mr-2" />
                        {summary.outlook}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Suggested Action</h4>
                    <p className="text-sm text-muted-foreground">{summary.suggestedAction}</p>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DndProvider>
  );
}
