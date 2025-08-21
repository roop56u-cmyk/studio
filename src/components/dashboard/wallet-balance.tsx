"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Wallet2 } from 'lucide-react';

export function WalletBalance() {
  // Mock balance for now
  const balance = "1,234.56";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          USDT Balance
        </CardTitle>
        <Wallet2 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{balance}</div>
        <p className="text-xs text-muted-foreground">
          Available for withdrawal
        </p>
      </CardContent>
    </Card>
  );
}
