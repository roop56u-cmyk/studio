
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
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
import { Percent, Info, AlertTriangle, ListChecks, Users, BarChart4, PlusCircle, Wand2, Loader2, Trash2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { generateNftLibraryArtwork, saveNftToLibrary } from "@/app/actions";
import { nftLibrary, NftLibraryItem } from "@/lib/nft-library";
import { ScrollArea } from "@/components/ui/scroll-area";


// A simplified list of achievements for the admin panel
const availableAchievements = [
  { id: 'task-10', title: 'Task Novice', icon: <ListChecks className="h-5 w-5 text-blue-500" /> },
  { id: 'task-100', title: 'Task Apprentice', icon: <ListChecks className="h-5 w-5 text-blue-500" /> },
  { id: 'task-500', title: 'Task Master', icon: <ListChecks className="h-5 w-5 text-blue-500" /> },
  { id: 'referral-1', title: 'Team Builder', icon: <Users className="h-5 w-5 text-green-500" /> },
  { id: 'referral-10', title: 'Team Leader', icon: <Users className="h-5 w-5 text-green-500" /> },
  { id: 'level-3', title: 'Gold Tier', icon: <BarChart4 className="h-5 w-5 text-yellow-500" /> },
  { id: 'level-5', title: 'Diamond Tier', icon: <BarChart4 className="h-5 w-5 text-yellow-500" /> },
];

export default function NftSettingsPage() {
    const { toast } = useToast();
    const [isClient, setIsClient] = useState(false);

    const [isNftEnabled, setIsNftEnabled] = useState(false);
    const [mintingFee, setMintingFee] = useState(10);
    const [platformCommission, setPlatformCommission] = useState(2.5);
    const [marketSuccessRate, setMarketSuccessRate] = useState(80);
    const [failedAttemptCooldown, setFailedAttemptCooldown] = useState(60); // Total minutes
    const [successfulSaleCooldown, setSuccessfulSaleCooldown] = useState(24 * 60); // Total minutes
    const [mintableAchievementIds, setMintableAchievementIds] = useState<string[]>([]);
    
    // State for AI generation
    const [isGenerating, setIsGenerating] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [currentLibrary, setCurrentLibrary] = useState<NftLibraryItem[]>(nftLibrary);


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
            setSuccessfulSaleCooldown(parsed.successfulSaleCooldown ?? 24 * 60);
            setMintableAchievementIds(parsed.mintableAchievementIds ?? []);
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
            mintableAchievementIds,
        };
        localStorage.setItem("nft_market_settings", JSON.stringify(settings));
        toast({
            title: "NFT Settings Saved",
            description: "The NFT circulation market settings have been updated.",
        });
    };
    
    const handleGenerate = async () => {
        if (!prompt.trim()) {
            toast({ variant: 'destructive', title: 'Prompt is empty', description: 'Please enter a prompt to generate artwork.' });
            return;
        }
        setIsGenerating(true);
        try {
            const { imageUrl } = await generateNftLibraryArtwork(prompt);
            const result = await saveNftToLibrary({ imageUrl, aiHint: prompt });
            if (result.success && result.newItem) {
                setCurrentLibrary(prev => [...prev, result.newItem!]);
                toast({ title: 'Artwork Added!', description: 'The new NFT artwork has been added to your library.' });
                setPrompt("");
            } else {
                 throw new Error(result.error || "Failed to save the new artwork to the library file.");
            }
        } catch (error) {
            console.error("AI Generation Error:", error);
            toast({ variant: 'destructive', title: 'Generation Failed', description: 'Could not generate or save the artwork.' });
        } finally {
            setIsGenerating(false);
        }
    };
    
    // Helper to get hours and minutes from total minutes
    const getTimeParts = (totalMinutes: number) => {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return { hours, minutes };
    };

    // Helper to update total minutes from hours or minutes input
    const handleTimeChange = (
        setter: React.Dispatch<React.SetStateAction<number>>,
        currentTotalMinutes: number,
        part: 'hours' | 'minutes',
        value: string
    ) => {
        const numericValue = parseInt(value, 10);
        if (isNaN(numericValue) || numericValue < 0) return;

        const { hours, minutes } = getTimeParts(currentTotalMinutes);

        if (part === 'hours') {
            setter(numericValue * 60 + minutes);
        } else {
            setter(hours * 60 + numericValue);
        }
    };
    
    const handleMintableToggle = (achievementId: string, checked: boolean) => {
        setMintableAchievementIds(prev => {
            if (checked) {
                return [...prev, achievementId];
            } else {
                return prev.filter(id => id !== achievementId);
            }
        });
    };
    
    if (!isClient) return null;

    return (
        <div className="grid gap-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">NFT Circulation Settings</h1>
                <p className="text-muted-foreground">
                    Configure the economics and rules of the internal NFT marketplace.
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

                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold tracking-tight">Minting Rules</h4>
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
                           <Label>Mintable Achievements</Label>
                           <p className="text-xs text-muted-foreground">Select which achievements can be turned into NFTs by users.</p>
                           <div className="space-y-2 rounded-md border p-4">
                             {availableAchievements.map(ach => (
                               <div key={ach.id} className="flex items-center justify-between">
                                 <Label htmlFor={`ach-${ach.id}`} className="flex items-center gap-3 font-normal">
                                   {ach.icon}
                                   {ach.title}
                                 </Label>
                                 <Switch
                                   id={`ach-${ach.id}`}
                                   checked={mintableAchievementIds.includes(ach.id)}
                                   onCheckedChange={(checked) => handleMintableToggle(ach.id, checked)}
                                   disabled={!isNftEnabled}
                                 />
                               </div>
                             ))}
                           </div>
                        </div>
                    </div>
                    
                    <Separator />

                     <div className="space-y-4">
                        <h4 className="text-lg font-semibold tracking-tight">Market Rules</h4>
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
                            <Label>Failed Sale Cooldown</Label>
                            <div className="flex items-center gap-4">
                                <div className="flex-1 space-y-1">
                                    <Input
                                        id="failed-cooldown-hours"
                                        type="number"
                                        value={getTimeParts(failedAttemptCooldown).hours}
                                        onChange={(e) => handleTimeChange(setFailedAttemptCooldown, failedAttemptCooldown, 'hours', e.target.value)}
                                        disabled={!isNftEnabled}
                                    />
                                     <p className="text-xs text-muted-foreground">Hours</p>
                                </div>
                               <div className="flex-1 space-y-1">
                                    <Input
                                        id="failed-cooldown-minutes"
                                        type="number"
                                        value={getTimeParts(failedAttemptCooldown).minutes}
                                        onChange={(e) => handleTimeChange(setFailedAttemptCooldown, failedAttemptCooldown, 'minutes', e.target.value)}
                                        disabled={!isNftEnabled}
                                    />
                                     <p className="text-xs text-muted-foreground">Minutes</p>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">How long a user must wait to try again after a failed sale attempt.</p>
                        </div>
                         <div className="space-y-2">
                            <Label>Successful Sale Cooldown</Label>
                            <div className="flex items-center gap-4">
                               <div className="flex-1 space-y-1">
                                    <Input
                                        id="successful-cooldown-hours"
                                        type="number"
                                        value={getTimeParts(successfulSaleCooldown).hours}
                                        onChange={(e) => handleTimeChange(setSuccessfulSaleCooldown, successfulSaleCooldown, 'hours', e.target.value)}
                                        disabled={!isNftEnabled}
                                    />
                                    <p className="text-xs text-muted-foreground">Hours</p>
                                </div>
                                <div className="flex-1 space-y-1">
                                    <Input
                                        id="successful-cooldown-minutes"
                                        type="number"
                                        value={getTimeParts(successfulSaleCooldown).minutes}
                                        onChange={(e) => handleTimeChange(setSuccessfulSaleCooldown, successfulSaleCooldown, 'minutes', e.target.value)}
                                        disabled={!isNftEnabled}
                                    />
                                     <p className="text-xs text-muted-foreground">Minutes</p>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">How long a user must wait before they can sell another NFT after a successful sale.</p>
                        </div>
                     </div>
                 </CardContent>
                 <CardFooter>
                    <Button onClick={handleSave} disabled={!isClient}>Save All Changes</Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>NFT Artwork Library</CardTitle>
                    <CardDescription>Manage the collection of artwork available for NFTs. Add new art using AI.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full">
                                <PlusCircle className="mr-2 h-4 w-4" /> Add New Artwork with AI
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Generate New NFT Artwork</DialogTitle>
                                <DialogDescription>Describe the artwork you want to create. Be specific for best results.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="prompt">AI Prompt</Label>
                                    <Input id="prompt" value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="e.g., golden trophy with diamond inlays" />
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="secondary">Cancel</Button>
                                </DialogClose>
                                <Button onClick={handleGenerate} disabled={isGenerating}>
                                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                    Generate
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Separator className="my-4"/>
                    <ScrollArea className="h-72">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pr-4">
                            {currentLibrary.map(item => (
                                <div key={item.achievementId} className="space-y-2 group relative">
                                    <Image src={item.imageUrl} alt={item.aiHint} width={150} height={150} className="rounded-lg object-cover aspect-square" unoptimized/>
                                    <p className="text-xs text-muted-foreground truncate" title={item.aiHint}>{item.aiHint}</p>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
