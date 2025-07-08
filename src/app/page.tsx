import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <Rocket className="h-6 w-6 text-primary" />
          <span className="ml-2 text-xl font-bold font-headline">TaskZenith</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Button asChild variant="ghost">
            <Link href="/login" prefetch={false}>
              Login
            </Link>
          </Button>
          <Button asChild>
            <Link href="/register" prefetch={false}>
              Sign Up
            </Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold font-headline tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                  Elevate Your Productivity with TaskZenith
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  The ultimate collaborative platform to manage projects, track tasks, and achieve your goals with AI-powered efficiency.
                </p>
              </div>
              <div className="space-x-4">
                <Button asChild size="lg">
                  <Link href="/dashboard" prefetch={false}>
                    Get Started
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 TaskZenith. All rights reserved.</p>
      </footer>
    </div>
  );
}
