
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { User, Task } from "@/lib/types";
import { AssigneeSelector } from "./assignee-selector";
import { DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { ScrollArea } from "../ui/scroll-area";

const formSchema = z.object({
  title: z.string().min(2, { message: "Task title must be at least 2 characters." }),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]),
  assignees: z.array(z.string()).optional(),
  dueDate: z.date().optional(),
});

type CreateTaskFormProps = {
  projectId: string;
  allUsers: User[];
  onSuccess: () => void;
  task?: Task | null;
};

export function CreateTaskForm({ projectId, allUsers, onSuccess, task }: CreateTaskFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!task;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      assignees: [],
      dueDate: undefined,
    },
  });

  useEffect(() => {
    if (isEditMode && task) {
      form.reset({
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        assignees: task.assignees.map(a => a.id),
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      });
    } else {
       form.reset({
        title: "",
        description: "",
        priority: "medium",
        assignees: [],
        dueDate: undefined,
      });
    }
  }, [task, isEditMode, form]);

  const taskDescription = form.watch("description");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const url = isEditMode ? `/api/tasks/${task.id}` : `/api/projects/${projectId}/tasks`;
      const method = isEditMode ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isEditMode ? 'update' : 'create'} task`);
      }
      
      toast({
          title: "Success!",
          description: `Task "${values.title}" has been ${isEditMode ? 'updated' : 'created'}.`,
      });

      onSuccess();

    } catch (error) {
      toast({
        title: "Error",
        description: `Could not ${isEditMode ? 'update' : 'create'} task. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEditMode ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        <DialogDescription>
          {isEditMode 
            ? 'Update the details for this task.'
            : 'Fill in the details for the new task. Use the AI Suggester to find the right person for the job.'
          }
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col flex-grow overflow-hidden"
        >
          <ScrollArea className="flex-grow">
            <div className="space-y-4 pt-4 pr-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Implement dark mode feature" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col pt-2">
                      <FormLabel className="mb-[5px]">Due Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                        <Textarea
                        placeholder="Describe the task in detail to get better AI suggestions. e.g. 'Develop a new responsive navigation bar using React and Tailwind CSS that supports nested dropdowns and is optimized for mobile.'"
                        className="min-h-[100px]"
                        {...field}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            
            <FormField
                control={form.control}
                name="assignees"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Assignees</FormLabel>
                        <FormControl>
                            <AssigneeSelector
                                allUsers={allUsers}
                                taskDescription={taskDescription || ""}
                                selectedAssignees={field.value || []}
                                onAssigneesChange={field.onChange}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            </div>
          </ScrollArea>

          <div className="pt-4 border-t mt-auto">
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
