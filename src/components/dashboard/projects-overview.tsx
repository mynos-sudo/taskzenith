"use client";

import { useEffect, useState } from "react";
import type { Project } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectsOverview() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/projects?limit=4');
        if (!response.ok) {
            throw new Error('Failed to fetch projects overview');
        }
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error("Failed to fetch projects overview", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center">
            <Skeleton className="h-8 w-20" />
            <div className="ml-4 space-y-2">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[100px]" />
            </div>
            <div className="ml-auto w-[150px] space-y-2">
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-4 w-[120px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {projects.map((project) => (
        <div key={project.id} className="flex items-center">
          <div className="flex -space-x-2 overflow-hidden">
            {project.members.map((member) => (
              <Avatar key={member.user.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
                <AvatarImage src={member.user.avatar} />
                <AvatarFallback>{member.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{project.name}</p>
            <p className="text-sm text-muted-foreground">
              {project.members.length} members
            </p>
          </div>
          <div className="ml-auto w-[150px] space-y-2">
             <Progress value={project.progress} className="h-2"/>
             <span className="text-sm text-muted-foreground">{project.progress}% complete</span>
          </div>
        </div>
      ))}
    </div>
  );
}
