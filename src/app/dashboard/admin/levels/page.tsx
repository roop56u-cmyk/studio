
"use client";

import React, { useState } from "react";
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
import { Trash2, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { levels as defaultLevels, Level } from "@/components/dashboard/level-tiers";

export default function ManageLevelsPage() {
    const { toast } = useToast();
    const [levels, setLevels] = useState<Level[]>(defaultLevels.filter(l => l.level > 0)); // Exclude level 0
    const [isClient, setIsClient] = React.useState(false);

    React.useEffect(() => {
        setIsClient(true);
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
            dailyTasks: 0,
            monthlyWithdrawals: 1,
            minWithdrawal: 0,
            earningPerTask: 0,
        }]);
         toast({ title: "New Level Added", description: "Don't forget to configure and save it." });
    };

    const deleteLevel = (index: number) => {
        const newLevels = levels.filter((_, i) => i !== index);
        setLevels(newLevels);
        toast({ title: "Level Deleted", variant: "destructive" });
    };

    const saveChanges = () => {
        // Here you would typically save the 'levels' state to your backend or localStorage
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
                                    defaultChecked={true} // In a real app, this would be based on level data
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
                            <Label htmlFor={`earningPerTask-${index}`}>Earning per Task ($)</Label>
                            <Input id={`earningPerTask-${index}`} type="number" value={level.earningPerTask} onChange={(e) => handleInputChange(index, 'earningPerTask', Number(e.target.value))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`referrals-${index}`}>Required Referrals</Label>
                            <Input id={`referrals-${index}`} type="number" value={level.referrals ?? ''} onChange={(e) => handleInputChange(index, 'referrals', Number(e.target.value))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`monthlyWithdrawals-${index}`}>Monthly Withdrawals</Label>
                            <Input id={`monthlyWithdrawals-${index}`} type="number" value={level.monthlyWithdrawals} onChange={(e) => handleInputChange(index, 'monthlyWithdrawals', Number(e.target.value))} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor={`minWithdrawal-${index}`}>Min Withdrawal (USDT)</Label>
                            <Input id={`minWithdrawal-${index}`} type="number" value={level.minWithdrawal} onChange={(e) => handleInputChange(index, 'minWithdrawal', Number(e.target.value))} />
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
