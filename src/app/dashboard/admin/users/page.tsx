
"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, UserCog } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/contexts/AuthContext";
import { EditUserDialog } from "@/components/dashboard/edit-user-dialog";
import { Badge } from "@/components/ui/badge";

export default function UserManagementPage() {
    const { users, deleteUser } = useAuth();
    const { toast } = useToast();
    const [isClient, setIsClient] = React.useState(false);
    const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

    React.useEffect(() => {
        setIsClient(true);
    }, []);

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setIsEditDialogOpen(true);
    };

    const handleDelete = (email: string) => {
        deleteUser(email);
        toast({
            title: "User Deleted",
            description: `User ${email} has been successfully deleted.`,
            variant: "destructive"
        });
    };

    const handleResetPassword = (email: string) => {
        // In a real app, this would trigger an email flow.
        toast({
            title: "Password Reset Triggered",
            description: `A password reset link would be sent to ${email} in a real application.`,
        });
    };


    if (!isClient) {
        return (
             <div className="grid gap-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                <p className="text-muted-foreground">
                  Manage all users from this panel.
                </p>
              </div>
            </div>
        );
    }

  return (
    <>
    <div className="grid gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          Manage all users from this panel.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            A list of all users registered on the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Referral Code</TableHead>
                <TableHead>Referred By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.email}>
                  <TableCell className="font-medium">{user.email}{user.isAdmin && <span className="ml-2 text-xs text-primary">(Admin)</span>}</TableCell>
                   <TableCell>
                        <Badge variant={user.status === 'active' ? 'default' : 'destructive'} className={user.status === 'active' ? 'bg-green-500/20 text-green-700 border-green-500/20' : ''}>
                          {user.status}
                        </Badge>
                   </TableCell>
                  <TableCell className="font-mono text-xs">{user.referralCode}</TableCell>
                  <TableCell className="font-mono text-xs">{user.referredBy ?? 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">User Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(user)}>Edit User</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleResetPassword(user.email)}>Reset Password</DropdownMenuItem>
                        {!user.isAdmin && (
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(user.email)}>
                            Delete User
                            </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
    {selectedUser && (
        <EditUserDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            user={selectedUser}
        />
    )}
    </>
  );
}
