"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export function WithdrawalPanel() {
  const { toast } = useToast();

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Withdrawal Request Submitted",
      description: "Your withdrawal request is pending approval from the admin.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Withdrawal Form</CardTitle>
        <CardDescription>
          Submit a request to withdraw your funds.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleWithdraw}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="withdrawal-address">
                Your USDT BEP20 Address
              </Label>
              <Input id="withdrawal-address" placeholder="0x..." required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" placeholder="100.00" required />
            </div>
            <Button type="submit" className="w-full">
              Request Withdrawal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
