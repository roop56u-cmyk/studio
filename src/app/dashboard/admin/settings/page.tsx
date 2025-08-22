
"use client";

import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { levels } from "@/components/dashboard/level-tiers";

export default function SystemSettingsPage() {
    const { toast } = useToast();
    const [referralBonus, setReferralBonus] = useState("5");
    const [minDepositForBonus, setMinDepositForBonus] = useState("100");
    const [rechargeAddress, setRechargeAddress] = useState("0x4D26340f3B52DCf82dd537cBF3c7e4C1D9b53BDc");
    const [isWithdrawalRestriction, setIsWithdrawalRestriction] = useState(true);
    const [withdrawalRestrictionDays, setWithdrawalRestrictionDays] = useState("45");
    const [withdrawalRestrictionMessage, setWithdrawalRestrictionMessage] = useState("Please wait for 45 days to initiate withdrawal request.");
    const [restrictedLevels, setRestrictedLevels] = useState<number[]>([1]); // Default to level 1
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        const savedReferralBonus = localStorage.getItem('system_referral_bonus');
        if (savedReferralBonus) setReferralBonus(savedReferralBonus);
        
        const savedMinDeposit = localStorage.getItem('system_min_deposit_for_bonus');
        if (savedMinDeposit) setMinDepositForBonus(savedMinDeposit);
        
        const savedRechargeAddress = localStorage.getItem('system_recharge_address');
        if (savedRechargeAddress) setRechargeAddress(savedRechargeAddress);

        const savedWithdrawalRestriction = localStorage.getItem('system_withdrawal_restriction_enabled');
        if (savedWithdrawalRestriction) setIsWithdrawalRestriction(JSON.parse(savedWithdrawalRestriction));

        const savedWithdrawalDays = localStorage.getItem('system_withdrawal_restriction_days');
        if (savedWithdrawalDays) setWithdrawalRestrictionDays(savedWithdrawalDays);
        
        const savedWithdrawalMessage = localStorage.getItem('system_withdrawal_restriction_message');
        if (savedWithdrawalMessage) setWithdrawalRestrictionMessage(savedWithdrawalMessage);

        const savedRestrictedLevels = localStorage.getItem('system_withdrawal_restricted_levels');
        if (savedRestrictedLevels) setRestrictedLevels(JSON.parse(savedRestrictedLevels));
        
        setIsClient(true);
    }, []);


    const handleSaveChanges = () => {
        localStorage.setItem('system_recharge_address', rechargeAddress);
        localStorage.setItem('system_withdrawal_restriction_enabled', JSON.stringify(isWithdrawalRestriction));
        localStorage.setItem('system_withdrawal_restriction_days', withdrawalRestrictionDays);
        localStorage.setItem('system_withdrawal_restriction_message', withdrawalRestrictionMessage);
        localStorage.setItem('system_referral_bonus', referralBonus);
        localStorage.setItem('system_min_deposit_for_bonus', minDepositForBonus);
        localStorage.setItem('system_withdrawal_restricted_levels', JSON.stringify(restrictedLevels));
        
        toast({
            title: "Settings Saved",
            description: "Global system settings have been updated.",
        });
    };

    const handleLevelRestrictionChange = (level: number, checked: boolean) => {
        setRestrictedLevels(prev => 
            checked ? [...prev, level] : prev.filter(l => l !== level)
        );
    };
    
    if (!isClient) {
        return null;
    }

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
          <CardTitle>Recharge Settings</CardTitle>
          <CardDescription>
            Set the official address where users will send their deposits.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recharge-address">Official USDT BEP20 Recharge Address</Label>
            <Input id="recharge-address" type="text" value={rechargeAddress} onChange={e => setRechargeAddress(e.target.value)} />
             <p className="text-xs text-muted-foreground">This address will be displayed to all users on the recharge page.</p>
          </div>
        </CardContent>
      </Card>


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
            Set rules for when users can make withdrawals.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
                <Switch id="withdrawal-restriction-toggle" checked={isWithdrawalRestriction} onCheckedChange={setIsWithdrawalRestriction} />
                <Label htmlFor="withdrawal-restriction-toggle">Enable Withdrawal Restriction</Label>
            </div>
             <div className="space-y-2">
                <Label htmlFor="withdrawal-days">Restriction Period (Days)</Label>
                <Input 
                    id="withdrawal-days" 
                    type="number"
                    value={withdrawalRestrictionDays} 
                    onChange={e => setWithdrawalRestrictionDays(e.target.value)}
                    disabled={!isWithdrawalRestriction}
                />
                 <p className="text-xs text-muted-foreground">The number of days a user must wait after their first deposit.</p>
            </div>
             <div className="space-y-2">
                <Label htmlFor="withdrawal-message">Restriction Popup Message</Label>
                <Textarea 
                    id="withdrawal-message" 
                    value={withdrawalRestrictionMessage} 
                    onChange={e => setWithdrawalRestrictionMessage(e.target.value)}
                    disabled={!isWithdrawalRestriction}
                    rows={3}
                />
            </div>
             <div className="space-y-2">
                <Label>Apply Restriction to Levels</Label>
                 <div className="flex flex-wrap gap-4 pt-2">
                    {levels.filter(l => l.level > 0).map(level => (
                        <div key={level.level} className="flex items-center space-x-2">
                            <Checkbox
                                id={`level-${level.level}`}
                                checked={restrictedLevels.includes(level.level)}
                                onCheckedChange={(checked) => handleLevelRestrictionChange(level.level, !!checked)}
                                disabled={!isWithdrawalRestriction}
                            />
                            <Label htmlFor={`level-${level.level}`} className="font-normal">Level {level.level}</Label>
                        </div>
                    ))}
                </div>
            </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
          <Button onClick={handleSaveChanges}>Save All Settings</Button>
      </div>

    </div>
  );
}
