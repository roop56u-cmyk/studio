

"use client";

import { useState, useEffect, useCallback } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";


export default function SystemSettingsPage() {
    const { toast } = useToast();
    // Referral
    const [referralBonusEnabled, setReferralBonusEnabled] = useState(true);
    const [referralBonus, setReferralBonus] = useState("8");
    const [minDepositForBonus, setMinDepositForBonus] = useState("100");
    // Withdrawal
    const [isWithdrawalRestriction, setIsWithdrawalRestriction] = useState(true);
    const [withdrawalRestrictionDays, setWithdrawalRestrictionDays] = useState("45");
    const [withdrawalRestrictionMessage, setWithdrawalRestrictionMessage] = useState("Please wait for 45 days to initiate withdrawal request.");
    const [restrictedLevels, setRestrictedLevels] = useState<number[]>([1]); // Default to level 1
    const [multipleAddressesEnabled, setMultipleAddressesEnabled] = useState(true);

    // Earning Model
    const [earningModel, setEarningModel] = useState("dynamic"); // 'dynamic' or 'fixed'
    
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        // Referral
        const savedBonusEnabled = localStorage.getItem('system_referral_bonus_enabled');
        if (savedBonusEnabled) setReferralBonusEnabled(JSON.parse(savedBonusEnabled));
        const savedReferralBonus = localStorage.getItem('system_referral_bonus');
        if (savedReferralBonus) setReferralBonus(savedReferralBonus);
        const savedMinDeposit = localStorage.getItem('system_min_deposit_for_bonus');
        if (savedMinDeposit) setMinDepositForBonus(savedMinDeposit);
        
        // Withdrawal
        const savedWithdrawalRestriction = localStorage.getItem('system_withdrawal_restriction_enabled');
        if (savedWithdrawalRestriction) setIsWithdrawalRestriction(JSON.parse(savedWithdrawalRestriction));

        const savedWithdrawalDays = localStorage.getItem('system_withdrawal_restriction_days');
        if (savedWithdrawalDays) setWithdrawalRestrictionDays(savedWithdrawalDays);
        
        const savedWithdrawalMessage = localStorage.getItem('system_withdrawal_restriction_message');
        if (savedWithdrawalMessage) setWithdrawalRestrictionMessage(savedWithdrawalMessage);

        const savedRestrictedLevels = localStorage.getItem('system_withdrawal_restricted_levels');
        if (savedRestrictedLevels) setRestrictedLevels(JSON.parse(savedRestrictedLevels));

        const savedMultipleAddresses = localStorage.getItem('system_multiple_addresses_enabled');
        if (savedMultipleAddresses) setMultipleAddressesEnabled(JSON.parse(savedMultipleAddresses));
        
        // Earning Model
        const savedEarningModel = localStorage.getItem('system_earning_model');
        if (savedEarningModel) setEarningModel(savedEarningModel);
        
        setIsClient(true);
    }, []);


    const handleSaveChanges = () => {
        // Referral
        localStorage.setItem('system_referral_bonus_enabled', JSON.stringify(referralBonusEnabled));
        localStorage.setItem('system_referral_bonus', referralBonus);
        localStorage.setItem('system_min_deposit_for_bonus', minDepositForBonus);
        
        // Withdrawal
        localStorage.setItem('system_withdrawal_restriction_enabled', JSON.stringify(isWithdrawalRestriction));
        localStorage.setItem('system_withdrawal_restriction_days', withdrawalRestrictionDays);
        localStorage.setItem('system_withdrawal_restriction_message', withdrawalRestrictionMessage);
        localStorage.setItem('system_withdrawal_restricted_levels', JSON.stringify(restrictedLevels));
        localStorage.setItem('system_multiple_addresses_enabled', JSON.stringify(multipleAddressesEnabled));

        // Earning Model
        localStorage.setItem('system_earning_model', earningModel);
        
        toast({
            title: "Settings Saved",
            description: "Global system settings have been updated.",
        });
        
        // Reload to ensure all components get the new settings
        window.location.reload();
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
          <CardTitle>Earning Model</CardTitle>
          <CardDescription>
            Choose how task earnings are calculated for users.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <RadioGroup value={earningModel} onValueChange={setEarningModel} className="space-y-2">
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dynamic" id="dynamic-earning" />
                    <Label htmlFor="dynamic-earning" className="font-normal">Dynamic Earning (Daily Percentage)</Label>
                </div>
                 <p className="text-xs text-muted-foreground pl-6">Income is based on a % of the user's balance. (e.g., 2% of $500 balance / 20 tasks = $0.50 per task)</p>

                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fixed" id="fixed-earning" />
                    <Label htmlFor="fixed-earning" className="font-normal">Fixed Earning (Per Task)</Label>
                </div>
                 <p className="text-xs text-muted-foreground pl-6">Income is a fixed amount per task, set for each level in "Manage Levels".</p>
            </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sign-up Bonus Program</CardTitle>
          <CardDescription>
            Configure the bonus for a new user's first qualifying deposit.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch id="referral-bonus-toggle" checked={referralBonusEnabled} onCheckedChange={setReferralBonusEnabled} />
            <Label htmlFor="referral-bonus-toggle">Enable Sign-up Bonus</Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="referral-bonus">Sign-up Bonus ($)</Label>
            <Input id="referral-bonus" type="number" value={referralBonus} onChange={e => setReferralBonus(e.target.value)} disabled={!referralBonusEnabled} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="min-deposit">Min First Deposit for Bonus ($)</Label>
            <Input id="min-deposit" type="number" value={minDepositForBonus} onChange={e => setMinDepositForBonus(e.target.value)} disabled={!referralBonusEnabled} />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Settings</CardTitle>
          <CardDescription>
            Set rules for when and how users can make withdrawals.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-center space-x-2">
                <Switch id="multiple-addresses-toggle" checked={multipleAddressesEnabled} onCheckedChange={setMultipleAddressesEnabled} />
                <Label htmlFor="multiple-addresses-toggle">Allow Multiple Withdrawal Addresses</Label>
            </div>
             <p className="text-xs text-muted-foreground -mt-4">If disabled, users can only save one withdrawal address.</p>

            <div className="border-t pt-6">
                <div className="flex items-center space-x-2">
                    <Switch id="withdrawal-restriction-toggle" checked={isWithdrawalRestriction} onCheckedChange={setIsWithdrawalRestriction} />
                    <Label htmlFor="withdrawal-restriction-toggle">Enable Withdrawal Time Restriction</Label>
                </div>
                 <p className="text-xs text-muted-foreground mb-4">Set a waiting period after a user's first deposit.</p>
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
            </div>
             <div className="space-y-2">
                <Label htmlFor="withdrawal-message">Restriction Popup Message</Label>
                <Textarea 
                    id="withdrawal-message" 
                    value={withdrawalRestrictionMessage} 
                    onChange={(e) => setWithdrawalRestrictionMessage(e.target.value)}
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
