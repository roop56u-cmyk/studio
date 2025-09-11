
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
import { Percent, Info, AlertTriangle } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export default function NftSettingsPage() {
    const { toast } = useToast();
    const [isClient, setIsClient] = useState(false);

    const [isNftEnabled, setIsNftEnabled] = useState(false);
    const [mintingFee, setMintingFee] = useState(10);
    const [platformCommission, setPlatformCommission] = useState(2.5);
    const [marketSuccessRate, setMarketSuccessRate] = useState(80);
    const [failedAttemptCooldown, setFailedAttemptCooldown] = useState(60);
    const [successfulSaleCooldown, setSuccessfulSaleCooldown] = useState(24);

    useEffect(() => {
        setIsClient(true);
        const settings = localStorage.getItem("nft_market_settings");
        if (settings) {
            const parsed = JSON.parse(settings);
            setIsNftEnabled(parsed.isNftEnabled ?? false);
            setMintingFee(parsed.mintingFee ?? 10);
            setPlatformCommission(parsed.platformCommission ?? 2.5);
            setMarketSuccessRate(parsed.marketSuccessRate ?? 80);
            setFailedAttemptCooldown(parsed.failedAttemptCooldown ?? 60);
            setSuccessfulSaleCooldown(parsed.successfulSaleCooldown ?? 24);
        }
    }, []);

    const handleSave = () => {
        const settings = {
            isNftEnabled,
            mintingFee,
            platformCommission,
            marketSuccessRate,
            failedAttemptCooldown,
            successfulSaleCooldown,
        };
        localStorage.setItem("nft_market_settings", JSON.stringify(settings));
        toast({
            title: "NFT Settings Saved",
            description: "The NFT circulation market settings have been updated.",
        });
    };
    
    if (!isClient) return null;

    return (
        <div className="grid gap-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">NFT Circulation Settings</h1>
                <p className="text-muted-foreground">
                    Configure the economics of the internal NFT marketplace.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>NFT Marketplace</CardTitle>
                        <Switch
                            checked={isNftEnabled}
                            onCheckedChange={setIsNftEnabled}
                        />
                    </div>
                    <CardDescription>
                        Enable or disable the entire NFT circulation feature for all users.
                    </CardDescription>
                </CardHeader>
                 <CardContent className="space-y-6">
                    <div className="flex items-center gap-2 text-sm text-amber-800 bg-amber-100 p-3 rounded-md border border-amber-200">
                        <AlertTriangle className="h-5 w-5"/>
                        <p>Changes here have a major impact on the platform's economy. Adjust with caution.</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="minting-fee">Minting Fee (USDT)</Label>
                        <Input
                            id="minting-fee"
                            type="number"
                            value={mintingFee}
                            onChange={(e) => setMintingFee(Number(e.target.value))}
                            disabled={!isNftEnabled}
                        />
                        <p className="text-xs text-muted-foreground">The cost for a user to create a new NFT from an achievement.</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="platform-commission">Platform Commission (%)</Label>
                         <div className="relative">
                            <Input
                                id="platform-commission"
                                type="number"
                                value={platformCommission}
                                onChange={(e) => setPlatformCommission(Number(e.target.value))}
                                disabled={!isNftEnabled}
                                className="pr-8"
                            />
                            <Percent className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground">The percentage the platform takes from every successful NFT sale.</p>
                    </div>
                     <div className="space-y-4">
                        <Label htmlFor="market-success-rate">Market Success Rate: {marketSuccessRate}%</Label>
                        <Slider
                            id="market-success-rate"
                            min={0}
                            max={100}
                            step={1}
                            value={[marketSuccessRate]}
                            onValueChange={(value) => setMarketSuccessRate(value[0])}
                            disabled={!isNftEnabled}
                        />
                        <p className="text-xs text-muted-foreground">The chance of a user's sale attempt being successful. A lower rate reduces the payout velocity.</p>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="failed-cooldown">Failed Sale Cooldown (Minutes)</Label>
                        <Input
                            id="failed-cooldown"
                            type="number"
                            value={failedAttemptCooldown}
                            onChange={(e) => setFailedAttemptCooldown(Number(e.target.value))}
                            disabled={!isNftEnabled}
                        />
                        <p className="text-xs text-muted-foreground">How long a user must wait to try again after a failed sale attempt.</p>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="successful-cooldown">Successful Sale Cooldown (Hours)</Label>
                        <Input
                            id="successful-cooldown"
                            type="number"
                            value={successfulSaleCooldown}
                            onChange={(e) => setSuccessfulSaleCooldown(Number(e.target.value))}
                            disabled={!isNftEnabled}
                        />
                        <p className="text-xs text-muted-foreground">How long a user must wait before they can sell another NFT after a successful sale.</p>
                    </div>
                 </CardContent>
                 <CardFooter>
                    <Button onClick={handleSave} disabled={!isClient}>Save All Changes</Button>
                </CardFooter>
            </Card>
        </div>
    );
}
