import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import StatsCards from "@/components/dashboard/stats-cards";
import ProjectsOverview from "@/components/dashboard/projects-overview";
import TasksOverview from "@/components/dashboard/tasks-overview";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s a summary of your projects and tasks.
        </p>
      </div>
      <StatsCards />
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Projects Overview</CardTitle>
            <CardDescription>
              An overview of your recent projects.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectsOverview />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>My Tasks</CardTitle>
            <CardDescription>
              Tasks assigned to you across all projects.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TasksOverview />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
