
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
import { useRequests } from "@/contexts/RequestContext";

export function AdminProfile() {
    const { toast } = useToast();
    const { requests, updateRequestStatus } = useRequests();

    const handleAction = (requestId: string, action: 'Approved' | 'Declined' | 'On Hold') => {
        const request = requests.find(r => r.id === requestId);
        if (!request) return;

        updateRequestStatus(requestId, action, request.user, request.type, request.amount);
        toast({
            title: `Request ${action}`,
            description: `Request ID ${requestId} has been marked as ${action.toLowerCase()}.`,
        });
    };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Panel</CardTitle>
        <CardDescription>
          Manage all user recharge and withdrawal requests from this panel.
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
              <TableHead>Address</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>History (D/W)</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">{request.id}</TableCell>
                <TableCell>{request.user}</TableCell>
                <TableCell>
                    <Badge variant={request.type === 'Withdrawal' ? 'destructive' : 'secondary'}>{request.type}</Badge>
                </TableCell>
                <TableCell>${request.amount.toFixed(2)}</TableCell>
                <TableCell className="font-mono text-xs">{request.address || 'N/A'}</TableCell>
                <TableCell>{request.level}</TableCell>
                <TableCell>{request.deposits}/{request.withdrawals}</TableCell>
                <TableCell>${request.balance.toFixed(2)}</TableCell>
                <TableCell>{request.date}</TableCell>
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
                                <DropdownMenuItem onClick={() => handleAction(request.id, 'Approved')}>Approve</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleAction(request.id, 'Declined')}>Decline</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleAction(request.id, 'On Hold')}>On Hold</DropdownMenuItem>
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
