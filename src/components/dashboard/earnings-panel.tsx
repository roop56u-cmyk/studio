
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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3">
        <CardTitle className="text-xs font-medium">
          {title}
        </CardTitle>
        <Coins className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="text-base font-bold">${amount}</div>
      </CardContent>
    </Card>
  );
}
