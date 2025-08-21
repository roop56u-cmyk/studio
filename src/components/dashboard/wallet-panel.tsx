"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function WalletPanel() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const rechargeAddress = "0x4D26340f3B52DCf82dd537cBF3c7e4C1D9b53BDc";

  const handleCopy = () => {
    navigator.clipboard.writeText(rechargeAddress);
    setCopied(true);
    toast({
      title: "Address Copied!",
      description: "The USDT BEP20 address has been copied to your clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
        title: "Withdrawal Request Submitted",
        description: "Your withdrawal request is pending approval from the admin.",
      });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crypto Wallet</CardTitle>
        <CardDescription>
          Manage your USDT (BEP20) funds here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="recharge">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recharge">Recharge</TabsTrigger>
            <TabsTrigger value="withdrawal">Withdrawal</TabsTrigger>
          </TabsList>
          <TabsContent value="recharge" className="mt-4">
            <div className="space-y-4">
              <Label htmlFor="recharge-address">USDT BEP20 Recharge Address</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="recharge-address"
                  value={rechargeAddress}
                  readOnly
                  className="font-mono text-center text-sm"
                />
                <Button variant="outline" size="icon" onClick={handleCopy}>
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Only send USDT (BEP20) to this address. Sending any other
                assets may result in permanent loss.
              </p>
            </div>
          </TabsContent>
          <TabsContent value="withdrawal" className="mt-4">
            <form onSubmit={handleWithdraw}>
              <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="withdrawal-address">Your USDT BEP20 Address</Label>
                    <Input id="withdrawal-address" placeholder="0x..." required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input id="amount" type="number" placeholder="100.00" required />
                </div>
                <Button type="submit" className="w-full">Request Withdrawal</Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
