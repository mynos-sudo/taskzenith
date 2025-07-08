"use client";

import { useState } from "react";
import type { Project, User, ProjectMember } from "@/lib/types";
import { Button } from "../ui/button";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { X, UserPlus, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface ManageMembersDialogProps {
    project: Project;
    allUsers: User[];
    onSuccess: () => void;
}

export function ManageMembersDialog({ project, allUsers, onSuccess }: ManageMembersDialogProps) {
    const [members, setMembers] = useState<ProjectMember[]>(project.members);
    const [userToAdd, setUserToAdd] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const availableUsers = allUsers.filter(u => !members.some(m => m.user.id === u.id));

    const handleAddMember = () => {
        if (!userToAdd) return;
        const user = allUsers.find(u => u.id === userToAdd);
        if (user) {
            setMembers([...members, { user, role: "MEMBER" }]);
            setUserToAdd("");
        }
    };

    const handleRemoveMember = (userId: string) => {
        const member = members.find(m => m.user.id === userId);
        if (member?.role === 'OWNER') {
             toast({
                title: "Cannot Remove Owner",
                description: "The project must have an owner.",
                variant: "destructive",
            });
            return;
        }
        setMembers(members.filter(m => m.user.id !== userId));
    };

    const handleSaveChanges = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/projects/${project.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ members }),
            });

            if (!response.ok) {
                throw new Error("Failed to update members");
            }
            toast({
                title: "Success",
                description: "Project members have been updated.",
            });
            onSuccess();
        } catch (error) {
            toast({
                title: "Error",
                description: "Could not update members. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <DialogHeader>
                <DialogTitle>Manage Members</DialogTitle>
                <DialogDescription>Add or remove members from &quot;{project.name}&quot;.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-6">
                <div>
                    <h4 className="text-sm font-medium mb-2">Current Members</h4>
                    <div className="space-y-2">
                        {members.map(({ user, role }) => (
                            <div key={user.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user.avatar} alt={user.name} />
                                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium text-sm">{user.name}</p>
                                        <p className="text-xs text-muted-foreground">{role}</p>
                                    </div>
                                </div>
                                {role !== 'OWNER' && (
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemoveMember(user.id)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-medium mb-2">Add New Member</h4>
                    <div className="flex gap-2">
                        <Select value={userToAdd} onValueChange={setUserToAdd}>
                            <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Select a user to add" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableUsers.length > 0 ? (
                                    availableUsers.map(user => (
                                        <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                                    ))
                                ) : (
                                    <div className="p-2 text-sm text-muted-foreground">No users to add</div>
                                )}
                            </SelectContent>
                        </Select>
                        <Button onClick={handleAddMember} disabled={!userToAdd}>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add
                        </Button>
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button onClick={handleSaveChanges} disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </DialogFooter>
        </>
    )
}
