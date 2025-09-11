
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/contexts/WalletContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, ShieldCheck, CalendarCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";

function ProfileInfoCard() {
    const { currentUser } = useAuth();
    
    return (
         <Card>
        <CardHeader className="items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={`https://placehold.co/100x100/${'673ab7'}/${'ffffff'}.png?text=${currentUser?.fullName?.[0].toUpperCase() ?? 'U'}`} alt="User Avatar" data-ai-hint="user avatar" />
                <AvatarFallback className="text-4xl">{currentUser?.fullName?.[0].toUpperCase() ?? 'U'}</AvatarFallback>
            </Avatar>
            <CardTitle>{currentUser?.fullName}</CardTitle>
            <CardDescription>{currentUser?.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                <User className="h-5 w-5 text-muted-foreground" />
                <span className="text-foreground">{currentUser?.fullName}</span>
            </div>
             <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <span className="text-foreground">{currentUser?.email}</span>
            </div>
            <div className="flex items-center justify-between gap-4 p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-4">
                    <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                    <span className="text-foreground">Account Status</span>
                </div>
                 <Badge variant={currentUser?.status === 'active' ? 'default' : 'secondary'} className={cn(currentUser?.status === 'active' && 'bg-green-100 text-green-800')}>
                    {currentUser?.status.charAt(0).toUpperCase()}{currentUser?.status.slice(1)}
                </Badge>
            </div>
            {currentUser?.status === 'active' && currentUser.activatedAt && (
              <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                  <CalendarCheck className="h-5 w-5 text-muted-foreground" />
                   <div className="text-sm">
                      <p className="text-foreground font-medium">Activated On</p>
                      <p className="text-muted-foreground text-xs">{format(new Date(currentUser.activatedAt), 'PPP p')}</p>
                   </div>
              </div>
            )}
             <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard/settings">
                    Manage Settings & Password
                </Link>
            </Button>
        </CardContent>
      </Card>
    )
}

function NftCollectionTab() {
    const { nftCollection } = useWallet();

    return (
        <Card>
            <CardHeader>
                <CardTitle>My NFT Collection</CardTitle>
                <CardDescription>A gallery of your unique, minted achievements.</CardDescription>
            </CardHeader>
            <CardContent>
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
                                    />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-semibold truncate">{nft.title}</p>
                                    <p className="text-xs text-muted-foreground">Minted: {format(new Date(nft.mintedAt), 'MMM d, yyyy')}</p>
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

export default function ProfilePage() {
  const [isClient, setIsClient] = useState(false);
  const [isNftFeatureEnabled, setIsNftFeatureEnabled] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const settings = localStorage.getItem("nft_market_settings");
    if (settings) {
        setIsNftFeatureEnabled(JSON.parse(settings).isNftEnabled ?? false);
    }
  }, []);

  if (!isClient) {
    return null; // The parent sheet handles loading state
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">
            View your account details and collectibles.
          </p>
        </div>
      </div>
       <Tabs defaultValue="profile" className="w-full">
        <TabsList className={cn(
          "grid w-full",
          isNftFeatureEnabled ? "grid-cols-2" : "grid-cols-1"
        )}>
            <TabsTrigger value="profile">
                <User className="mr-2 h-4 w-4" /> Profile
            </TabsTrigger>
            {isNftFeatureEnabled && (
                <TabsTrigger value="nfts">
                    <Sparkles className="mr-2 h-4 w-4" /> NFT Collection
                </TabsTrigger>
            )}
        </TabsList>
        <TabsContent value="profile" className="mt-4">
            <ProfileInfoCard />
        </TabsContent>
        {isNftFeatureEnabled && (
            <TabsContent value="nfts" className="mt-4">
                <NftCollectionTab />
            </TabsContent>
        )}
        </Tabs>
    </div>
  );
}
