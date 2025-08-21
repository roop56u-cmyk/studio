
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserCog } from "lucide-react";

export default function UserManagementPage() {
  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          Manage all users from this panel.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>User Control Panel</CardTitle>
          <CardDescription>
            This section will allow you to edit user details, balances, and permissions.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center p-12">
            <UserCog className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Coming Soon</h3>
            <p className="text-muted-foreground mt-1">
                The user management system is under construction.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}

    