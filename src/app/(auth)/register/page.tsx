import Link from "next/link";
import { register } from "../actions";
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

export default function RegisterPage({
  searchParams,
}: {
  searchParams: { message: string };
}) {
  
  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader className="text-center">
        <Rocket className="mx-auto h-8 w-8 text-primary" />
        <CardTitle className="text-2xl font-headline mt-2">Create an Account</CardTitle>
        <CardDescription>
          Enter your information to create an account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={register} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full name</Label>
            <Input 
              id="name"
              name="name"
              placeholder="Ada Lovelace" 
              required
            />
          </div>
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
            <Label htmlFor="password">Password</Label>
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
            Create an account
          </Button>
          <Button variant="outline" className="w-full" formAction="" disabled>
            Sign up with Google
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="underline">
            Login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
