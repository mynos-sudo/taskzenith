import { tasks, projects, users } from "@/lib/data";

export default function TasksOverview() {
  const currentUser = users[0];
  const myTasks = tasks.filter(task => task.assignees.some(assignee => assignee.id === currentUser.id)).slice(0, 5);

  return (
    <div className="space-y-4">
        {myTasks.map((task) => {
            const project = projects.find(p => p.id === task.projectId);
            return (
                <div key={task.id} className="flex items-center p-2 hover:bg-muted/50 rounded-lg">
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{task.title}</p>
                        <p className="text-sm text-muted-foreground">{project?.name}</p>
                    </div>
                    <div className="ml-auto font-medium capitalize text-sm text-muted-foreground">{task.priority}</div>
                </div>
            )
        })}
    </div>
  )
}
