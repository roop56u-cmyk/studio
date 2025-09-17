
"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
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
import { useWallet } from "@/contexts/WalletContext";
import { Button } from "../ui/button";
import { CardFooter } from "../ui/card";
import { format } from "date-fns";

const ITEMS_PER_PAGE = 10;

export function ActivityHistoryPanel() {
  const { activityHistory } = useWallet();
  const [currentPage, setCurrentPage] = useState(1);
  
  const sortedHistory = [...activityHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalPages = Math.ceil(sortedHistory.length / ITEMS_PER_PAGE);
  const paginatedHistory = sortedHistory.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };
  
  const getBadgeVariant = (type: string, status?: string) => {
      if (status === 'Approved') return 'default';
      if (status === 'Declined') return 'destructive';
      if (status === 'Pending' || status === 'On Hold') return 'secondary';

      switch (type) {
          case 'Withdrawal':
          case 'Fund Movement (Out)':
              return 'destructive';
          case 'Recharge':
          case 'Team Commission':
          case 'Sign-up Bonus':
          case 'Team Reward':
          case 'Interest Claim':
          case 'Fund Movement (In)':
          case 'New Referral':
              return 'default';
          default:
              return 'secondary';
      }
  }

  return (
    <Card className="shadow-none border-none">
      <CardHeader className="px-1">
        <CardTitle>Activity</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount (USDT)</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedHistory.length > 0 ? (
                paginatedHistory.map((activity) => (
                <TableRow key={activity.id}>
                    <TableCell className="font-medium">{activity.description}</TableCell>
                    <TableCell>
                        <Badge variant={getBadgeVariant(activity.type, activity.status)}>{activity.status ? `${activity.type} (${activity.status})` : activity.type}</Badge>
                    </TableCell>
                    <TableCell className={`text-right font-mono ${activity.amount && activity.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {activity.amount !== undefined ? `${activity.amount > 0 ? '+' : ''}$${activity.amount.toFixed(2)}` : 'N/A'}
                    </TableCell>
                    <TableCell>{format(new Date(activity.date), "PPpp")}</TableCell>
                </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={4} className="text-center">
                        You have no activity history yet.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
       {totalPages > 1 && (
        <CardFooter className="flex items-center justify-between mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
