import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity, Briefcase, CheckCircle, Clock } from "lucide-react";

const stats = [
    { title: "Total Projects", value: "12", icon: Briefcase },
    { title: "Active Tasks", value: "54", icon: Activity },
    { title: "Tasks Completed", value: "231", icon: CheckCircle },
    { title: "Hours Logged", value: "4,200", icon: Clock },
];

export default function StatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
