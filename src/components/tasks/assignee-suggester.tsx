"use client";

import { useState } from "react";
import { Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { suggestTaskAssignee } from "@/ai/flows/suggest-task-assignee";
import type { SuggestTaskAssigneeOutput } from "@/ai/flows/suggest-task-assignee";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/types";

export function AssigneeSuggester({ allUsers }: { allUsers: User[] }) {
  const [taskDescription, setTaskDescription] = useState("");
  const [suggestions, setSuggestions] = useState<SuggestTaskAssigneeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSuggestion = async () => {
    if (!taskDescription) {
      toast({
        title: "Error",
        description: "Please enter a task description first.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setSuggestions(null);
    try {
      const result = await suggestTaskAssignee({
        taskDescription,
        availableAssignees: allUsers.map((u) => u.name),
      });
      setSuggestions(result);
    } catch (error) {
      console.error("Error fetching assignee suggestions:", error);
      toast({
        title: "AI Suggestion Failed",
        description: "Could not get suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Task Description
        </label>
        <Textarea
          id="description"
          placeholder="Describe the task in detail. For example: 'Develop a new responsive navigation bar using React and Tailwind CSS that supports nested dropdowns and is optimized for mobile.'"
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          className="min-h-[100px]"
        />
      </div>
      <Button onClick={handleSuggestion} disabled={isLoading} className="w-full">
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Wand2 className="mr-2 h-4 w-4" />
        )}
        Suggest Assignees with AI
      </Button>

      {suggestions && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2">Suggested Assignees (Ranked)</h4>
            <div className="space-y-2 mb-4">
              {suggestions.suggestedAssignees.map((name, index) => {
                 const user = allUsers.find(u => u.name === name);
                 return (
                    <div key={name} className={cn("flex items-center gap-2 p-2 rounded-md", index === 0 && "bg-accent/20")}>
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={user?.avatar} alt={user?.name} />
                            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{name}</span>
                        {index === 0 && <span className="text-xs text-accent-foreground ml-auto">(Top Match)</span>}
                    </div>
                 )
              })}
            </div>
            <div>
              <h5 className="font-semibold text-sm mb-1">Reasoning</h5>
              <p className="text-sm text-muted-foreground italic">
                &quot;{suggestions.reasoning}&quot;
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
