
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
      <CardHeader>
        <div className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-xs font-medium">
            {title}
          </CardTitle>
          <Wallet2 className="h-3 w-3 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-sm font-bold">{balance}</div>
        <p className="text-xs text-muted-foreground leading-tight">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
