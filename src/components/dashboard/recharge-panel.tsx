"use client";

import { useState } from "react";
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
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function RechargePanel() {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recharge Address</CardTitle>
        <CardDescription>
          Only send USDT (BEP20) to this address.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
            Sending any other assets may result in permanent loss.
            </p>
        </div>
      </CardContent>
    </Card>
  );
}
