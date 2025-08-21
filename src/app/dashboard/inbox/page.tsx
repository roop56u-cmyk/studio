
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail } from "lucide-react";

export default function InboxPage() {
  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
        <p className="text-muted-foreground">
          View messages and communicate with support.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Messaging System</CardTitle>
          <CardDescription>
            This section will allow you to send and receive messages.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center p-12">
            <Mail className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Coming Soon</h3>
            <p className="text-muted-foreground mt-1">
                The inbox and messaging system is under construction.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}

    