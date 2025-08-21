
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Wallet2, ArrowLeftRight } from 'lucide-react';
import { Button } from "../ui/button";

interface WalletBalanceProps {
    title: string;
    description: string;
    balance: string;
    onMoveToMain?: () => void;
}

export function WalletBalance({ title, description, balance = "0.00", onMoveToMain }: WalletBalanceProps) {
  const canMove = parseFloat(balance) > 0;
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
       {onMoveToMain && (
        <CardFooter className="pt-0">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={onMoveToMain}
            disabled={!canMove}
            >
            <ArrowLeftRight className="mr-2 h-3 w-3" />
            Move to Main Wallet
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
