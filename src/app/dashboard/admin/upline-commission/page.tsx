
"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Info, UserPlus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type UplineCommissionSettings = {
    enabled: boolean;
    rate: number;
    requiredReferrals: number;
}

export default function UplineCommissionPage() {
    const { toast } = useToast();
    const [isClient, setIsClient] = useState(false);

    const [settings, setSettings] = useState<UplineCommissionSettings>({ 
        enabled: false, 
        rate: 5, 
        requiredReferrals: 3 
    });
    
    useEffect(() => {
        setIsClient(true);
        const savedSettings = localStorage.getItem('upline_commission_settings');
        if (savedSettings) setSettings(JSON.parse(savedSettings));
    }, []);

    const handleInputChange = (field: keyof UplineCommissionSettings, value: string | number | boolean) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const saveChanges = () => {
        localStorage.setItem('upline_commission_settings', JSON.stringify(settings));
        toast({
            title: "Settings Saved!",
            description: "Upline commission settings have been updated.",
        });
    };

    if (!isClient) {
        return (
             <div className="grid gap-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Upline Commission Settings</h1>
                    <p className="text-muted-foreground">
                        Reward users for their upline's activity.
                    </p>
                </div>
            </div>
        )
    }

  return (
    <div className="grid gap-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Upline Commission Settings</h1>
            <p className="text-muted-foreground">
                Reward users for their upline's activity. This is paid from the upline's earnings to their downline.
            </p>
        </div>

        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Upline Commission Rules</CardTitle>
                    <Switch
                        checked={settings.enabled}
                        onCheckedChange={(checked) => handleInputChange('enabled', checked)}
                    />
                </div>
                <CardDescription>
                   Enable and configure the commission users receive from their direct sponsor (upline).
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="commission-rate">Commission Rate (%)</Label>
                    <div className="flex items-center">
                        <Input
                            id="commission-rate"
                            type="number"
                            value={settings.rate}
                            onChange={(e) => handleInputChange('rate', Number(e.target.value))}
                            disabled={!settings.enabled}
                            className="w-48"
                        />
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                     <Button variant="ghost" size="icon" className="h-6 w-6 ml-2">
                                        <Info className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="max-w-xs">The percentage of an upline's task earnings that will be paid to their direct downline member.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>

                 <div className="space-y-2">
                    <Label htmlFor="required-referrals">Required Active Referrals to Unlock</Label>
                     <div className="flex items-center">
                        <Input
                            id="required-referrals"
                            type="number"
                            value={settings.requiredReferrals}
                            onChange={(e) => handleInputChange('requiredReferrals', Number(e.target.value))}
                            disabled={!settings.enabled}
                            className="w-48"
                        />
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                     <Button variant="ghost" size="icon" className="h-6 w-6 ml-2">
                                        <UserPlus className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="max-w-xs">A user must have this many active L1 referrals to start receiving commission from their own upline.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                 <Button onClick={saveChanges}>Save All Changes</Button>
            </CardFooter>
        </Card>
    </div>
  );
}
