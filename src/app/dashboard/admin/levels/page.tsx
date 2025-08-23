
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
import { Trash2, PlusCircle, Calculator, Percent } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { levels as defaultLevels, Level } from "@/components/dashboard/level-tiers";

export default function ManageLevelsPage() {
    const { toast } = useToast();
    const [levels, setLevels] = useState<Level[]>(defaultLevels.filter(l => l.level > 0));
    const [isClient, setIsClient] = React.useState(false);

    useEffect(() => {
        setIsClient(true);
        const storedLevels = localStorage.getItem("platform_levels");
        if (storedLevels) {
            // Merge with defaults to ensure all properties are present
            const parsedLevels = JSON.parse(storedLevels);
            const mergedLevels = defaultLevels.filter(l => l.level > 0).map(defaultLevel => {
                const storedLevel = parsedLevels.find((p: Level) => p.level === defaultLevel.level);
                return storedLevel ? { ...defaultLevel, ...storedLevel } : defaultLevel;
            });
            setLevels(mergedLevels);
        }
    }, []);

    const handleInputChange = (index: number, field: keyof Level, value: string | number) => {
        const newLevels = [...levels];
        (newLevels[index] as any)[field] = value;
        setLevels(newLevels);
    };

    const handleToggleChange = (index: number, enabled: boolean) => {
        // In a real app, you'd handle the enabled/disabled state
        toast({
            title: `Level ${levels[index].level} ${enabled ? "Enabled" : "Disabled"}`,
            description: "This is a mock action for the demo.",
        });
    };

    const addNewLevel = () => {
        const newLevelNumber = levels.length > 0 ? Math.max(...levels.map(l => l.level)) + 1 : 1;
        setLevels([...levels, {
            level: newLevelNumber,
            minAmount: 0,
            rate: 0,
            referrals: 0,
            dailyTasks: 1,
            monthlyWithdrawals: 1,
            minWithdrawal: 0,
            earningPerTask: 0, // This is now calculated dynamically
            withdrawalFee: 0,
        }]);
         toast({ title: "New Level Added", description: "Don't forget to configure and save it." });
    };

    const deleteLevel = (index: number) => {
        const newLevels = levels.filter((_, i) => i !== index);
        setLevels(newLevels);
        toast({ title: "Level Deleted", variant: "destructive" });
    };

    const saveChanges = () => {
        localStorage.setItem("platform_levels", JSON.stringify(levels));
        toast({
            title: "Changes Saved!",
            description: "The level configuration has been updated.",
        });
    };

    if (!isClient) {
        return (
             <div className="grid gap-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manage Investment Levels</h1>
                    <p className="text-muted-foreground">
                    Configure the investment tiers for all users.
                    </p>
                </div>
            </div>
        )
    }

  return (
    <div className="grid gap-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Manage Investment Levels</h1>
            <p className="text-muted-foreground">
            Configure the investment tiers for all users.
            </p>
        </div>

        <div className="space-y-4">
            {levels.map((level, index) => (
                <Card key={level.level}>
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span>Level {level.level}</span>
                            <div className="flex items-center gap-4">
                                <Switch 
                                    id={`enable-level-${level.level}`} 
                                    defaultChecked={true}
                                    onCheckedChange={(checked) => handleToggleChange(index, checked)}
                                />
                                <Button variant="ghost" size="icon" onClick={() => deleteLevel(index)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor={`minAmount-${index}`}>Min Amount (USDT)</Label>
                            <Input id={`minAmount-${index}`} type="number" value={level.minAmount} onChange={(e) => handleInputChange(index, 'minAmount', Number(e.target.value))} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor={`rate-${index}`}>Daily Rate (%)</Label>
                            <Input id={`rate-${index}`} type="number" value={level.rate} onChange={(e) => handleInputChange(index, 'rate', Number(e.target.value))} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor={`dailyTasks-${index}`}>Daily Tasks</Label>
                            <Input id={`dailyTasks-${index}`} type="number" value={level.dailyTasks} onChange={(e) => handleInputChange(index, 'dailyTasks', Number(e.target.value))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`referrals-${index}`}>Required Referrals</Label>
                            <Input id={`referrals-${index}`} type="number" value={level.referrals} onChange={(e) => handleInputChange(index, 'referrals', Number(e.target.value))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`monthlyWithdrawals-${index}`}>Monthly Withdrawals</Label>
                            <Input id={`monthlyWithdrawals-${index}`} type="number" value={level.monthlyWithdrawals} onChange={(e) => handleInputChange(index, 'monthlyWithdrawals', Number(e.target.value))} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor={`minWithdrawal-${index}`}>Min Withdrawal (USDT)</Label>
                            <Input id={`minWithdrawal-${index}`} type="number" value={level.minWithdrawal} onChange={(e) => handleInputChange(index, 'minWithdrawal', Number(e.target.value))} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor={`withdrawalFee-${index}`}>Withdrawal Fee (%)</Label>
                            <div className="relative">
                                <Input id={`withdrawalFee-${index}`} type="number" value={level.withdrawalFee} onChange={(e) => handleInputChange(index, 'withdrawalFee', Number(e.target.value))} className="pr-8" />
                                <Percent className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>
                         <div className="space-y-2 md:col-span-2 lg:col-span-3">
                            <Label>Earning Per Task</Label>
                            <p className="text-sm text-muted-foreground">
                                This is now calculated automatically for each user based on their committed balance and the level's daily rate. For example, a user with a $1000 balance at this level would earn...
                            </p>
                             <p className="text-sm font-semibold text-primary">
                                ${(level.dailyTasks > 0 ? (1000 * (level.rate / 100)) / level.dailyTasks : 0).toFixed(4)} per task.
                             </p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>

        <div className="flex justify-between items-center">
            <Button variant="outline" onClick={addNewLevel}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Level
            </Button>
            <Button onClick={saveChanges}>Save All Changes</Button>
        </div>
    </div>
  );
}
