
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
import { useWallet } from "@/contexts/WalletContext";
import { format } from "date-fns";
import { Button } from "../ui/button";
import { CardFooter } from "../ui/card";

const ITEMS_PER_PAGE = 10;

export function TaskHistoryPanel() {
  const { completedTasks } = useWallet();
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(completedTasks.length / ITEMS_PER_PAGE);
  const paginatedTasks = completedTasks.slice(
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
        <CardTitle>Tasks</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task Title</TableHead>
              <TableHead className="text-right">Earnings (USDT)</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTasks.length > 0 ? (
              paginatedTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell className="text-right font-mono text-green-600">
                    +${task.earnings.toFixed(4)}
                  </TableCell>
                  <TableCell>
                    {format(new Date(task.completedAt), "PPpp")}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  You have not completed any tasks yet.
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
