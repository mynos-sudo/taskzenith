import Link from "next/link";
import { login } from "./actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Rocket } from "lucide-react";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message: string };
}) {

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader className="text-center">
        <Rocket className="mx-auto h-8 w-8 text-primary" />
        <CardTitle className="text-2xl font-headline mt-2">TaskZenith Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={login} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="m@example.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <Link
                href="#"
                className="ml-auto inline-block text-sm underline"
              >
                Forgot your password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              required
            />
          </div>
          {searchParams.message && (
             <div className="text-sm font-medium text-destructive">
               {searchParams.message}
             </div>
           )}
          <Button type="submit" className="w-full">
            Login
          </Button>
          <Button variant="outline" className="w-full" formAction="" disabled>
            Login with Google
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
