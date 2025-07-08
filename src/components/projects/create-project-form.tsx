"use client";

import { useState } from "react";
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

type CreateProjectFormProps = {
  onSuccess: () => void;
  setOpen: (open: boolean) => void;
};

export function CreateProjectForm({ onSuccess, setOpen }: CreateProjectFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      color: projectColors[0],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to create project");
      }
      
      toast({
          title: "Success!",
          description: `Project "${values.name}" has been created.`,
      });

      onSuccess();
      setOpen(false);
      form.reset();

    } catch (error) {
      toast({
        title: "Error",
        description: "Could not create project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
          Create Project
        </Button>
      </form>
    </Form>
  );
}
