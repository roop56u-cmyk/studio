
"use client";

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
import { Badge } from "@/components/ui/badge";

// Mock data for demonstration
const activities = [
  {
    id: "ACT-001",
    admin: "admin@stakinghub.com",
    action: "Approved Request",
    target: "REQ-002",
    date: "2024-07-30 10:00 AM",
  },
    {
    id: "ACT-002",
    admin: "admin@stakinghub.com",
    action: "Declined Request",
    target: "REQ-003",
    date: "2024-07-29 02:15 PM",
  },
    {
    id: "ACT-003",
    admin: "admin@stakinghub.com",
    action: "Updated Level 3",
    target: "Level Management",
    date: "2024-07-28 09:30 AM",
  },
];

export default function ActivityLogPage() {
  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Activity Log</h1>
        <p className="text-muted-foreground">
          Review all administrative actions taken on the platform.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>
            A chronological record of all admin activities.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Admin</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {activities.length > 0 ? (
                        activities.map((activity) => (
                            <TableRow key={activity.id}>
                                <TableCell>{activity.admin}</TableCell>
                                <TableCell>
                                    <Badge variant={activity.action.includes('Approved') ? 'default' : activity.action.includes('Declined') ? 'destructive' : 'secondary'}>{activity.action}</Badge>
                                </TableCell>
                                <TableCell className="font-mono text-xs">{activity.target}</TableCell>
                                <TableCell>{activity.date}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center">No activities recorded yet.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
