
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Megaphone } from "lucide-react";

export default function AdminNoticesPage() {
  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Notices</h1>
        <p className="text-muted-foreground">
          Create, edit, and publish notices for all users.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Notices Control Panel</CardTitle>
          <CardDescription>
            This section will allow you to manage announcements and events.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center p-12">
            <Megaphone className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Coming Soon</h3>
            <p className="text-muted-foreground mt-1">
                The notice management system is under construction.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}

    