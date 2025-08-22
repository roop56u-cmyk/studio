
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

// Helper to convert hex to HSL string
const hexToHslString = (hex: string): string => {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `${h} ${s}% ${l}%`;
};

export default function SystemSettingsPage() {
    const { toast } = useToast();
    const [referralBonus, setReferralBonus] = useState("5");
    const [minDepositForBonus, setMinDepositForBonus] = useState("100");
    const [rechargeAddress, setRechargeAddress] = useState("0x4D26340f3B52DCf82dd537cBF3c7e4C1D9b53BDc");
    const [isWithdrawalRestriction, setIsWithdrawalRestriction] = useState(true);
    const [withdrawalRestrictionDays, setWithdrawalRestrictionDays] = useState("45");
    const [withdrawalRestrictionMessage, setWithdrawalRestrictionMessage] = useState("Please wait for 45 days to initiate withdrawal request.");
    const [restrictedLevels, setRestrictedLevels] = useState<number[]>([1]); // Default to level 1
    const [selectedTheme, setSelectedTheme] = useState("abstract-tech");
    
    // Color states with default hex values
    const [primaryColor, setPrimaryColor] = useState("#673ab7");
    const [accentColor, setAccentColor] = useState("#009688");
    const [backgroundColor, setBackgroundColor] = useState("#f5f5f5");

    const [isClient, setIsClient] = useState(false);

    const applyColors = useCallback(() => {
        document.documentElement.style.setProperty('--primary', hexToHslString(primaryColor));
        document.documentElement.style.setProperty('--accent', hexToHslString(accentColor));
        document.documentElement.style.setProperty('--background', hexToHslString(backgroundColor));
        // Adjust card and sidebar background based on main background for better visibility
        const bgLuminance = parseInt(hexToHslString(backgroundColor).split(' ')[2]);
        const cardBg = bgLuminance > 50 ? `${bgLuminance - 2}%` : `${bgLuminance + 2}%`;
        const cardHsl = hexToHslString(backgroundColor).split(' ');
        document.documentElement.style.setProperty('--card', `${cardHsl[0]} ${cardHsl[1]} ${cardBg}`);
        document.documentElement.style.setProperty('--sidebar-background', `${cardHsl[0]} ${cardHsl[1]} ${cardBg}`);
    }, [primaryColor, accentColor, backgroundColor]);


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

        const savedTheme = localStorage.getItem('landing_theme');
        if (savedTheme) setSelectedTheme(savedTheme);

        const savedPrimaryColor = localStorage.getItem('theme_primary_color');
        if (savedPrimaryColor) setPrimaryColor(savedPrimaryColor);
        const savedAccentColor = localStorage.getItem('theme_accent_color');
        if (savedAccentColor) setAccentColor(savedAccentColor);
        const savedBackgroundColor = localStorage.getItem('theme_background_color');
        if (savedBackgroundColor) setBackgroundColor(savedBackgroundColor);
        
        setIsClient(true);
    }, []);
    
    useEffect(() => {
        if(isClient) {
            applyColors();
        }
    }, [isClient, applyColors])


    const handleSaveChanges = () => {
        localStorage.setItem('system_recharge_address', rechargeAddress);
        localStorage.setItem('system_withdrawal_restriction_enabled', JSON.stringify(isWithdrawalRestriction));
        localStorage.setItem('system_withdrawal_restriction_days', withdrawalRestrictionDays);
        localStorage.setItem('system_withdrawal_restriction_message', withdrawalRestrictionMessage);
        localStorage.setItem('system_referral_bonus', referralBonus);
        localStorage.setItem('system_min_deposit_for_bonus', minDepositForBonus);
        localStorage.setItem('system_withdrawal_restricted_levels', JSON.stringify(restrictedLevels));
        localStorage.setItem('landing_theme', selectedTheme);
        localStorage.setItem('theme_primary_color', primaryColor);
        localStorage.setItem('theme_accent_color', accentColor);
        localStorage.setItem('theme_background_color', backgroundColor);
        
        applyColors();

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
          <CardTitle>Theme &amp; Colors</CardTitle>
          <CardDescription>
            Customize the global color scheme and landing page appearance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>3D Welcome Animation Theme</Label>
            <RadioGroup value={selectedTheme} onValueChange={setSelectedTheme}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="abstract-tech" id="abstract-tech" />
                <Label htmlFor="abstract-tech" className="font-normal">Abstract Tech</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cosmic-voyage" id="cosmic-voyage" />
                <Label htmlFor="cosmic-voyage" className="font-normal">Cosmic Voyage</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="digital-matrix" id="digital-matrix" />
                <Label htmlFor="digital-matrix" className="font-normal">Digital Matrix</Label>
              </div>
               <div className="flex items-center space-x-2">
                <RadioGroupItem value="organic-growth" id="organic-growth" />
                <Label htmlFor="organic-growth" className="font-normal">Organic Growth</Label>
              </div>
            </RadioGroup>
          </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary-color">Primary Color</Label>
                <div className="flex items-center gap-2">
                    <Input id="primary-color" type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="p-1 h-10"/>
                    <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="h-10"/>
                </div>
              </div>
               <div className="space-y-2">
                <Label htmlFor="accent-color">Accent Color</Label>
                 <div className="flex items-center gap-2">
                    <Input id="accent-color" type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="p-1 h-10"/>
                    <Input value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="h-10"/>
                 </div>
              </div>
               <div className="space-y-2">
                <Label htmlFor="background-color">Background Color</Label>
                 <div className="flex items-center gap-2">
                    <Input id="background-color" type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="p-1 h-10"/>
                    <Input value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="h-10"/>
                 </div>
              </div>
          </div>
        </CardContent>
      </Card>


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
