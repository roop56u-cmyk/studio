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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockRequests = [
  {
    id: "REQ-001",
    user: "user1@example.com",
    type: "Withdrawal",
    amount: "150.00 USDT",
    status: "Pending",
    date: "2024-07-30",
  },
  {
    id: "REQ-002",
    user: "user2@example.com",
    type: "Withdrawal",
    amount: "75.50 USDT",
    status: "Approved",
    date: "2024-07-29",
  },
  {
    id: "REQ-003",
    user: "user3@example.com",
    type: "Withdrawal",
    amount: "300.00 USDT",
    status: "Declined",
    date: "2024-07-28",
  },
   {
    id: "REQ-004",
    user: "user4@example.com",
    type: "Withdrawal",
    amount: "50.00 USDT",
    status: "Pending",
    date: "2024-07-30",
  },
];

export function AdminProfile() {
    const { toast } = useToast();

    const handleAction = (requestId: string, action: 'Approve' | 'Decline' | 'Hold') => {
        toast({
            title: `Request ${action}d`,
            description: `Request ID ${requestId} has been marked as ${action.toLowerCase()}.`,
        });
        // In a real app, you would update the state and make an API call here.
    };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Panel</CardTitle>
        <CardDescription>
          Manage all user withdrawal requests from this panel.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">{request.id}</TableCell>
                <TableCell>{request.user}</TableCell>
                <TableCell>{request.type}</TableCell>
                <TableCell>{request.amount}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      request.status === "Pending"
                        ? "secondary"
                        : request.status === "Approved"
                        ? "default"
                        : "destructive"
                    }
                    className={request.status === 'Approved' ? 'bg-green-500/20 text-green-700 border-green-500/20' : ''}
                  >
                    {request.status}
                  </Badge>
                </TableCell>
                <TableCell>{request.date}</TableCell>
                <TableCell>
                    {request.status === 'Pending' && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleAction(request.id, 'Approve')}>Approve</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleAction(request.id, 'Decline')}>Decline</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleAction(request.id, 'Hold')}>Hold</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
