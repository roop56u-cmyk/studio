
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export function ReferralCard() {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const code = currentUser?.referralCode || "Generating...";

  const handleCopy = () => {
    if (code === "Generating...") return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast({
      title: "Copied to clipboard!",
      description: "Your referral code has been copied.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader className="p-2">
        <CardTitle className="text-sm">Invite Friends</CardTitle>
        <CardDescription className="text-xs">
          Share your referral code.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <div className="flex items-center space-x-2">
          <Input value={code} readOnly className="font-mono text-center text-xs h-8" />
          <Button variant="outline" size="icon" onClick={handleCopy} disabled={code === "Generating..."} className="h-8 w-8">
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
