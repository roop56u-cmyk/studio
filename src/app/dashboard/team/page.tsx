

"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Users, DollarSign, UserPlus, Briefcase, Activity, Award, X, Trophy, ArrowUp, Info, HandCoins, UserCheck } from "lucide-react";
import { useTeam } from "@/contexts/TeamContext";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TeamReward } from "../admin/team-rewards/page";
import { TeamSizeReward } from "../admin/team-size-rewards/page";
import { useToast } from "@/hooks/use-toast";
import { useRequests } from "@/contexts/RequestContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/contexts/WalletContext";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SalaryPackage } from "../admin/salary/page";

const TeamRewardCard = ({ reward, totalTeamBusiness }: { reward: TeamReward, totalTeamBusiness: number }) => {
    const { toast } = useToast();
    const { addRequest } = useRequests();
    const [isClaimed, setIsClaimed] = useState(false);

    useEffect(() => {
        const claimedStatus = localStorage.getItem(`team_reward_claimed_${reward.id}`);
        if (claimedStatus === 'true') {
            setIsClaimed(true);
        }
    }, [reward.id]);

    const progress = Math.min((totalTeamBusiness / reward.requiredAmount) * 100, 100);
    const canClaim = progress >= 100 && !isClaimed;

    const handleClaim = () => {
        addRequest({
            type: 'Team Reward',
            amount: reward.rewardAmount,
            address: reward.title, // Use title to identify the reward in admin panel
        });
        localStorage.setItem(`team_reward_claimed_${reward.id}`, 'true');
        setIsClaimed(true);
        toast({
            title: "Reward Claim Submitted!",
            description: `Your claim for "${reward.title}" is pending admin approval.`
        });
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary"/>
                    <CardTitle className="text-base">{reward.title}</CardTitle>
                </div>
                <CardDescription>{reward.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>${totalTeamBusiness.toLocaleString()} / ${reward.requiredAmount.toLocaleString()}</span>
                    </div>
                    <Progress value={progress} />
                </div>
                <div className="grid grid-cols-2 text-xs">
                    <p><strong className="text-foreground">Reward:</strong> ${reward.rewardAmount.toLocaleString()}</p>
                    <p><strong className="text-foreground">Level:</strong> {reward.level === 0 ? 'All' : `${reward.level}+`}</p>
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full" disabled={!canClaim} onClick={handleClaim}>
                    {isClaimed ? "Claimed" : canClaim ? "Claim Reward" : "In Progress"}
                </Button>
            </CardFooter>
        </Card>
    )
}

const TeamSizeRewardCard = ({ reward, totalActiveMembers }: { reward: TeamSizeReward, totalActiveMembers: number }) => {
    const { toast } = useToast();
    const { addRequest } = useRequests();
    const [isClaimed, setIsClaimed] = useState(false);

    useEffect(() => {
        const claimedStatus = localStorage.getItem(`team_size_reward_claimed_${reward.id}`);
        if (claimedStatus === 'true') {
            setIsClaimed(true);
        }
    }, [reward.id]);

    const progress = Math.min((totalActiveMembers / reward.requiredActiveMembers) * 100, 100);
    const canClaim = progress >= 100 && !isClaimed;

    const handleClaim = () => {
        addRequest({
            type: 'Team Size Reward',
            amount: reward.rewardAmount,
            address: reward.title, // Use title to identify the reward in admin panel
        });
        localStorage.setItem(`team_size_reward_claimed_${reward.id}`, 'true');
        setIsClaimed(true);
        toast({
            title: "Reward Claim Submitted!",
            description: `Your claim for "${reward.title}" is pending admin approval.`
        });
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500"/>
                    <CardTitle className="text-base">{reward.title}</CardTitle>
                </div>
                 <CardDescription>Achieve a team size milestone to claim a reward.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>Active Members</span>
                        <span>{totalActiveMembers} / {reward.requiredActiveMembers}</span>
                    </div>
                    <Progress value={progress} />
                </div>
                <div className="grid grid-cols-2 text-xs">
                    <p><strong className="text-foreground">Reward:</strong> ${reward.rewardAmount.toLocaleString()}</p>
                    <p><strong className="text-foreground">Level:</strong> {reward.level === 0 ? 'All' : `${reward.level}+`}</p>
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full" disabled={!canClaim} onClick={handleClaim}>
                    {isClaimed ? "Claimed" : canClaim ? "Claim Reward" : "In Progress"}
                </Button>
            </CardFooter>
        </Card>
    )
}

const SalaryPackageCard = ({ pkg, totalTeamBusiness, activeL1Referrals }: { pkg: SalaryPackage, totalTeamBusiness: number, activeL1Referrals: number }) => {
    const { toast } = useToast();
    const { addRequest } = useRequests();
    const { currentUser } = useAuth();
    const [lastClaimDate, setLastClaimDate] = useState<Date | null>(null);
    
    const businessMet = totalTeamBusiness >= pkg.requiredTeamBusiness;
    const referralsMet = activeL1Referrals >= pkg.requiredActiveReferrals;
    
    const businessProgress = Math.min((totalTeamBusiness / pkg.requiredTeamBusiness) * 100, 100);
    const referralProgress = Math.min((activeL1Referrals / pkg.requiredActiveReferrals) * 100, 100);


    useEffect(() => {
        if (currentUser) {
            const lastClaimStr = localStorage.getItem(`salary_claimed_${currentUser.email}_${pkg.id}`);
            if (lastClaimStr) {
                setLastClaimDate(new Date(lastClaimStr));
            }
        }
    }, [pkg.id, currentUser]);
    
    const isClaimPeriodMet = useMemo(() => {
        if (!lastClaimDate) return true;
        const now = new Date();
        const nextClaimDate = new Date(lastClaimDate.getTime() + pkg.periodDays * 24 * 60 * 60 * 1000);
        return now >= nextClaimDate;
    }, [lastClaimDate, pkg.periodDays]);

    const canClaim = businessMet && referralsMet && isClaimPeriodMet;

    const handleClaim = () => {
        addRequest({
            type: 'Salary Claim',
            amount: pkg.amount,
            address: pkg.name,
        });
        const now = new Date();
        localStorage.setItem(`salary_claimed_${currentUser?.email}_${pkg.id}`, now.toISOString());
        setLastClaimDate(now);
        toast({
            title: "Salary Claim Submitted!",
            description: `Your claim for "${pkg.name}" is pending admin approval.`
        });
    };
    
    const nextClaimDateFormatted = useMemo(() => {
        if (lastClaimDate) {
            const nextDate = new Date(lastClaimDate.getTime() + pkg.periodDays * 24 * 60 * 60 * 1000);
            return nextDate.toLocaleDateString();
        }
        return '';
    }, [lastClaimDate, pkg.periodDays]);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <HandCoins className="h-5 w-5 text-green-500"/>
                    <CardTitle className="text-base">{pkg.name}</CardTitle>
                </div>
                <CardDescription>Claim your recurring salary bonus of <strong className="text-foreground">${pkg.amount.toLocaleString()}</strong> every <strong className="text-foreground">{pkg.periodDays} days</strong>.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>Team Business</span>
                        <span>${totalTeamBusiness.toLocaleString()} / ${pkg.requiredTeamBusiness.toLocaleString()}</span>
                    </div>
                    <Progress value={businessProgress} />
                </div>
                 <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>Active L1 Referrals</span>
                        <span>{activeL1Referrals} / {pkg.requiredActiveReferrals}</span>
                    </div>
                    <Progress value={referralProgress} />
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full" disabled={!canClaim} onClick={handleClaim}>
                    {isClaimPeriodMet ? "Claim Salary" : `Claimable on ${nextClaimDateFormatted}`}
                </Button>
            </CardFooter>
        </Card>
    );
};


export default function TeamPage() {
  const { 
      teamData, 
      commissionRates, 
      commissionEnabled, 
      isLoading, 
      totalTeamBusiness, 
      totalActivationsToday, 
      teamRewards, 
      teamSizeRewards,
      salaryPackages,
      totalUplineCommission, 
      uplineCommissionSettings,
      uplineInfo,
      activeL1Referrals
  } = useTeam();
  const { currentLevel } = useWallet();
  const isMobile = useIsMobile();

  const totalCommission = useMemo(() => {
      if (!teamData) return 0;
      let total = 0;
      if (commissionEnabled.level1) total += teamData.level1.commission * (commissionRates.level1 / 100);
      if (commissionEnabled.level2) total += teamData.level2.commission * (commissionRates.level2 / 100);
      if (commissionEnabled.level3) total += teamData.level3.commission * (commissionRates.level3 / 100);
      return total;
  }, [teamData, commissionRates, commissionEnabled]);
  
  const totalActiveMembers = useMemo(() => {
    if (!teamData) return 0;
    return teamData.level1.activeCount + teamData.level2.activeCount + teamData.level3.activeCount;
  }, [teamData]);

  if (isLoading || !teamData) {
      return (
           <div className="max-w-md mx-auto grid gap-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Team</h1>
                    <p className="text-muted-foreground">
                    View your team's structure, commissions, and performance.
                    </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
                    ))}
                </div>
                 <div className="grid md:grid-cols-3 gap-4">
                    <Card><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
                    <Card><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
                    <Card><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
                </div>
            </div>
      )
  }

  const teamLevels = [
      { title: "Level 1", data: teamData.level1, rate: commissionRates.level1, enabled: commissionEnabled.level1 },
      { title: "Level 2", data: teamData.level2, rate: commissionRates.level2, enabled: commissionEnabled.level2 },
      { title: "Level 3", data: teamData.level3, rate: commissionRates.level3, enabled: commissionEnabled.level3 },
  ];
  
  const availableTeamRewards = teamRewards.filter(r => r.level === 0 || r.level <= currentLevel);
  const availableTeamSizeRewards = teamSizeRewards.filter(r => r.level === 0 || r.level <= currentLevel);
  const uplineReferralProgress = uplineCommissionSettings.requiredReferrals > 0 ? (activeL1Referrals / uplineCommissionSettings.requiredReferrals) * 100 : 100;

  return (
    <div className="max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Team</h1>
          <p className="text-muted-foreground">
            View your team's structure and performance.
          </p>
        </div>
        {isMobile && (
          <Button asChild variant="ghost" size="icon">
            <Link href="/dashboard/user">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Link>
          </Button>
        )}
      </div>

       <div className="grid gap-8">
            <div className="grid grid-cols-2 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Team Commission</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${totalCommission.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">From active members</p>
                        </CardContent>
                    </Card>
                    {uplineCommissionSettings.enabled && (
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Upline Commission</CardTitle>
                                <ArrowUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">${totalUplineCommission.toFixed(2)}</div>
                                <p className="text-xs text-muted-foreground">From your sponsor</p>
                            </CardContent>
                        </Card>
                    )}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Team Members</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalActiveMembers}</div>
                            <p className="text-xs text-muted-foreground">Across all 3 layers</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Team Business</CardTitle>
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${totalTeamBusiness.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">Total deposits from all members</p>
                        </CardContent>
                    </Card>
                    <Card className="col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Today's Activations</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+{totalActivationsToday}</div>
                            <p className="text-xs text-muted-foreground">New active members today</p>
                        </CardContent>
                    </Card>
            </div>

            {uplineCommissionSettings.enabled && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                           <ArrowUp className="h-5 w-5 text-primary" />
                           <CardTitle>Upline Sponsor Details</CardTitle>
                        </div>
                        {uplineInfo ? (
                             <CardDescription>
                                Earn {uplineCommissionSettings.rate}% from your sponsor: <strong className="text-foreground">{uplineInfo.name}</strong> ({uplineInfo.email})
                            </CardDescription>
                        ) : (
                             <CardDescription>Your sponsor information is not available.</CardDescription>
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs text-muted-foreground">
                                <span>Unlock Progress (Active L1 Referrals)</span>
                                <span>{activeL1Referrals} / {uplineCommissionSettings.requiredReferrals}</span>
                            </div>
                            <Progress value={uplineReferralProgress} />
                        </div>
                    </CardContent>
                </Card>
            )}
            
            <div className="grid md:grid-cols-3 gap-4">
                {teamLevels.map(level => (
                    <Card key={level.title}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">{level.title}</CardTitle>
                                {level.enabled ? (
                                    <span className="text-sm font-bold text-primary">{level.rate}%</span>
                                ) : (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <span className="text-sm font-bold text-muted-foreground line-through">{level.rate}%</span>
                                            </TooltipTrigger>
                                            <TooltipContent><p>Commission for this level is disabled.</p></TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                            </div>
                            <CardDescription>Direct Referrals</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center">
                                <UserPlus className="h-5 w-5 text-muted-foreground mr-3" />
                                <p className="font-semibold">{level.data.count} Members ({level.data.activeCount} Active)</p>
                            </div>
                            <div className="flex items-center">
                                <DollarSign className="h-5 w-5 text-muted-foreground mr-3" />
                                <p className="font-semibold">${(level.data.commission * (level.rate / 100)).toFixed(2)} Commission</p>
                            </div>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>View Members</AccordionTrigger>
                                    <AccordionContent>
                                    {level.data.members.length > 0 ? (
                                        <ul className="space-y-2 text-sm text-muted-foreground max-h-48 overflow-y-auto">
                                            {level.data.members.map(member => (
                                                <li key={member.email} className="flex justify-between items-center">
                                                    <span className="truncate pr-2">{member.email}</span>
                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        <Badge variant={member.status === 'active' ? 'default' : 'secondary'} className={cn('text-xs py-0.5 px-1.5 h-fit', member.status === 'active' ? 'bg-green-100 text-green-800' : '')}>
                                                            {member.status}
                                                        </Badge>
                                                        <Badge variant="secondary" className="text-xs py-0.5 px-1.5 h-fit">Lvl {member.level}</Badge>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-center text-muted-foreground py-4">No members in this layer yet.</p>
                                    )}
                                    </AccordionContent>
                                </AccordionItem>
                                </Accordion>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {salaryPackages.length > 0 && (
                 <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-4">Salary Packages</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {salaryPackages.map(pkg => (
                            <SalaryPackageCard key={pkg.id} pkg={pkg} totalTeamBusiness={totalTeamBusiness} activeL1Referrals={activeL1Referrals} />
                        ))}
                    </div>
                </div>
            )}
            
            {availableTeamSizeRewards.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-4">Team Size Rewards</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {availableTeamSizeRewards.map(reward => (
                            <TeamSizeRewardCard key={reward.id} reward={reward} totalActiveMembers={totalActiveMembers} />
                        ))}
                    </div>
                </div>
            )}

            {availableTeamRewards.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-4">Team Business Rewards</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {availableTeamRewards.map(reward => (
                            <TeamRewardCard key={reward.id} reward={reward} totalTeamBusiness={totalTeamBusiness} />
                        ))}
                    </div>
                </div>
            )}
       </div>
    </div>
  );
}
