
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
import { useRequests } from "@/contexts/RequestContext";
import { Button } from "../ui/button";
import { CardFooter } from "../ui/card";

const ITEMS_PER_PAGE = 10;

export function TransactionHistoryPanel() {
  const { userRequests } = useRequests();
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(userRequests.length / ITEMS_PER_PAGE);
  const paginatedRequests = userRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  return (
    <Card className="shadow-none border-none">
      <CardHeader className="px-1">
        <CardTitle>Transactions</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
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
            {paginatedRequests.length > 0 ? (
                paginatedRequests.map((request) => (
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
                        You have no transaction history yet.
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
