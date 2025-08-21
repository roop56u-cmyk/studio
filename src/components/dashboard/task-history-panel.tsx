
"use client";

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

export function TaskHistoryPanel() {
  const { completedTasks } = useWallet();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Task Title</TableHead>
          <TableHead className="text-right">Earnings (USDT)</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {completedTasks.length > 0 ? (
          completedTasks.map((task) => (
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
  );
}
