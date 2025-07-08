"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import StatsCards from "@/components/dashboard/stats-cards";
import TasksOverview from "@/components/dashboard/tasks-overview";
import ProjectsChart from "@/components/dashboard/projects-chart";

export default function DashboardPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      className="flex flex-col gap-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s a summary of your projects and tasks.
        </p>
      </motion.div>
      <motion.div variants={itemVariants}>
        <StatsCards />
      </motion.div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <motion.div className="xl:col-span-2" variants={itemVariants}>
          <ProjectsChart />
        </motion.div>
        <motion.div variants={itemVariants}>
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
        </motion.div>
      </div>
    </motion.div>
  );
}
