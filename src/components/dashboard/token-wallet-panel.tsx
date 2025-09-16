
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useWallet } from "@/contexts/WalletContext";
import { Gem, Repeat, Lock, ArrowDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';

export function TokenWalletPanel() {
  const { tokenBalance, tokenomics, convertTokensToUsdt, isMiningEnabled, isConversionEnabled } = useWallet();
  const [amountToConvert, setAmountToConvert] = useState('');
  const { toast } = useToast();

  if (!isMiningEnabled) {
    return null;
  }

  const handleConvert = () => {
    const amount = parseFloat(amountToConvert);
    if (isNaN(amount) || amount <= 0) {
      toast({ variant: 'destructive', title: 'Invalid Amount', description: 'Please enter a valid amount to convert.' });
      return;
    }
    if (amount > tokenBalance) {
      toast({ variant: 'destructive', title: 'Insufficient Tokens', description: `You cannot convert more than your available balance of ${tokenBalance.toFixed(4)} ${tokenomics.tokenSymbol}.` });
      return;
    }
    convertTokensToUsdt(amount);
    setAmountToConvert('');
  };

  const usdtValue = amountToConvert ? (parseFloat(amountToConvert) / tokenomics.conversionRate) : 0;
  const feeAmount = usdtValue * (tokenomics.conversionFee / 100);
  const netUsdtValue = usdtValue - feeAmount;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gem className="h-5 w-5 text-primary" />
          {tokenomics.tokenName} Wallet
        </CardTitle>
        <CardDescription>
          Your balance: <strong className="text-foreground">{tokenBalance.toFixed(4)} {tokenomics.tokenSymbol}</strong>
          <span className="text-muted-foreground"> (≈ ${(tokenBalance / tokenomics.conversionRate).toFixed(2)} USDT)</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConversionEnabled ? (
          <>
            <div className="space-y-2">
              <label htmlFor="convert-amount">Amount to Convert ({tokenomics.tokenSymbol})</label>
              <Input 
                id="convert-amount"
                type="number"
                placeholder={`e.g., 50`}
                value={amountToConvert}
                onChange={(e) => setAmountToConvert(e.target.value)}
              />
            </div>
            
            <div className="space-y-3 text-sm border rounded-md p-3 bg-muted/50">
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Gross USDT Value</span>
                    <span>${usdtValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Conversion Fee ({tokenomics.conversionFee}%)</span>
                    <span className="text-red-500">-${feeAmount.toFixed(2)}</span>
                </div>
                <Separator />
                 <div className="flex justify-between items-center font-bold">
                    <span>You Receive</span>
                    <span>${netUsdtValue > 0 ? netUsdtValue.toFixed(2) : '0.00'}</span>
                </div>
            </div>

            <Button onClick={handleConvert} className="w-full">
              <Repeat className="mr-2 h-4 w-4" />
              Convert to USDT
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-4 bg-muted rounded-md">
            <Lock className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm font-semibold">Conversion Disabled</p>
            <p className="text-xs text-muted-foreground">Token conversion is currently disabled by the admin.</p>
          </div>
        )}
        <p className="text-xs text-muted-foreground text-center">
          Conversion Rate: {tokenomics.conversionRate} {tokenomics.tokenSymbol} = 1 USDT
        </p>
      </CardContent>
    </Card>
  );
}
