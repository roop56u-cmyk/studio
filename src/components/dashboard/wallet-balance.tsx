
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Wallet2 } from 'lucide-react';

interface WalletBalanceProps {
    title: string;
    description: string;
    balance: string;
}

export function WalletBalance({ title, description, balance = "0.00" }: WalletBalanceProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-3">
        <CardTitle className="text-xs font-medium">
          {title}
        </CardTitle>
        <Wallet2 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="text-lg font-bold">{balance}</div>
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
