
"use client";

import Link from "next/link";
import { usePathname } from 'next/navigation';
import {
  Home,
  Package,
  PanelLeft,
  Search,
  ListTodo,
  Rocket,
  Users
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { UserNav } from "./user-nav";
import { ThemeToggle } from "../theme-toggle";
import { cn } from "@/lib/utils";
import { useSearchStore } from "@/hooks/use-search-store";
import type { Profile } from "@/lib/types";

export default function Header({ user }: { user: Profile }) {
  const pathname = usePathname();
  const { query, setQuery } = useSearchStore();

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/dashboard/projects", icon: Package, label: "Projects" },
    { href: "/dashboard/tasks", icon: ListTodo, label: "Tasks" },
    { href: "/dashboard/team", icon: Users, label: "Team" },
  ];

  const breadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);
    let pageTitle = 'Dashboard';

    if (pathname.startsWith('/dashboard/projects/')) {
      pageTitle = 'Kanban Board';
      return (
        <>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard/projects">All Projects</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
          </BreadcrumbItem>
        </>
      );
    }
    
    if (pathname === '/dashboard/projects') pageTitle = 'All Projects';
    if (pathname === '/dashboard/tasks') pageTitle = 'All Tasks';
    if (pathname === '/dashboard/team') pageTitle = 'Team Overview';
    if (pathname === '/dashboard/profile') pageTitle = 'Profile';
    if (pathname === '/dashboard/billing') pageTitle = 'Billing';
    if (pathname === '/dashboard/settings') pageTitle = 'Settings';

    if (pathname === '/dashboard') {
        return <BreadcrumbItem><BreadcrumbPage>Dashboard</BreadcrumbPage></BreadcrumbItem>;
    }

    return (
        <>
            <BreadcrumbItem>
                <BreadcrumbLink asChild>
                <Link href="/dashboard">Dashboard</Link>
                </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
                <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
            </BreadcrumbItem>
        </>
    )
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/dashboard"
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
            >
              <Rocket className="h-5 w-5 transition-all group-hover:scale-110" />
              <span className="sr-only">TaskZenith</span>
            </Link>
            {navItems.map((item) => (
                <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                        "flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground",
                        (pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))) && "text-foreground"
                    )}
                >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          {breadcrumbs()}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="relative ml-auto flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <ThemeToggle />
      <UserNav user={user} />
    </header>
  );
}
