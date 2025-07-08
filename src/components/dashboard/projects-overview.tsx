import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { projects } from "@/lib/data";

export default function ProjectsOverview() {
  return (
    <div className="space-y-8">
      {projects.slice(0, 4).map((project) => (
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
