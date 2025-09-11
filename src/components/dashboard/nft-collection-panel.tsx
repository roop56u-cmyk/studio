
"use client";

import { useState } from "react";
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
import { Loader2, Sparkles, Clock } from "lucide-react";

export function NftCollectionPanel() {
    const { nftCollection, sellNft, nftCooldowns } = useWallet();
    const [sellingId, setSellingId] = useState<string | null>(null);

    const handleSell = async (nftId: string) => {
        setSellingId(nftId);
        await sellNft(nftId);
        setSellingId(null);
    }
    
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
        <Card>
            <CardHeader>
                <CardTitle>My NFT Collection</CardTitle>
                <CardDescription>A gallery of your unique, minted achievements. Click "Sell" to circulate an NFT.</CardDescription>
            </CardHeader>
            <CardContent>
                {(failedCooldownActive || successfulCooldownActive) && (
                    <Card className="mb-4 bg-muted">
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
                        {nftCollection.map(nft => (
                            <div key={nft.id} className="space-y-2 group">
                                <div className="aspect-square rounded-lg overflow-hidden border">
                                    <Image 
                                        src={nft.artworkUrl} 
                                        alt={nft.title}
                                        width={200}
                                        height={200}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        unoptimized
                                    />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-semibold truncate">{nft.title}</p>
                                    <p className="text-xs text-muted-foreground">Value: ${nft.currentValue.toFixed(2)}</p>
                                    <Button
                                        variant="default"
                                        size="sm"
                                        className="w-full mt-2 h-8"
                                        disabled={sellingId === nft.id || failedCooldownActive || successfulCooldownActive}
                                        onClick={() => handleSell(nft.id)}
                                    >
                                        {sellingId === nft.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sell NFT"}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center py-12 border-2 border-dashed rounded-lg">
                         <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold">Your Collection is Empty</h3>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Mint NFTs from your achievements to start your collection.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
