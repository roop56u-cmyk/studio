
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
import { DollarSign } from "lucide-react";

export type DailyReward = {
  day: number;
  reward: number;
};

export default function ManageDailyRewardsPage() {
    const { toast } = useToast();
    const [rewards, setRewards] = useState<DailyReward[]>(
        Array.from({ length: 7 }, (_, i) => ({ day: i + 1, reward: 0 }))
    );
    const [isEnabled, setIsEnabled] = useState(true);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const storedRewards = localStorage.getItem("daily_login_rewards");
        if (storedRewards) {
            const parsedRewards = JSON.parse(storedRewards);
            // Merge with default to ensure we always have 7 days
            const merged = Array.from({ length: 7 }, (_, i) => {
                const found = parsedRewards.find((r: DailyReward) => r.day === i + 1);
                return found || { day: i + 1, reward: 0 };
            });
            setRewards(merged);
        }

        const storedEnabled = localStorage.getItem("daily_login_rewards_enabled");
        if (storedEnabled) {
            setIsEnabled(JSON.parse(storedEnabled));
        }
    }, []);

    const handleRewardChange = (day: number, value: string) => {
        const numericValue = parseFloat(value) || 0;
        setRewards(prev =>
            prev.map(r => (r.day === day ? { ...r, reward: numericValue } : r))
        );
    };

    const saveChanges = () => {
        localStorage.setItem("daily_login_rewards", JSON.stringify(rewards));
        localStorage.setItem("daily_login_rewards_enabled", JSON.stringify(isEnabled));
        toast({
            title: "Settings Saved!",
            description: "Daily login reward settings have been updated.",
        });
    };
    
    if (!isClient) return null;

  return (
    <div className="grid gap-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Manage Daily Login Rewards</h1>
            <p className="text-muted-foreground">
                Configure the rewards for consecutive daily user check-ins.
            </p>
        </div>

        <Card>
             <CardHeader>
                <CardTitle>Daily Reward Configuration</CardTitle>
                <CardDescription>
                    Set the USDT reward for each consecutive day of a user's login streak.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center space-x-2">
                    <Switch id="enable-daily-rewards" checked={isEnabled} onCheckedChange={setIsEnabled} />
                    <Label htmlFor="enable-daily-rewards">Enable Daily Login Reward System</Label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {rewards.map(reward => (
                        <div key={reward.day} className="space-y-2">
                            <Label htmlFor={`day-${reward.day}`}>Day {reward.day} Reward</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id={`day-${reward.day}`}
                                    type="number"
                                    placeholder="e.g., 0.50"
                                    value={reward.reward}
                                    onChange={(e) => handleRewardChange(reward.day, e.target.value)}
                                    className="pl-8"
                                    disabled={!isEnabled}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
            <CardFooter>
                 <Button onClick={saveChanges}>Save All Changes</Button>
            </CardFooter>
        </Card>
    </div>
  );
}
