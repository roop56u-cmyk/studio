
"use client";

import React, { useState, useMemo } from "react";
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
import { MoreHorizontal, UserCog, Search, X, Users as UsersIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/contexts/AuthContext";
import { EditUserDialog } from "@/components/dashboard/edit-user-dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { TeamDataPanel } from "@/components/dashboard/team-data-panel";


type StatusFilter = 'All' | 'active' | 'inactive' | 'disabled';

export default function UserManagementPage() {
    const { users, deleteUser } = useAuth();
    const { toast } = useToast();
    const [isClient, setIsClient] = React.useState(false);
    const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
    const [isTeamDataOpen, setIsTeamDataOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");

    React.useEffect(() => {
        setIsClient(true);
    }, []);

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = statusFilter === 'All' || user.status === statusFilter;
            return matchesSearch && matchesFilter;
        });
    }, [users, searchTerm, statusFilter]);

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setIsEditDialogOpen(true);
    };
    
    const handleViewTeam = (user: User) => {
        setSelectedUser(user);
        setIsTeamDataOpen(true);
    }

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
      <Card>
        <CardHeader>
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>
          <CardDescription>
            A list of all users registered on the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                 <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search by email..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                 <div className="flex items-center gap-2">
                    <Button variant={statusFilter === 'All' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('All')}>All</Button>
                    <Button variant={statusFilter === 'active' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('active')}>Active</Button>
                    <Button variant={statusFilter === 'inactive' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('inactive')}>Inactive</Button>
                    <Button variant={statusFilter === 'disabled' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('disabled')}>Disabled</Button>
                </div>
            </div>
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
              {filteredUsers.map((user) => (
                <TableRow key={user.email}>
                  <TableCell className="font-medium">{user.email}{user.isAdmin && <span className="ml-2 text-xs text-primary">(Admin)</span>}</TableCell>
                   <TableCell>
                        <Badge variant={user.status === 'active' ? 'default' : user.status === 'inactive' ? 'secondary' : 'destructive'} className={cn(user.status === 'active' ? 'bg-green-500/20 text-green-700 border-green-500/20' : '', 'capitalize')}>
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
                         <DropdownMenuItem onClick={() => handleViewTeam(user)}>View Team Data</DropdownMenuItem>
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
     {selectedUser && (
        <Sheet open={isTeamDataOpen} onOpenChange={setIsTeamDataOpen}>
            <SheetContent className="w-full sm:max-w-2xl">
                 <SheetHeader>
                    <SheetTitle>Team Data: {selectedUser.fullName}</SheetTitle>
                    <SheetDescription>
                        Analyze the user's team structure and reward eligibility.
                    </SheetDescription>
                </SheetHeader>
                <TeamDataPanel user={selectedUser} />
                <SheetClose />
            </SheetContent>
        </Sheet>
    )}
    </>
  );
}
