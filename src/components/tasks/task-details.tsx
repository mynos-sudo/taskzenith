"use client";

import { useState, useEffect } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Send } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";

import type { Task, Priority, User } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { ScrollArea } from "../ui/scroll-area";
import { Skeleton } from "../ui/skeleton";

interface TaskDetailsProps {
  task: Task;
  onUpdate: () => void;
}

const priorityVariantMap: Record<Priority, BadgeProps["variant"]> = {
    low: "outline",
    medium: "secondary",
    high: "default",
    critical: "destructive",
};

const commentSchema = z.object({
  content: z.string().min(1, { message: "Comment cannot be empty." }),
});

export function TaskDetails({ task: initialTask, onUpdate }: TaskDetailsProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setCurrentUser({
          id: user.id,
          name: profile?.name ?? 'User',
          email: user.email!,
          avatar: profile?.avatar ?? `https://i.pravatar.cc/150?u=${user.id}`
        });
      }
    };
    fetchUser();
  }, []);

  const form = useForm<z.infer<typeof commentSchema>>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: "",
    },
  });

  async function onSubmit(values: z.infer<typeof commentSchema>) {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/tasks/${initialTask.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to post comment");
      }
      toast({
        title: "Success!",
        description: "Your comment has been posted.",
      });
      form.reset();
      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not post comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{initialTask.title}</DialogTitle>
        <DialogDescription>
            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                <Badge variant={priorityVariantMap[initialTask.priority]}>{initialTask.priority}</Badge>
                <span>Due on {initialTask.dueDate ? format(new Date(initialTask.dueDate), "MMM d, yyyy") : 'N/A'}</span>
            </div>
        </DialogDescription>
      </DialogHeader>

      <ScrollArea className="flex-grow -mx-6 px-6">
        <div className="py-4 space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Assignees</h3>
            <div className="flex flex-wrap items-center gap-4">
              {initialTask.assignees.length > 0 ? initialTask.assignees.map(user => (
                <div key={user.id} className="flex items-center gap-2">
                   <Avatar className="h-6 w-6">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{user.name}</span>
                </div>
              )) : <p className="text-sm text-muted-foreground">No one assigned</p>}
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{initialTask.description || "No description provided."}</p>
          </div>

          <Separator />
          
          <div>
            <h3 className="font-semibold mb-4">Activity</h3>
            <div className="space-y-4">
              {initialTask.comments.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No comments yet. Start the conversation!</p>}
              {initialTask.comments.map(comment => (
                <div key={comment.id} className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                      <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{comment.author.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
      
      <div className="pt-4 mt-auto -mx-6 -mb-6 px-6 pb-6 bg-background border-t">
        {currentUser ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-3">
              <Avatar className="h-8 w-8 mt-1">
                  <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                  <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Textarea placeholder="Add a comment..." {...field} className="min-h-[40px] resize-none" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="icon" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="sr-only">Send comment</span>
              </Button>
            </form>
          </Form>
        ) : (
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-10" />
          </div>
        )}
      </div>
    </>
  );
}
