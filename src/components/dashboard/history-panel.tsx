
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
import { useRequests } from "@/contexts/RequestContext";
import { useAuth } from "@/contexts/AuthContext";

export function HistoryPanel() {
  const { requests } = useRequests();
  const { currentUser } = useAuth();
  
  // Filter requests for the currently logged-in user
  const userRequests = requests.filter(req => req.user === currentUser?.email);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity History</CardTitle>
        <CardDescription>
          A log of your recent recharge and withdrawal requests.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userRequests.length > 0 ? (
                userRequests.map((request) => (
                <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.id}</TableCell>
                    <TableCell>
                        <Badge variant={request.type === 'Withdrawal' ? 'destructive' : 'secondary'}>{request.type}</Badge>
                    </TableCell>
                    <TableCell>${request.amount.toFixed(2)}</TableCell>
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
                </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={5} className="text-center">
                        You have no activity history yet.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
