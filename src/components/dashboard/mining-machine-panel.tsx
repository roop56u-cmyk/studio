
"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { useWallet } from "@/contexts/WalletContext";
import { Card, CardContent } from "@/components/ui/card";
import { Gem, Power } from 'lucide-react';
import { MiningPackageStore } from './mining-package-store';

const MiningAnimation = () => (
  <div className="relative w-48 h-48 mx-auto">
    <div className="absolute inset-0 border-4 border-blue-400/30 rounded-full animate-pulse"></div>
    <div className="absolute inset-2 border-4 border-purple-400/30 rounded-full animate-pulse [animation-delay:0.2s]"></div>
    <div className="absolute inset-4 border-4 border-pink-400/30 rounded-full animate-pulse [animation-delay:0.4s]"></div>
    <div className="absolute inset-0 flex items-center justify-center">
      <Gem className="w-20 h-20 text-white/80 animate-[spin_10s_linear_infinite]" />
    </div>
  </div>
);

export function MiningMachinePanel() {
  const {
    activeMiningPackage,
    startMining,
    claimMinedTokens,
    purchasedMiningPackages,
    isMiningEnabled,
  } = useWallet();

  const handleStart = (packageId: string) => {
    startMining(packageId);
  };
  
  if (!isMiningEnabled) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
      <CardContent className="p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Token Mining</h2>
        <MiningAnimation />
        
        {activeMiningPackage ? (
          <div className="mt-4">
            <p className="text-lg font-semibold">{activeMiningPackage.name}</p>
            <p className="text-sm text-white/70">Expires in: {new Date(activeMiningPackage.expiresAt).toLocaleString()}</p>
            <Button className="mt-4 w-full" onClick={claimMinedTokens} disabled={Date.now() < activeMiningPackage.expiresAt}>
              {Date.now() < activeMiningPackage.expiresAt ? 'Mining...' : 'Claim Tokens'}
            </Button>
          </div>
        ) : purchasedMiningPackages.some(p => p.status === 'available') ? (
            <div className="mt-4">
                 <p className="text-lg font-semibold">Ready to Mine!</p>
                 <p className="text-sm text-white/70 mb-4">You have purchased packages ready to be activated.</p>
                 {purchasedMiningPackages.filter(p => p.status === 'available').map(pkg => (
                    <Button key={pkg.id} className="w-full mt-2" onClick={() => handleStart(pkg.id)}>
                        <Power className="mr-2 h-4 w-4" /> Start {pkg.name}
                    </Button>
                ))}
            </div>
        ) : (
          <div className="mt-4">
            <p className="text-lg font-semibold">No Active Mining Package</p>
            <p className="text-sm text-white/70 mb-4">Purchase a package to start mining tokens.</p>
            <MiningPackageStore />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
