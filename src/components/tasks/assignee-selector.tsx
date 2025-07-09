"use client";

import { useState, useEffect } from "react";
import { Loader2, Wand2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { suggestTaskAssignee } from "@/ai/flows/suggest-task-assignee";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/types";
import { Badge } from "../ui/badge";
import { createClient } from "@/lib/supabase-browser";
import { Skeleton } from "../ui/skeleton";

interface AssigneeSelectorProps {
  taskDescription: string;
  selectedAssignees: string[];
  onAssigneesChange: (assigneeIds: string[]) => void;
}

export function AssigneeSelector({
  taskDescription,
  selectedAssignees,
  onAssigneesChange,
}: AssigneeSelectorProps) {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [reasoning, setReasoning] = useState("");
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      const supabase = createClient();
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) {
        toast({ title: "Error", description: "Could not fetch users." });
      } else {
        const users = data.map(profile => ({
            id: profile.id,
            name: profile.name,
            email: `user-${profile.id}@example.com`,
            avatar: profile.avatar ?? `https://i.pravatar.cc/150?u=${profile.id}`
        }))
        setAllUsers(users);
      }
      setIsLoadingUsers(false);
    };
    fetchUsers();
  }, [toast]);

  const handleSuggestion = async () => {
    if (!taskDescription) {
      toast({
        title: "Error",
        description: "Please enter a task description first for AI suggestions.",
        variant: "destructive",
      });
      return;
    }
    setIsLoadingAI(true);
    setSuggestions([]);
    setReasoning("");
    try {
      const result = await suggestTaskAssignee({
        taskDescription,
        availableAssignees: allUsers.map((u) => u.name),
      });
      setSuggestions(result.suggestedAssignees);
      setReasoning(result.reasoning);
    } catch (error) {
      console.error("Error fetching assignee suggestions:", error);
      toast({
        title: "AI Suggestion Failed",
        description: "Could not get suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAI(false);
    }
  };

  const toggleAssignee = (userId: string) => {
    const newSelection = selectedAssignees.includes(userId)
      ? selectedAssignees.filter((id) => id !== userId)
      : [...selectedAssignees, userId];
    onAssigneesChange(newSelection);
  };
  
  const suggestedUserIds = allUsers
    .filter(u => suggestions.includes(u.name))
    .map(u => u.id);

  const selectedUsers = allUsers.filter(u => selectedAssignees.includes(u.id));

  return (
    <div className="space-y-4">
        <Button
            type="button"
            variant="outline"
            onClick={handleSuggestion}
            disabled={isLoadingAI || !taskDescription || isLoadingUsers}
            className="w-full"
        >
            {isLoadingAI ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
            <Wand2 className="mr-2 h-4 w-4" />
            )}
            Suggest Assignees with AI
        </Button>

        {reasoning && (
             <Card className="bg-muted/50 border-dashed">
                <CardContent className="p-3 text-sm italic text-muted-foreground">
                <span className="font-semibold not-italic text-foreground">AI Reasoning:</span> &quot;{reasoning}&quot;
                </CardContent>
            </Card>
        )}

        <Card>
            <CardContent className="p-2 space-y-2">
                 <div className="text-sm font-medium p-2">
                    {selectedAssignees.length > 0 ? "Selected Assignees" : "Select Assignees"}
                 </div>
                 {selectedAssignees.length > 0 && (
                     <div className="flex flex-wrap gap-2 p-2 border-b">
                         {selectedUsers.map(user => (
                             <Badge key={user.id} variant="secondary" className="pl-2 pr-1">
                                 {user.name}
                                 <button type="button" onClick={() => toggleAssignee(user.id)} className="ml-1 rounded-full hover:bg-background p-0.5">
                                    <X className="h-3 w-3" />
                                    <span className="sr-only">Remove {user.name}</span>
                                 </button>
                             </Badge>
                         ))}
                     </div>
                 )}
                 <div className="max-h-48 overflow-y-auto">
                    {isLoadingUsers ? (
                        <div className="space-y-1 p-2">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {allUsers.map((user) => {
                                const isSelected = selectedAssignees.includes(user.id);
                                const isSuggested = suggestedUserIds.includes(user.id);
                                return (
                                    <div
                                        key={user.id}
                                        onClick={() => toggleAssignee(user.id)}
                                        className={cn(
                                            "flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-muted/80",
                                            isSelected && "bg-muted font-semibold",
                                            isSuggested && !isSelected && "bg-accent/20"
                                        )}
                                    >
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.avatar} alt={user.name} />
                                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span>{user.name}</span>
                                        {isSuggested && (
                                            <Badge variant={isSelected ? "default" : "outline"} className="ml-auto">
                                                Suggested
                                            </Badge>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                 </div>
            </CardContent>
        </Card>
    </div>
  );
}
