import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { users } from "@/lib/data";

export default function ProfilePage() {
  const user = users[0]; // mock user

  return (
    <div className="flex flex-col gap-8">
       <div>
        <h1 className="text-3xl font-bold font-headline">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your profile settings and personal information.
        </p>
      </div>
       <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>Update your photo and personal details here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
            <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="grid gap-1.5">
                    <div className="flex items-center gap-2">
                         <Button size="sm">Change</Button>
                         <Button size="sm" variant="outline">Remove</Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        JPG, GIF or PNG. 1MB max.
                    </p>
                </div>
            </div>

          <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="full-name">Full name</Label>
                <Input id="full-name" defaultValue={user.name} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={user.email} />
              </div>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
            <Button>Update Profile</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
