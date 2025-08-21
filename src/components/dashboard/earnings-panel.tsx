
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Coins } from 'lucide-react';

interface EarningsPanelProps {
    title: string;
    amount: string;
}

export function EarningsPanel({ title, amount = "0.00" }: EarningsPanelProps) {
  return (
    <Card className="bg-muted/40">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2">
        <CardTitle className="text-xs font-medium">
          {title}
        </CardTitle>
        <Coins className="h-3 w-3 text-muted-foreground" />
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <div className="text-xs font-bold">${amount}</div>
      </CardContent>
    </Card>
  );
}
