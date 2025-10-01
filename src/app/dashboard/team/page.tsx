
"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Users, DollarSign, UserPlus, Briefcase, Activity, Award, X, Trophy, ArrowUp, Info, HandCoins, UserCheck, TrendingUp, AlertTriangle, Layers, Lock, Landmark } from "lucide-react";
import { useTeam as useTeamContextData, getLevelForUser } from "@/contexts/TeamContext";
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
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/contexts/WalletContext";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SalaryPackage } from "../admin/salary/page";
import { CommunityCommissionRule } from "../admin/community-commission/page";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { User } from '@/contexts/AuthContext';


const TeamRewardCard = ({ reward, totalTeamBusiness, onInactiveClaim }: { reward: TeamReward, totalTeamBusiness: number, onInactiveClaim: () => void }) => {
    const { toast } = useToast();
    const { addRequest, userRequests } = useRequests();
    const { currentUser } = useAuth();

    const existingRequest = useMemo(() => {
        return userRequests.find(req => req.type === 'Team Reward' && req.address === reward.title);
    }, [userRequests, reward.title]);

    const isClaimed = existingRequest?.status === 'Approved';
    const isPending = existingRequest?.status === 'Pending';
    const progress = Math.min((totalTeamBusiness / reward.requiredAmount) * 100, 100);
    const canClaim = progress >= 100 && !isClaimed && !isPending;

    const handleClaim = () => {
        if (currentUser?.status !== 'active') {
            onInactiveClaim();
            return;
        }
        addRequest({
            type: 'Team Reward',
            amount: reward.rewardAmount,
            address: reward.title,
        });
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
                    {isClaimed ? "Claimed" : isPending ? "Pending" : canClaim ? "Claim Reward" : "In Progress"}
                </Button>
            </CardFooter>
        </Card>
    )
}

const TeamSizeRewardCard = ({ reward, totalActiveMembers, onInactiveClaim }: { reward: TeamSizeReward, totalActiveMembers: number, onInactiveClaim: () => void }) => {
    const { toast } = useToast();
    const { addRequest, userRequests } = useRequests();
    const { currentUser } = useAuth();
    
    const existingRequest = useMemo(() => {
        return userRequests.find(req => req.type === 'Team Size Reward' && req.address === reward.title);
    }, [userRequests, reward.title]);
    
    const isClaimed = existingRequest?.status === 'Approved';
    const isPending = existingRequest?.status === 'Pending';
    const progress = Math.min((totalActiveMembers / reward.requiredActiveMembers) * 100, 100);
    const canClaim = progress >= 100 && !isClaimed && !isPending;

    const handleClaim = () => {
        if (currentUser?.status !== 'active') {
            onInactiveClaim();
            return;
        }
        addRequest({
            type: 'Team Size Reward',
            amount: reward.rewardAmount,
            address: reward.title,
        });
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
                    {isClaimed ? "Claimed" : isPending ? "Pending" : canClaim ? "Claim Reward" : "In Progress"}
                </Button>
            </CardFooter>
        </Card>
    )
}

const SalaryPackageCard = ({ pkg, totalTeamBusiness, activeL1Referrals, onInactiveClaim }: { pkg: SalaryPackage, totalTeamBusiness: number, activeL1Referrals: number, onInactiveClaim: () => void }) => {
    const { toast } = useToast();
    const { addRequest, userRequests } = useRequests();
    const { currentUser } = useAuth();
    const [lastClaimData, setLastClaimData] = useState<{ claimDate: string; businessAtClaim: number } | null>(null);

    useEffect(() => {
        if (currentUser) {
            const lastClaimStr = localStorage.getItem(`salary_claim_${currentUser.email}_${pkg.id}`);
            if (lastClaimStr) {
                setLastClaimData(JSON.parse(lastClaimStr));
            }
        }
    }, [pkg.id, currentUser]);

    const existingRequest = useMemo(() => {
        return userRequests.find(req => req.type === 'Salary Claim' && req.address === pkg.name && req.status !== 'Declined');
    }, [userRequests, pkg.name]);

    const isPending = existingRequest?.status === 'Pending';
    
    // Eligibility Checks
    const isClaimPeriodMet = useMemo(() => {
        if (!lastClaimData) return true; // First claim is always eligible time-wise
        if (isPending) return false;

        const lastClaimDate = new Date(lastClaimData.claimDate);
        const nextClaimDate = new Date(lastClaimDate.getTime() + pkg.periodDays * 24 * 60 * 60 * 1000);
        return new Date() >= nextClaimDate;
    }, [lastClaimData, pkg.periodDays, isPending]);

    const baseBusinessMet = totalTeamBusiness >= pkg.requiredTeamBusiness;
    const referralsMet = activeL1Referrals >= pkg.requiredActiveReferrals;
    
    const growthTarget = lastClaimData ? lastClaimData.businessAtClaim * (1 + pkg.requiredGrowthPercentage / 100) : 0;
    const growthMet = lastClaimData ? totalTeamBusiness >= growthTarget : true; // First claim doesn't require growth

    const canClaim = baseBusinessMet && referralsMet && growthMet && isClaimPeriodMet && !isPending;

    const handleClaim = () => {
        if (currentUser?.status !== 'active') {
            onInactiveClaim();
            return;
        }
        addRequest({
            type: 'Salary Claim',
            amount: pkg.amount,
            address: pkg.name,
        });
        
        const claimData = {
            claimDate: new Date().toISOString(),
            businessAtClaim: totalTeamBusiness
        };

        localStorage.setItem(`salary_claim_${currentUser?.email}_${pkg.id}`, JSON.stringify(claimData));
        setLastClaimData(claimData);

        toast({
            title: "Salary Claim Submitted!",
            description: `Your claim for "${pkg.name}" is now pending admin approval.`
        });
    };
    
    const nextClaimDateFormatted = useMemo(() => {
        if (lastClaimData?.claimDate && !isClaimPeriodMet) {
            const nextDate = new Date(new Date(lastClaimData.claimDate).getTime() + pkg.periodDays * 24 * 60 * 60 * 1000);
            return nextDate.toLocaleDateString();
        }
        return '';
    }, [lastClaimData, pkg.periodDays, isClaimPeriodMet]);

    const getButtonText = () => {
        if (isPending) return "Pending Approval";
        if (!isClaimPeriodMet) return `Claimable on ${nextClaimDateFormatted}`;
        return "Claim Salary";
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <HandCoins className="h-5 w-5 text-green-500"/>
                    <CardTitle className="text-base">{pkg.name}</CardTitle>
                </div>
                <CardDescription>Claim your recurring salary bonus of <strong className="text-foreground">${pkg.amount.toLocaleString()}</strong> every <strong className="text-foreground">{pkg.periodDays} days</strong>.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
                <div className="space-y-1">
                     <div className="flex justify-between items-center text-muted-foreground">
                        <span>Team Business</span>
                        <span>${totalTeamBusiness.toLocaleString()} / ${pkg.requiredTeamBusiness.toLocaleString()}</span>
                    </div>
                    <Progress value={Math.min((totalTeamBusiness / pkg.requiredTeamBusiness) * 100, 100)} />
                </div>
                 <div className="space-y-1">
                    <div className="flex justify-between items-center text-muted-foreground">
                        <span>Active L1 Referrals</span>
                        <span>{activeL1Referrals} / {pkg.requiredActiveReferrals}</span>
                    </div>
                    <Progress value={Math.min((activeL1Referrals / pkg.requiredActiveReferrals) * 100, 100)} />
                </div>
                {lastClaimData && pkg.requiredGrowthPercentage > 0 && (
                     <div className="space-y-1 pt-2 border-t">
                        <div className="flex justify-between items-center text-muted-foreground">
                            <span>Growth Target</span>
                            <span className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                ${growthTarget.toLocaleString()}
                            </span>
                        </div>
                        <Progress value={Math.min((totalTeamBusiness / growthTarget) * 100, 100)} className="h-1.5"/>
                        <p className="text-muted-foreground text-right">{pkg.requiredGrowthPercentage}% growth required</p>
                    </div>
                )}
                 {!growthMet && (
                     <div className="flex items-center gap-2 text-destructive-foreground bg-destructive/80 p-2 rounded-md">
                         <AlertTriangle className="h-4 w-4"/>
                         <p>Business growth target not met.</p>
                     </div>
                 )}
            </CardContent>
            <CardFooter>
                <Button className="w-full" disabled={!canClaim} onClick={handleClaim}>
                    {getButtonText()}
                </Button>
            </CardFooter>
        </Card>
    );
};


export default function TeamPage() {
  const contextData = useTeamContextData();
  const { currentUser } = useAuth();
  const { currentLevel, setIsInactiveWarningOpen } = useWallet();

  // Local state for this component
  const [teamData, setTeamData] = useState(contextData.teamData);
  const [communityData, setCommunityData] = useState(contextData.communityData);
  const [isLoading, setIsLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    // A simple way to get all user data from localStorage for the demo
    const loadedUsers = Object.keys(localStorage)
      .filter(key => key.endsWith('_mainBalance')) // Heuristic to find user data keys
      .map(key => {
        const userEmail = key.replace('_mainBalance', '');
        const userString = localStorage.getItem(userEmail);
        return userString ? JSON.parse(userString) : null;
      })
      .filter(Boolean);
    setAllUsers(loadedUsers as User[]);
  }, []);

  const {
      communityCommissionRules,
      commissionRates, 
      commissionEnabled, 
      teamRewards, 
      teamSizeRewards,
      salaryPackages,
      totalUplineCommission, 
      uplineCommissionSettings,
      uplineInfo
  } = contextData;

  const calculateTeamAndCommunityData = useCallback(() => {
    if (!currentUser || allUsers.length === 0) return;

    setIsLoading(true);

    const cycleStartTime = new Date(localStorage.getItem(`${currentUser.email}_lastPayoutCheck`) || 0).getTime();

    // Helper functions within the calculation scope
    const getTotalDepositsForUser = (userEmail: string): number => parseFloat(localStorage.getItem(`${userEmail}_totalDeposits`) || '0');
    const getNetWorthForUser = (userEmail: string): number => {
      const main = parseFloat(localStorage.getItem(`${userEmail}_mainBalance`) || '0');
      const task = parseFloat(localStorage.getItem(`${userEmail}_taskRewardsBalance`) || '0');
      const interest = parseFloat(localStorage.getItem(`${userEmail}_interestEarningsBalance`) || '0');
      return main + task + interest;
    };
    
    // Calculate L1-L3
    const level1Members = allUsers.filter(u => u.referredBy === currentUser.referralCode);
    const level2Members = level1Members.flatMap(l1User => allUsers.filter(u => u.referredBy === l1User.referralCode));
    const level3Members = level2Members.flatMap(l2User => allUsers.filter(u => u.referredBy === l2User.referralCode));

    const calculateLayer = (members: User[]) => {
      const activeMembers = members.filter(m => m.status === 'active');
      const enrichedMembers = members.map(m => ({ ...m, level: getLevelForUser(m, allUsers), status: m.status }));
      const totalDeposits = enrichedMembers.reduce((sum, m) => sum + getTotalDepositsForUser(m.email), 0);
      const totalNetWorth = enrichedMembers.reduce((sum, m) => sum + getNetWorthForUser(m.email), 0);
      const dailyTaskEarnings = activeMembers.reduce((sum, m) => {
        const completedTasksForCycle = JSON.parse(localStorage.getItem(`${m.email}_completedTasks`) || '[]')
            .filter((task: { completedAt: string }) => new Date(task.completedAt).getTime() >= cycleStartTime);
        return sum + completedTasksForCycle.reduce((taskSum: number, task: { earnings: number }) => taskSum + task.earnings, 0);
      }, 0);
      const activationsToday = members.filter(m => m.status === 'active' && m.activatedAt && new Date(m.activatedAt).getTime() >= cycleStartTime).length;
      return { count: members.length, activeCount: activeMembers.length, commission: dailyTaskEarnings, members: enrichedMembers, totalDeposits, totalNetWorth, activationsToday };
    };

    const newTeamData = {
      level1: calculateLayer(level1Members),
      level2: calculateLayer(level2Members),
      level3: calculateLayer(level3Members),
    };
    setTeamData(newTeamData);

    // Calculate L4+
    const processedEmails = new Set<string>([currentUser.email, ...level1Members.map(u => u.email), ...level2Members.map(u => u.email), ...level3Members.map(u => u.email)]);
    const L4PlusMembers: User[] = [];
    let parentLayer = level3Members;
    while (parentLayer.length > 0) {
      const currentLayer = parentLayer.flatMap(parent => allUsers.filter(u => u.referredBy === parent.referralCode && !processedEmails.has(u.email)));
      if (currentLayer.length === 0) break;
      L4PlusMembers.push(...currentLayer);
      currentLayer.forEach(u => processedEmails.add(u.email));
      parentLayer = currentLayer;
    }
    const activeCommunityMembers = L4PlusMembers.filter(m => m.status === 'active');
    const communityTotalEarnings = activeCommunityMembers.reduce((sum, m) => {
      const completedTasksForCycle = JSON.parse(localStorage.getItem(`${m.email}_completedTasks`) || '[]').filter((task: { completedAt: string }) => new Date(task.completedAt).getTime() >= cycleStartTime);
      return sum + completedTasksForCycle.reduce((taskSum: number, task: { earnings: number }) => taskSum + task.earnings, 0);
    }, 0);
    const enrichedCommunityMembers = L4PlusMembers.map(m => ({ ...m, level: getLevelForUser(m, allUsers), status: m.status }));
    const communityActivationsToday = L4PlusMembers.filter(m => m.status === 'active' && m.activatedAt && new Date(m.activatedAt).getTime() >= cycleStartTime).length;

    setCommunityData({
        members: enrichedCommunityMembers,
        totalEarnings: communityTotalEarnings,
        activeCount: activeCommunityMembers.length,
        activationsToday: communityActivationsToday
    });

    setIsLoading(false);
  }, [currentUser, allUsers]);

  useEffect(() => {
    calculateTeamAndCommunityData();
  }, [calculateTeamAndCommunityData]);
  

  const totalCommission = useMemo(() => {
      if (!teamData || !currentUser || currentUser.status !== 'active') return 0;
      let total = 0;
      if (commissionEnabled.level1 && teamData.level1.activeCount >= 1) total += teamData.level1.commission * (commissionRates.level1 / 100);
      if (commissionEnabled.level2 && teamData.level1.activeCount >= 2) total += teamData.level2.commission * (commissionRates.level2 / 100);
      if (commissionEnabled.level3 && teamData.level1.activeCount >= 3) total += teamData.level3.commission * (commissionRates.level3 / 100);

      return total;
  }, [teamData, commissionRates, commissionEnabled, currentUser]);
  
  const applicableCommunityRule = useMemo(() => {
    if (!communityCommissionRules || communityCommissionRules.length === 0) return null;
    
    const sortedRules = [...communityCommissionRules].sort((a, b) => {
        if (a.requiredLevel === 0 && b.requiredLevel !== 0) return 1;
        if (b.requiredLevel === 0 && a.requiredLevel !== 0) return -1;
        return b.requiredLevel - a.requiredLevel;
    });
    
    return sortedRules.find(rule => rule.requiredLevel === 0 || currentLevel >= rule.requiredLevel) || null;
  }, [communityCommissionRules, currentLevel]);

  const communityCommission = useMemo(() => {
    if (!communityData || !applicableCommunityRule || !currentUser || currentUser.status !== 'active' || !teamData) return 0;
    
    const referralsMet = teamData.level1.activeCount >= applicableCommunityRule.requiredDirectReferrals;
    const teamSizeMet = (teamData.level1.activeCount + teamData.level2.activeCount + teamData.level3.activeCount) >= applicableCommunityRule.requiredTeamSize;

    if (referralsMet && teamSizeMet) {
        return communityData.totalEarnings * (applicableCommunityRule.commissionRate / 100);
    }
    
    return 0;
  }, [communityData, applicableCommunityRule, currentUser, teamData]);
  
  const totalTeamBusiness = teamData ? teamData.level1.totalDeposits + teamData.level2.totalDeposits + teamData.level3.totalDeposits : 0;
  const totalTeamNetWorth = teamData ? teamData.level1.totalNetWorth + teamData.level2.totalNetWorth + teamData.level3.totalNetWorth : 0;
  const totalActivationsToday = teamData && communityData ? teamData.level1.activationsToday + teamData.level2.activationsToday + teamData.level3.activationsToday + communityData.activationsToday : 0;
  const totalActiveMembersL1toL3 = teamData ? teamData.level1.activeCount + teamData.level2.activeCount + teamData.level3.activeCount : 0;
  const totalActiveTeamMembers = communityData ? totalActiveMembersL1toL3 + communityData.activeCount : totalActiveMembersL1toL3;
  const activeL1Referrals = teamData ? teamData.level1.activeCount : 0;


  if (isLoading || !teamData || !communityData) {
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

  const teamLayers = [
      { title: "Layer 1", data: teamData.level1, rate: commissionRates.level1, enabled: commissionEnabled.level1, unlockReq: 1 },
      { title: "Layer 2", data: teamData.level2, rate: commissionRates.level2, enabled: commissionEnabled.level2, unlockReq: 2 },
      { title: "Layer 3", data: teamData.level3, rate: commissionRates.level3, enabled: commissionEnabled.level3, unlockReq: 3 },
  ];
  
  const availableTeamRewards = teamRewards.filter(r => (r.level === 0 || r.level <= currentLevel) && (!r.userEmail || r.userEmail === currentUser?.email));
  const availableTeamSizeRewards = teamSizeRewards.filter(r => (r.level === 0 || r.level <= currentLevel) && (!r.userEmail || r.userEmail === currentUser?.email));
  const availableSalaryPackages = salaryPackages.filter(p => (p.level === 0 || p.level === currentLevel) && (!p.userEmail || p.userEmail === currentUser?.email));
  const uplineReferralProgress = uplineCommissionSettings.requiredReferrals > 0 ? (activeL1Referrals / uplineCommissionSettings.requiredReferrals) * 100 : 100;
  const shouldShowCommunityCommission = communityCommissionRules.length > 0;

  return (
    <ScrollArea className="h-full">
        <div className="max-w-md mx-auto p-1">
        <div className="flex justify-between items-center mb-4">
            <div>
            <h1 className="text-3xl font-bold tracking-tight">My Team</h1>
            <p className="text-muted-foreground">
                View your team's structure and performance.
            </p>
            </div>
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
                                    <Badge variant="secondary">{uplineCommissionSettings.rate}%</Badge>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">${totalUplineCommission.toFixed(2)}</div>
                                    <p className="text-xs text-muted-foreground">From your sponsor</p>
                                </CardContent>
                            </Card>
                        )}
                        {shouldShowCommunityCommission && (
                             <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Community Commission</CardTitle>
                                    {applicableCommunityRule && <Badge variant="secondary">{applicableCommunityRule.commissionRate}%</Badge>}
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">${communityCommission.toFixed(2)}</div>
                                    <p className="text-xs text-muted-foreground">From L4+ members</p>
                                </CardContent>
                            </Card>
                        )}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Active Members</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalActiveTeamMembers}</div>
                                <p className="text-xs text-muted-foreground">Across all layers</p>
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
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Team Net Worth</CardTitle>
                                <Landmark className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">${totalTeamNetWorth.toFixed(2)}</div>
                                <p className="text-xs text-muted-foreground">Current total wallet balances</p>
                            </CardContent>
                        </Card>
                        <Card>
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
                                    Earn {uplineCommissionSettings.rate}% from your sponsor: <strong className="text-foreground">{uplineInfo.name}</strong>
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
                
                {shouldShowCommunityCommission && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Community Commission Requirements</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {applicableCommunityRule ? (
                                <>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                                        <span>Active L1 Referrals</span>
                                        <span>{activeL1Referrals} / {applicableCommunityRule.requiredDirectReferrals}</span>
                                    </div>
                                    <Progress value={Math.min(100, (activeL1Referrals/applicableCommunityRule.requiredDirectReferrals)*100)} />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                                        <span>L1-L3 Team Size</span>
                                        <span>{totalActiveMembersL1toL3} / {applicableCommunityRule.requiredTeamSize}</span>
                                    </div>
                                    <Progress value={Math.min(100, (totalActiveMembersL1toL3/applicableCommunityRule.requiredTeamSize)*100)} />
                                </div>
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center">No community commission rule is currently applicable for your level.</p>
                            )}
                        </CardContent>
                    </Card>
                )}
                
                <div className="grid md:grid-cols-2 gap-4">
                    {teamLayers.map(layer => {
                        const isUnlocked = activeL1Referrals >= layer.unlockReq;
                        return (
                        <Card key={layer.title}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-lg">{layer.title}</CardTitle>
                                        {!isUnlocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                                    </div>
                                    {layer.enabled ? (
                                        <span className="text-sm font-bold text-primary">{layer.rate}%</span>
                                    ) : (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <span className="text-sm font-bold text-muted-foreground line-through">{layer.rate}%</span>
                                                </TooltipTrigger>
                                                <TooltipContent><p>Commission for this layer is disabled.</p></TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                </div>
                                {layer.title === 'Layer 1' && (
                                  <CardDescription>Direct Referrals</CardDescription>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center">
                                    <UserPlus className="h-5 w-5 text-muted-foreground mr-3" />
                                    <p className="font-semibold">{layer.data.count} Members ({layer.data.activeCount} Active)</p>
                                </div>
                                <div className="flex items-center">
                                    <DollarSign className="h-5 w-5 text-muted-foreground mr-3" />
                                    <p className="font-semibold">${currentUser?.status === 'active' && isUnlocked ? (layer.data.commission * (layer.rate / 100)).toFixed(2) : '0.00'} Commission</p>
                                </div>
                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="item-1">
                                        <AccordionTrigger>View Members</AccordionTrigger>
                                        <AccordionContent>
                                        {layer.data.members.length > 0 ? (
                                            <ul className="space-y-2 text-sm text-muted-foreground max-h-48 overflow-y-auto">
                                                {layer.data.members.map(member => (
                                                    <li key={member.email} className="flex justify-between items-center">
                                                        <span className="truncate pr-2">{member.fullName}</span>
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
                        )
                    })}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>L4+ Community Members</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger>View L4+ Members ({communityData.members.length})</AccordionTrigger>

                                <AccordionContent>
                                {communityData.members.length > 0 ? (
                                    <ul className="space-y-2 text-sm text-muted-foreground max-h-60 overflow-y-auto">
                                        {communityData.members.map(member => (
                                            <li key={member.email} className="flex justify-between items-center">
                                                <span className="truncate pr-2">{member.fullName}</span>
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
                                    <p className="text-sm text-center text-muted-foreground py-4">No members in L4 or beyond yet.</p>
                                )}
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>

                {availableSalaryPackages.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight mb-4">Salary Packages</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {availableSalaryPackages.map(pkg => (
                                <SalaryPackageCard key={pkg.id} pkg={pkg} totalTeamBusiness={totalTeamBusiness} activeL1Referrals={activeL1Referrals} onInactiveClaim={() => setIsInactiveWarningOpen(true)} />
                            ))}
                        </div>
                    </div>
                )}
                
                {availableTeamSizeRewards.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight mb-4">Team Size Rewards</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {availableTeamSizeRewards.map(reward => (
                                <TeamSizeRewardCard key={reward.id} reward={reward} totalActiveMembers={totalActiveMembersL1toL3} onInactiveClaim={() => setIsInactiveWarningOpen(true)} />
                            ))}
                        </div>
                    </div>
                )}

                {availableTeamRewards.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight mb-4">Team Business Rewards</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {availableTeamRewards.map(reward => (
                                <TeamRewardCard key={reward.id} reward={reward} totalTeamBusiness={totalTeamBusiness} onInactiveClaim={() => setIsInactiveWarningOpen(true)} />
                            ))}
                        </div>
                    </div>
                )}
        </div>
        </div>
    </ScrollArea>
  );
}
