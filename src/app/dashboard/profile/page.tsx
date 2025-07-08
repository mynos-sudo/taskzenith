"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { users } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const user = users[0]; // mock user
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    toast({
      title: "Success!",
      description: "Your profile has been updated.",
    });
  };

  return (
    <div className="flex flex-col gap-8">
       <div>
        <h1 className="text-3xl font-bold font-headline">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your profile settings and personal information.
        </p>
      </div>
      <form onSubmit={handleSubmit}>
       <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>Update your photo and personal details here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
            <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                    <AvatarImage src={user.avatar} alt={name} />
                    <AvatarFallback>{name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="grid gap-1.5">
                    <div className="flex items-center gap-2">
                         <Button size="sm" type="button" onClick={() => toast({ title: "Feature not available", description: "Changing avatars is not yet implemented." })}>Change</Button>
                         <Button size="sm" variant="outline" type="button" onClick={() => toast({ title: "Feature not available", description: "Removing avatars is not yet implemented." })}>Remove</Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        JPG, GIF or PNG. 1MB max.
                    </p>
                </div>
            </div>

          <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="full-name">Full name</Label>
                <Input id="full-name" value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
              </div>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
            <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Profile
            </Button>
        </CardFooter>
      </Card>
      </form>
    </div>
  );
}
