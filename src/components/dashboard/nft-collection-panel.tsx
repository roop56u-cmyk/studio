

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/contexts/WalletContext";
import { Loader2, Sparkles, Clock, Layers } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import type { NftStakingPackage } from "@/app/dashboard/admin/nft-staking/page";

const StakingCountdown = ({ expiry }: { expiry: number }) => {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const remaining = expiry - now;
            if (remaining <= 0) {
                setTimeLeft("Ready to Claim");
                clearInterval(interval);
                return;
            }
            const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
            const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
            setTimeLeft(`${String(days).padStart(2, '0')}:${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
        }, 1000);
        return () => clearInterval(interval);
    }, [expiry]);

    return <p className="text-xs font-mono text-primary">{timeLeft}</p>;
};

export function NftCollectionPanel() {
    const { nftCollection, sellNft, nftCooldowns, stakeNft, claimStakedNftRewards } = useWallet();
    const [sellingId, setSellingId] = useState<string | null>(null);
    const [isStakingDialogOpen, setIsStakingDialogOpen] = useState(false);
    const [selectedNftId, setSelectedNftId] = useState<string | null>(null);
    const [stakingPackages, setStakingPackages] = useState<NftStakingPackage[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem("nft_staking_packages");
        if (stored) {
            setStakingPackages(JSON.parse(stored).filter((p: NftStakingPackage) => p.enabled));
        }
    }, []);

    const handleSell = async (nftId: string) => {
        setSellingId(nftId);
        await sellNft(nftId);
        setSellingId(null);
    }
    
    const handleStakeClick = (nftId: string) => {
        setSelectedNftId(nftId);
        setIsStakingDialogOpen(true);
    };

    const handleSelectPackage = (packageId: string) => {
        if (selectedNftId) {
            stakeNft(selectedNftId, packageId);
        }
        setIsStakingDialogOpen(false);
        setSelectedNftId(null);
    };
    
    const formatDuration = (totalHours: number) => {
        if (totalHours <= 0) return 'Invalid duration';
        const totalMinutes = Math.round(totalHours * 60);
        const days = Math.floor(totalMinutes / (24 * 60));
        const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
        const minutes = totalMinutes % 60;
        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        return parts.join(' ') || '0m';
    };


    const formatCooldown = (endsAt: number) => {
        const now = Date.now();
        const secondsLeft = Math.floor((endsAt - now) / 1000);
        if (secondsLeft <= 0) return 'Ready';
        const hours = Math.floor(secondsLeft / 3600);
        const minutes = Math.floor((secondsLeft % 3600) / 60);
        const seconds = secondsLeft % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
      2,
      '0'
    )}`;
    };

    const failedCooldownActive = nftCooldowns.failedSale && nftCooldowns.failedSale > Date.now();
    const successfulCooldownActive = nftCooldowns.successfulSale && nftCooldowns.successfulSale > Date.now();

    return (
        <>
         <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="space-y-6 pr-6">
                {(failedCooldownActive || successfulCooldownActive) && (
                    <Card className="bg-muted">
                        <CardContent className="p-3 flex items-center gap-3 text-sm">
                            <Clock className="h-5 w-5 text-primary" />
                            <div>
                                <p className="font-semibold">{failedCooldownActive ? 'Failed Sale Cooldown' : 'Successful Sale Cooldown'}</p>
                                <p className="text-xs text-muted-foreground">
                                    Time until next sale: {formatCooldown(nftCooldowns.failedSale! || nftCooldowns.successfulSale!)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}
                {nftCollection.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {nftCollection.map(nft => {
                            const isStaked = !!nft.stakedUntil;
                            const isClaimable = isStaked && Date.now() >= nft.stakedUntil!;

                            return (
                            <div key={nft.id} className="space-y-2 group">
                                <div className="aspect-square rounded-lg overflow-hidden border relative">
                                    <Image 
                                        src={nft.artworkUrl} 
                                        alt={nft.title}
                                        width={200}
                                        height={200}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        unoptimized
                                    />
                                    {isStaked && (
                                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-2 text-center text-white">
                                            <Layers className="h-8 w-8 mb-2" />
                                            <p className="font-semibold text-sm">Staked</p>
                                            <StakingCountdown expiry={nft.stakedUntil!} />
                                        </div>
                                    )}
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-semibold truncate">{nft.title}</p>
                                    <p className="text-xs text-muted-foreground">Value: ${nft.currentValue.toFixed(2)}</p>
                                    <div className="flex gap-2 mt-2">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="w-full h-8"
                                            disabled={isStaked || sellingId === nft.id || failedCooldownActive || successfulCooldownActive}
                                            onClick={() => handleSell(nft.id)}
                                        >
                                            {sellingId === nft.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sell"}
                                        </Button>
                                        {isClaimable ? (
                                             <Button size="sm" className="w-full h-8" onClick={() => claimStakedNftRewards(nft.id)}>Claim</Button>
                                        ) : (
                                            <Button
                                                variant="default"
                                                size="sm"
                                                className="w-full h-8"
                                                disabled={isStaked}
                                                onClick={() => handleStakeClick(nft.id)}
                                            >
                                               {isStaked ? "Staked" : "Stake"}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )})}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center py-12 border-2 border-dashed rounded-lg mt-8">
                         <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold">Your Collection is Empty</h3>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Mint NFTs from your achievements to start your collection.
                        </p>
                    </div>
                )}
            </div>
        </ScrollArea>
        <Dialog open={isStakingDialogOpen} onOpenChange={setIsStakingDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Select Staking Package</DialogTitle>
                    <DialogDescription>Choose a package to stake your NFT and earn rewards.</DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh]">
                    <div className="space-y-4 pr-4 py-2">
                        {stakingPackages.map(pkg => (
                            <Card key={pkg.id} className="cursor-pointer hover:border-primary" onClick={() => handleSelectPackage(pkg.id)}>
                                <CardHeader>
                                    <CardTitle className="text-base">{pkg.name}</CardTitle>
                                    <CardDescription>Duration: {formatDuration(pkg.durationHours)}</CardDescription>
                                </CardHeader>
                                <CardContent className="text-sm">
                                    <p>Reward Rate: <strong className="text-primary">{pkg.rewardRatePercent}%</strong> of NFT value</p>
                                    <p>Fixed Bonus: <strong className="text-primary">{pkg.fixedTokenBonus} Tokens</strong></p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
        </>
    );
}
