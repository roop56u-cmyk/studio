
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
import { Gift, CheckCircle, UserPlus, Users, HandCoins } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { useRequests } from "@/contexts/RequestContext";
import type { PlatformEvent } from "@/app/dashboard/admin/reimbursements/page";
import Image from "next/image";
import { cn } from "@/lib/utils";


export function RewardsPanel({ isEventView = false }: { isEventView?: boolean }) {
    const { toast } = useToast();
    const { currentUser, users } = useAuth();
    const { addRequest, userRequests } = useRequests();
    const { 
        claimSignUpBonus, 
        hasClaimedSignUpBonus, 
        isEligibleForSignUpBonus,
        signupBonusAmount,
        referralBonusFor,
        claimReferralBonus,
        claimedReferralIds,
        setIsInactiveWarningOpen,
        currentLevel,
    } = useWallet();

    const [isSignupApprovalRequired, setIsSignupApprovalRequired] = React.useState(false);
    const [isReferralApprovalRequired, setIsReferralApprovalRequired] = React.useState(false);
    const [events, setEvents] = React.useState<PlatformEvent[]>([]);
    
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const signupApproval = localStorage.getItem('system_signup_bonus_approval_required');
            if(signupApproval) setIsSignupApprovalRequired(JSON.parse(signupApproval));

            const referralApproval = localStorage.getItem('system_referral_bonus_approval_required');
            if(referralApproval) setIsReferralApprovalRequired(JSON.parse(referralApproval));

            const storedEvents = localStorage.getItem('platform_events');
            if (storedEvents) {
                const allItems: PlatformEvent[] = JSON.parse(storedEvents);
                const now = new Date().getTime();
                const availableItems = allItems.filter(item => 
                    item.enabled &&
                    (!item.startTime || new Date(item.startTime).getTime() <= now) &&
                    (!item.endTime || new Date(item.endTime).getTime() >= now) &&
                    (!item.userEmail || item.userEmail === currentUser?.email)
                );
                setEvents(availableItems);
            }
        }
    }, [currentLevel, currentUser]);

    const directReferrals = React.useMemo(() => {
        if (!currentUser) return [];
        return users.filter(u => u.referredBy === currentUser.referralCode);
    }, [currentUser, users]);

    const hasPendingSignUpBonus = userRequests.some(req => req.type === 'Sign-up Bonus' && req.status === 'Pending');

    const handleClaimSignUp = () => {
        if (currentUser?.status !== 'active') {
            setIsInactiveWarningOpen(true);
            return;
        }

        if (isSignupApprovalRequired) {
            addRequest({ type: 'Sign-up Bonus', amount: signupBonusAmount });
            toast({
                title: "Sign-up Bonus Claim Submitted!",
                description: `Your claim for $${signupBonusAmount.toFixed(2)} is pending admin approval.`
            });
        } else {
            claimSignUpBonus();
        }
    };
    
    const handleClaimReferral = (referralEmail: string) => {
        if (currentUser?.status !== 'active') {
            setIsInactiveWarningOpen(true);
            return;
        }

        const bonusAmount = referralBonusFor(referralEmail);
        if (bonusAmount <= 0) return;

        if (isReferralApprovalRequired) {
            addRequest({ type: 'Referral Bonus', amount: bonusAmount, address: referralEmail });
            toast({
                title: "Referral Bonus Claim Submitted!",
                description: `Your claim for referring ${referralEmail} is pending admin approval.`
            });
        } else {
            claimReferralBonus(referralEmail);
        }
    }

    const handleClaimEvent = (item: PlatformEvent) => {
        if (currentUser?.status !== 'active') {
            setIsInactiveWarningOpen(true);
            return;
        }
        addRequest({ type: 'Event Claim', amount: item.amount, address: item.title });
        toast({
            title: "Event Reward Claim Submitted",
            description: `Your claim for "${item.title}" is now pending admin approval.`
        });
    }

    if(isEventView) {
        return (
             <ScrollArea className="h-[calc(100vh-8rem)]">
                <div className="grid gap-6 pr-6">
                    {events.length > 0 ? events.map(item => {
                         const hasPending = userRequests.some(req => req.type === 'Event Claim' && req.address === item.title && req.status === 'Pending');
                        const isClaimed = userRequests.some(req => req.type === 'Event Claim' && req.address === item.title && req.status === 'Approved');

                        return (
                        <Card key={item.id}>
                            <CardHeader>
                                {item.imageUrl && <Image src={item.imageUrl} alt={item.title} width={400} height={200} className="w-full h-32 object-cover rounded-t-lg -mt-6 -mx-6" />}
                                <div className={cn(item.imageUrl && 'pt-4')}>
                                    <CardTitle className="flex items-center gap-3">
                                         <div className="flex-shrink-0 bg-green-500/10 text-green-600 p-2 rounded-full">
                                            <Gift className="h-6 w-6" />
                                        </div>
                                        {item.title}
                                    </CardTitle>
                                    <CardDescription>{item.description}</CardDescription>
                                </div>
                            </CardHeader>
                            <CardFooter className="flex justify-between items-center">
                                <p className="text-lg font-bold text-primary">${item.amount.toFixed(2)}</p>
                                <Button onClick={() => handleClaimEvent(item)} disabled={hasPending || isClaimed}>
                                     {isClaimed ? "Claimed" : hasPending ? 'Pending' : 'Claim'}
                                </Button>
                            </CardFooter>
                        </Card>
                    )}) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>There are no active events at this time.</p>
                        </div>
                    )}
                </div>
             </ScrollArea>
        )
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
                        Welcome! As a new active member, you're eligible for a one-time bonus.
                    </p>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                    <p className="text-lg font-bold text-primary">${signupBonusAmount.toFixed(2)}</p>
                    <Button onClick={handleClaimSignUp} disabled={!isEligibleForSignUpBonus || hasClaimedSignUpBonus || hasPendingSignUpBonus || signupBonusAmount === 0 || currentUser?.status !== 'active'}>
                        {hasClaimedSignUpBonus ? (
                            <>
                                <CheckCircle className="mr-2 h-4 w-4" /> Claimed
                            </>
                        ) : hasPendingSignUpBonus ? ( "Pending Approval"
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
                         const hasPending = userRequests.some(req => req.type === 'Referral Bonus' && req.address === referral.email && req.status === 'Pending');
                         const bonusAmount = referralBonusFor(referral.email);
                         const isClaimable = referral.isAccountActive && !isClaimed && !hasPending && bonusAmount > 0 && currentUser?.status === 'active';

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
                                           {isClaimed ? 'Claimed' : hasPending ? 'Pending' : 'Claim'}
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
