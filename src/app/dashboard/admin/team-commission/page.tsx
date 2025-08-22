
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
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function TeamCommissionPage() {
    const { toast } = useToast();
    const [isClient, setIsClient] = useState(false);

    const [rates, setRates] = useState({ level1: 10, level2: 5, level3: 2 });
    const [enabled, setEnabled] = useState({ level1: true, level2: true, level3: true });

    useEffect(() => {
        setIsClient(true);
        const savedRates = localStorage.getItem('team_commission_rates');
        if (savedRates) setRates(JSON.parse(savedRates));

        const savedEnabled = localStorage.getItem('team_commission_enabled');
        if (savedEnabled) setEnabled(JSON.parse(savedEnabled));
    }, []);

    const handleRateChange = (level: keyof typeof rates, value: string) => {
        const numericValue = parseFloat(value);
        if (!isNaN(numericValue)) {
            setRates(prev => ({ ...prev, [level]: numericValue }));
        }
    };

    const handleToggleChange = (level: keyof typeof enabled, checked: boolean) => {
        setEnabled(prev => ({ ...prev, [level]: checked }));
    };

    const saveChanges = () => {
        localStorage.setItem('team_commission_rates', JSON.stringify(rates));
        localStorage.setItem('team_commission_enabled', JSON.stringify(enabled));
        toast({
            title: "Settings Saved!",
            description: "Team commission rates have been updated.",
        });
    };

    if (!isClient) {
        return (
             <div className="grid gap-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Team Commission Settings</h1>
                    <p className="text-muted-foreground">
                    Manage the commission rates for all team layers.
                    </p>
                </div>
            </div>
        )
    }

  return (
    <div className="grid gap-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Team Commission Settings</h1>
            <p className="text-muted-foreground">
            Manage the commission rates for all team layers.
            </p>
        </div>

        <Card>
             <CardHeader>
                <CardTitle>Commission Rules</CardTitle>
                <CardDescription>
                    Set the percentage of daily task earnings that referrers get from their team members.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {Object.keys(rates).map((level, index) => (
                    <div key={level} className="flex flex-col md:flex-row md:items-center md:justify-between rounded-lg border p-4">
                        <div className="space-y-1.5 mb-4 md:mb-0">
                            <Label htmlFor={`rate-${level}`} className="text-base">Level {index + 1} Commission</Label>
                            <div className="flex items-center">
                               <p className="text-sm text-muted-foreground">
                                    Set the commission rate for Level {index + 1} referrals.
                                </p>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                             <Button variant="ghost" size="icon" className="h-6 w-6 ml-2">
                                                <Info className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="max-w-xs">This is the percentage of a team member's <br/> daily task earnings that their referrer will receive.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="relative w-24">
                             <Input 
                                id={`rate-${level}`} 
                                type="number" 
                                value={rates[level as keyof typeof rates]} 
                                onChange={(e) => handleRateChange(level as keyof typeof rates, e.target.value)} 
                                className="pr-8"
                            />
                            <span className="absolute inset-y-0 right-3 flex items-center text-muted-foreground text-sm">%</span>
                           </div>
                           <Switch
                             checked={enabled[level as keyof typeof enabled]}
                             onCheckedChange={(checked) => handleToggleChange(level as keyof typeof enabled, checked)}
                           />
                        </div>
                    </div>
                ))}
            </CardContent>
            <CardFooter>
                 <Button onClick={saveChanges}>Save All Changes</Button>
            </CardFooter>
        </Card>
    </div>
  );
}
