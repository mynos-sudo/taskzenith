"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Project } from "@/lib/types";
import { DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";

const projectColors = [
  "#6d28d9", // Violet
  "#be185d", // Pink
  "#059669", // Green
  "#ea580c", // Orange
  "#2563eb", // Blue
  "#ca8a04", // Yellow
];

const formSchema = z.object({
  name: z.string().min(2, { message: "Project name must be at least 2 characters." }),
  description: z.string().optional(),
  color: z.string().optional().default(projectColors[0]),
});

type ProjectFormProps = {
  onSuccess: () => void;
  project?: Project | null;
};

export function CreateProjectForm({ onSuccess, project }: ProjectFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!project;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      color: projectColors[0],
    },
  });

  useEffect(() => {
    if (isEditMode && project) {
      form.reset({
        name: project.name,
        description: project.description || "",
        color: project.color || projectColors[0],
      });
    } else {
      form.reset({
        name: "",
        description: "",
        color: projectColors[0],
      });
    }
  }, [project, isEditMode, form]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const url = isEditMode ? `/api/projects/${project.id}` : "/api/projects";
      const method = isEditMode ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isEditMode ? 'update' : 'create'} project`);
      }
      
      toast({
          title: "Success!",
          description: `Project "${values.name}" has been ${isEditMode ? 'updated' : 'created'}.`,
      });

      onSuccess();

    } catch (error) {
      toast({
        title: "Error",
        description: `Could not ${isEditMode ? 'update' : 'create'} project. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEditMode ? 'Edit Project' : 'Create a new project'}</DialogTitle>
        <DialogDescription>
          {isEditMode ? 'Update the details for your project.' : 'Give your new project a name and a color to get started.'}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., QuantumLeap Engine" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="A short description of your project."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Color</FormLabel>
                <FormControl>
                  <div className="grid grid-cols-6 gap-2 pt-2">
                    {projectColors.map((color) => (
                      <button
                        type="button"
                        key={color}
                        onClick={() => field.onChange(color)}
                        className={cn(
                          "h-8 w-8 rounded-full border-2 border-transparent transition-all",
                          field.value === color && "ring-2 ring-offset-2 ring-primary ring-offset-background"
                        )}
                        style={{ 
                          backgroundColor: color,
                        }}
                      />
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? 'Save Changes' : 'Create Project'}
          </Button>
        </form>
      </Form>
    </>
  );
}
