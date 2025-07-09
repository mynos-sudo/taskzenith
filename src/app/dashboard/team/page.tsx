"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Activity, Mail } from "lucide-react";

type TeamMember = {
  id: string;
  name: string;
  avatar: string;
  email: string;
  activeTasks: number;
};

export default function TeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTeam = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/team');
        if (!response.ok) {
          throw new Error("Failed to fetch team data");
        }
        const data = await response.json();
        setTeam(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not load team members. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeam();
  }, [toast]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Team Overview</h1>
        <p className="text-muted-foreground">
          View all members and their current workload.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex flex-col items-center text-center gap-4">
                  <Skeleton className="h-24 w-24 rounded-full" />
                  <div className="grid gap-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {team.map((member) => (
            <Card key={member.id} className="flex flex-col">
              <CardHeader className="flex-grow">
                <div className="flex flex-col items-center text-center gap-4">
                  <Avatar className="h-24 w-24 border-4 border-muted">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="grid gap-1">
                    <CardTitle className="text-xl">{member.name}</CardTitle>
                    <CardDescription className="flex items-center justify-center gap-2">
                      <Mail className="h-3 w-3" />
                      {member.email}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground p-3 bg-muted rounded-md">
                   <Activity className="h-4 w-4" />
                   <span>{member.activeTasks} active task{member.activeTasks !== 1 ? 's' : ''}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
