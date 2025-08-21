
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Megaphone } from "lucide-react";

export default function NoticesPage() {
  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notices & Events</h1>
        <p className="text-muted-foreground">
          Stay up-to-date with the latest announcements from the platform.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Official Announcements</CardTitle>
          <CardDescription>
            This section will display all official notices and events.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center p-12">
            <Megaphone className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Coming Soon</h3>
            <p className="text-muted-foreground mt-1">
                The notices board is under construction.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}

    