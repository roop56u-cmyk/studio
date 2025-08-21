
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function SystemSettingsPage() {
    const { toast } = useToast();
    const [referralBonus, setReferralBonus] = useState("5");
    const [minDepositForBonus, setMinDepositForBonus] = useState("100");
    const [withdrawalDays, setWithdrawalDays] = useState("45");
    const [isWithdrawalRestriction, setIsWithdrawalRestriction] = useState(true);

    const handleSaveChanges = () => {
        // In a real app, these would be saved to a database.
        // For now, we use localStorage to simulate a persistent backend.
        localStorage.setItem('system_withdrawal_restriction_enabled', JSON.stringify(isWithdrawalRestriction));
        localStorage.setItem('system_withdrawal_restriction_days', withdrawalDays);
        localStorage.setItem('system_referral_bonus', referralBonus);
        localStorage.setItem('system_min_deposit_for_bonus', minDepositForBonus);
        
        toast({
            title: "Settings Saved",
            description: "Global system settings have been updated.",
        });
    };

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground">
          Manage global application settings and features.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Referral Program</CardTitle>
          <CardDescription>
            Configure the bonuses for user referrals.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="referral-bonus">Referral Bonus ($)</Label>
            <Input id="referral-bonus" type="number" value={referralBonus} onChange={e => setReferralBonus(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="min-deposit">Min First Deposit for Bonus ($)</Label>
            <Input id="min-deposit" type="number" value={minDepositForBonus} onChange={e => setMinDepositForBonus(e.target.value)} />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Restrictions</CardTitle>
          <CardDescription>
            Set rules for when users can make withdrawals. This applies to all users based on their first deposit date.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
                <Switch id="withdrawal-restriction-toggle" checked={isWithdrawalRestriction} onCheckedChange={setIsWithdrawalRestriction} />
                <Label htmlFor="withdrawal-restriction-toggle">Enable Withdrawal Restriction</Label>
            </div>
            <div className="space-y-2">
                <Label htmlFor="withdrawal-days">Number of Days for Restriction</Label>
                <Input id="withdrawal-days" type="number" value={withdrawalDays} onChange={e => setWithdrawalDays(e.target.value)} disabled={!isWithdrawalRestriction}/>
            </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
          <Button onClick={handleSaveChanges}>Save All Settings</Button>
      </div>

    </div>
  );
}
