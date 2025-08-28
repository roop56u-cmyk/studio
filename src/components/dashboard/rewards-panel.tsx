

"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Gift, CheckCircle, UserPlus, Users } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";

export function RewardsPanel() {
    const { toast } = useToast();
    const {
        currentUser,
        users
    } = useAuth();
    const { 
        claimSignUpBonus, 
        hasClaimedSignUpBonus, 
        isEligibleForSignUpBonus,
        signupBonusAmount,
        referralBonusFor,
        claimReferralBonus,
        claimedReferralIds
    } = useWallet();

    const directReferrals = React.useMemo(() => {
        if (!currentUser) return [];
        return users.filter(u => u.referredBy === currentUser.referralCode);
    }, [currentUser, users]);

    const handleClaimSignUp = () => {
        const success = claimSignUpBonus();
        if (success) {
            toast({
                title: "Sign-up Bonus Claimed!",
                description: `The reward of $${signupBonusAmount.toFixed(2)} has been added to your main wallet.`,
            });
        }
    };
    
    const handleClaimReferral = (referralEmail: string) => {
        const claimedAmount = claimReferralBonus(referralEmail);
         if (claimedAmount) {
            toast({
                title: "Referral Bonus Claimed!",
                description: `Reward of $${claimedAmount.toFixed(2)} for referring ${referralEmail} has been credited.`,
            });
        }
    }

  return (
    <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="grid gap-6 pr-6">
            {/* Sign-up Bonus Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 bg-primary/10 text-primary p-2 rounded-full">
                           <Gift className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle>Sign-up Bonus</CardTitle>
                            <CardDescription>Claim your one-time activation bonus.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm">
                        Welcome! As a new active member, you're eligible for a one-time bonus based on your first deposit.
                    </p>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                    <p className="text-lg font-bold text-primary">${signupBonusAmount.toFixed(2)}</p>
                    <Button onClick={handleClaimSignUp} disabled={!isEligibleForSignUpBonus || hasClaimedSignUpBonus || signupBonusAmount === 0}>
                        {hasClaimedSignUpBonus ? (
                            <>
                                <CheckCircle className="mr-2 h-4 w-4" /> Claimed
                            </>
                        ) : !isEligibleForSignUpBonus ? "Not Eligible" : "Claim Now"}
                    </Button>
                </CardFooter>
            </Card>

            {/* Referral Bonuses Card */}
            <Card>
                 <CardHeader>
                    <div className="flex items-center gap-3">
                         <div className="flex-shrink-0 bg-accent/10 text-accent p-2 rounded-full">
                           <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle>Referral Rewards</CardTitle>
                            <CardDescription>Claim rewards for each friend you invite.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                     {directReferrals.length > 0 ? directReferrals.map((referral, index) => {
                         const isClaimed = claimedReferralIds.includes(referral.email);
                         const bonusAmount = referralBonusFor(referral.email);
                         const isClaimable = referral.isAccountActive && !isClaimed && bonusAmount > 0;

                         return (
                            <React.Fragment key={referral.email}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-sm">{referral.email}</p>
                                        <p className={`text-xs ${referral.isAccountActive ? 'text-green-600' : 'text-muted-foreground'}`}>
                                            {referral.isAccountActive ? 'Active' : 'Inactive'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-md font-bold text-primary">${bonusAmount.toFixed(2)}</p>
                                        <Button size="sm" onClick={() => handleClaimReferral(referral.email)} disabled={!isClaimable}>
                                           {isClaimed ? 'Claimed' : 'Claim'}
                                        </Button>
                                    </div>
                                </div>
                                {index < directReferrals.length - 1 && <Separator />}
                            </React.Fragment>
                         )
                     }) : (
                        <p className="text-center text-sm text-muted-foreground py-4">You have not referred anyone yet.</p>
                     )}
                </CardContent>
            </Card>
        </div>
    </ScrollArea>
  );
}
