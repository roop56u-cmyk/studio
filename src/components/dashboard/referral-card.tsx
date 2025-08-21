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

export function ReferralCard() {
  const [code, setCode] = useState("Generating...");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Generate a unique code on the client-side to avoid hydration mismatch
    const newCode = "TRH-" + Math.random().toString(36).substring(2, 10).toUpperCase();
    setCode(newCode);
  }, []);

  const handleCopy = () => {
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
      <CardHeader>
        <CardTitle>Invite Friends</CardTitle>
        <CardDescription>
          Share your referral code to invite new members.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <Input value={code} readOnly className="font-mono text-center" />
          <Button variant="outline" size="icon" onClick={handleCopy} disabled={code === "Generating..."}>
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
