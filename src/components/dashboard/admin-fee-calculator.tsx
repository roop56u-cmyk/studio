
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign } from "lucide-react";
import { levels as allLevels } from "@/components/dashboard/level-tiers";

const feeRates = {
    1: 0.05, // 5%
    2: 0.03, // 3%
    3: 0.01, // 1%
    4: 0.01, // 1%
    5: 0.01, // 1%
};

export function AdminFeeCalculator() {
  const [amount, setAmount] = useState("");
  const numericAmount = parseFloat(amount) || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Fee Calculator</CardTitle>
        <CardDescription>
          Calculate withdrawal fees based on user level.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fee-amount">Withdrawal Amount (USDT)</Label>
          <div className="relative">
             <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input
                id="fee-amount"
                type="number"
                placeholder="100.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8"
            />
          </div>
        </div>
        <div className="space-y-2 rounded-lg border p-3">
            <h4 className="text-sm font-medium mb-2">Calculated Fees:</h4>
            {allLevels.filter(l => l.level > 0).map(level => {
                const rate = (feeRates[level.level as keyof typeof feeRates] || 0);
                const fee = numericAmount * rate;
                return (
                    <div key={level.level} className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Level {level.level} ({rate * 100}%):</span>
                        <span className="font-mono font-semibold">${fee.toFixed(2)}</span>
                    </div>
                )
            })}
        </div>
      </CardContent>
    </Card>
  );
}
