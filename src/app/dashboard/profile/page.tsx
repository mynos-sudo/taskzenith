"use client";

import { useState, useEffect, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import type { Profile } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { updateProfile } from "../actions";

export default function ProfilePage() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (error) {
        toast({ title: "Error fetching profile", description: error.message, variant: "destructive" });
        setProfile(null);
      } else {
        setProfile({
            id: data.id,
            name: data.name,
            email: user.email!,
            avatar: data.avatar ?? `https://i.pravatar.cc/150?u=${user.id}`
        });
      }
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const result = await updateProfile(formData);

    if (result?.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success!",
        description: result.success,
      });
      // Re-fetch to show updated data, revalidatePath should also handle it.
      fetchProfile();
    }
    setIsSubmitting(false);
  };
  
  if (isLoading) {
      return (
          <div className="flex flex-col gap-8">
              <div>
                  <h1 className="text-3xl font-bold font-headline">My Profile</h1>
                  <p className="text-muted-foreground">Manage your profile settings and personal information.</p>
              </div>
              <Card>
                  <CardHeader>
                      <CardTitle>Profile Details</CardTitle>
                      <CardDescription>Loading your personal details...</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                      <div className="flex items-center gap-4">
                          <Skeleton className="h-20 w-20 rounded-full" />
                          <div className="grid gap-1.5">
                              <Skeleton className="h-9 w-32" />
                              <Skeleton className="h-4 w-48" />
                          </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                          <div className="grid gap-2">
                              <Label htmlFor="full-name">Full name</Label>
                              <Skeleton className="h-10 w-full" />
                          </div>
                          <div className="grid gap-2">
                              <Label htmlFor="email">Email</Label>
                              <Skeleton className="h-10 w-full" />
                          </div>
                      </div>
                  </CardContent>
                  <CardFooter className="border-t px-6 py-4">
                      <Skeleton className="h-10 w-36" />
                  </CardFooter>
              </Card>
          </div>
      )
  }

  if (!profile) {
      return <div>Could not load profile. You might not be logged in.</div>
  }

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
                    <AvatarImage src={profile.avatar} alt={profile.name} />
                    <AvatarFallback>{profile.name.substring(0, 2)}</AvatarFallback>
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
                <Input id="full-name" name="name" defaultValue={profile.name} disabled={isSubmitting} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={profile.email} disabled />
              </div>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Profile
            </Button>
        </CardFooter>
      </Card>
      </form>
    </div>
  );
}
