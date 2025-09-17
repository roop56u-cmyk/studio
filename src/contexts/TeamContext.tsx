
"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import type { User } from './AuthContext';
import { levels as defaultLevels, Level } from '@/components/dashboard/level-tiers';
import { useWallet } from './WalletContext';
import { TeamReward } from '@/app/dashboard/admin/team-rewards/page';
import { TeamSizeReward } from '@/app/dashboard/admin/team-size-rewards/page';
import type { UplineCommissionSettings } from '@/app/dashboard/admin/upline-commission/page';
import type { SalaryPackage } from '@/app/dashboard/admin/salary/page';
import { useLocalStorageWatcher } from '@/hooks/use-local-storage-watcher';
import type { CommunityCommissionRule } from '@/app/dashboard/admin/community-commission/page';
import type { Activity } from './WalletContext';

type TeamMember = User & {
    level: number;
    status: 'active' | 'inactive' | 'disabled';
};

type TeamLevelData = {
    count: number;
    activeCount: number;
    commission: number;
    members: TeamMember[];
    totalDeposits: number;
    totalNetWorth: number;
    activationsToday: number;
};

type TeamData = {
    level1: TeamLevelData;
    level2: TeamLevelData;
    level3: TeamLevelData;
};

type CommunityData = {
    members: TeamMember[];
    totalEarnings: number;
    activeCount: number;
    activationsToday: number;
}

interface TeamContextType {
  teamData: TeamData | null;
  communityData: CommunityData | null;
  communityCommissionRules: CommunityCommissionRule[];
  teamRewards: TeamReward[];
  teamSizeRewards: TeamSizeReward[];
  salaryPackages: SalaryPackage[];
  commissionRates: { level1: number; level2: number; level3: number; };
  commissionEnabled: { level1: boolean; level2: boolean; level3: boolean; };
  isLoading: boolean;
  totalTeamBusiness: number;
  totalTeamNetWorth: number;
  totalActivationsToday: number;
  totalUplineCommission: number;
  uplineCommissionSettings: UplineCommissionSettings;
  uplineInfo: { name: string; email: string; } | null;
  activeL1Referrals: number;
  getLevelForUser: (user: User, allUsers: User[]) => number;
}

export const getLevelForUser = (user: User, allUsers: User[]): number => {
    if (typeof window === 'undefined' || !user) return 0;
    
    const latestUser = allUsers.find(u => u.email === user.email) || user;

    if (latestUser.overrideLevel !== null && latestUser.overrideLevel !== undefined) {
        return latestUser.overrideLevel;
    }

    const taskBalance = parseFloat(localStorage.getItem(`${latestUser.email}_taskRewardsBalance`) || '0');
    const interestBalance = parseFloat(localStorage.getItem(`${latestUser.email}_interestEarningsBalance`) || '0');
    const committedBalance = taskBalance + interestBalance;

    const purchasedReferrals = parseInt(localStorage.getItem(`${latestUser.email}_purchased_referrals`) || '0');
    const directReferralsCount = allUsers.filter(u => u.referredBy === latestUser.referralCode).length + purchasedReferrals;
    
    const platformLevels = JSON.parse(localStorage.getItem('platform_levels') || JSON.stringify(defaultLevels));

    const finalLevel = platformLevels.slice().reverse().find((l:Level) => {
        if (l.level === 0) return false;
        const balanceMet = committedBalance >= l.minAmount;
        const referralsMet = directReferralsCount >= l.referrals;
        return balanceMet && referralsMet;
    })?.level ?? 0;

    return finalLevel;
};

const getTotalDepositsForUser = (userEmail: string): number => {
    if (typeof window === 'undefined') return 0;
    return parseFloat(localStorage.getItem(`${userEmail}_totalDeposits`) || '0');
};

const getNetWorthForUser = (userEmail: string): number => {
  if (typeof window === 'undefined') return 0;
  const main = parseFloat(localStorage.getItem(`${userEmail}_mainBalance`) || '0');
  const task = parseFloat(localStorage.getItem(`${userEmail}_taskRewardsBalance`) || '0');
  const interest = parseFloat(localStorage.getItem(`${userEmail}_interestEarningsBalance`) || '0');
  return main + task + interest;
};


const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider = ({ children }: { children: ReactNode }) => {
    const { currentUser, users } = useAuth();
    const [teamData, setTeamData] = useState<TeamData | null>(null);
    const [communityData, setCommunityData] = useState<CommunityData | null>(null);
    const [communityCommissionRules, setCommunityCommissionRules] = useState<CommunityCommissionRule[]>([]);
    const [teamRewards, setTeamRewards] = useState<TeamReward[]>([]);
    const [teamSizeRewards, setTeamSizeRewards] = useState<TeamSizeReward[]>([]);
    const [salaryPackages, setSalaryPackages] = useState<SalaryPackage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [uplineInfo, setUplineInfo] = useState<{ name: string; email: string; } | null>(null);
    const [activeL1Referrals, setActiveL1Referrals] = useState(0);
    const { 
        addCommunityCommissionToMainBalance, 
        addCommissionToMainBalance, 
        getReferralCommissionBoost, 
        currentLevel, 
        addUplineCommissionToMainBalance,
        activityHistory,
        lastTaskResetDate
    } = useWallet();
    
    const [commissionRates, setCommissionRates] = useState({ level1: 10, level2: 5, level3: 2 });
    const [commissionEnabled, setCommissionEnabled] = useState({ level1: true, level2: true, level3: true });
    const [uplineCommissionSettings, setUplineCommissionSettings] = useState<UplineCommissionSettings>({ enabled: false, rate: 5, requiredReferrals: 3 });
    
    const [lastCommissionCredit, setLastCommissionCredit] = useState<string | null>(null);
    
    const commissionCreditKey = currentUser?.email ? `${currentUser.email}_lastCommissionCredit` : '';
    useLocalStorageWatcher(commissionCreditKey, setLastCommissionCredit);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedRates = localStorage.getItem('team_commission_rates');
            if (savedRates) setCommissionRates(JSON.parse(savedRates));

            const savedEnabled = localStorage.getItem('team_commission_enabled');
            if (savedEnabled) setCommissionEnabled(JSON.parse(savedEnabled));

            const savedRewards = localStorage.getItem('platform_team_rewards');
            if (savedRewards) setTeamRewards(JSON.parse(savedRewards));

            const savedSizeRewards = localStorage.getItem('platform_team_size_rewards');
            if (savedSizeRewards) setTeamSizeRewards(JSON.parse(savedSizeRewards));
            
            const savedUplineSettings = localStorage.getItem('upline_commission_settings');
            if(savedUplineSettings) setUplineCommissionSettings(JSON.parse(savedUplineSettings));

            const savedSalaryPackages = localStorage.getItem('platform_salary_packages');
            if (savedSalaryPackages) {
                const allPackages = JSON.parse(savedSalaryPackages).filter((p: SalaryPackage) => p.enabled);
                setSalaryPackages(allPackages);
            }
            
            const savedCommunityRules = localStorage.getItem('community_commission_rules');
            if (savedCommunityRules) {
                const allRules = JSON.parse(savedCommunityRules);
                setCommunityCommissionRules(allRules.filter((r: CommunityCommissionRule) => r.enabled));
            }
            if (currentUser?.email) {
                setLastCommissionCredit(localStorage.getItem(commissionCreditKey));
            }
        }
    }, [currentUser?.email, commissionCreditKey]);

    const totalUplineCommission = useMemo(() => {
        if (!currentUser?.email) return 0;
        
        const lastReset = new Date(lastTaskResetDate || 0).getTime();

        return activityHistory
            .filter((activity) => {
                return activity.type === 'Upline Commission' && activity.amount && new Date(activity.date).getTime() >= lastReset;
            })
            .reduce((sum, activity) => sum + (activity.amount || 0), 0);
    }, [activityHistory, lastTaskResetDate, currentUser?.email]);

    const calculateCommunityData = useCallback((user: User, allUsers: User[], cycleStartTime: number): CommunityData => {
        const processedEmails = new Set<string>([user.email]);
        
        const l1 = allUsers.filter(u => u.referredBy === user.referralCode);
        l1.forEach(u => processedEmails.add(u.email));

        const l2 = l1.flatMap(l1User => allUsers.filter(u => u.referredBy === l1User.referralCode));
        l2.forEach(u => processedEmails.add(u.email));
        
        const l3 = l2.flatMap(l2User => users.filter(u => u.referredBy === l2User.referralCode));
        l3.forEach(u => processedEmails.add(u.email));

        const L4PlusMembers: User[] = [];
        let parentLayer = l3;

        while (parentLayer.length > 0) {
            const currentLayer = parentLayer.flatMap(parent => allUsers.filter(u => u.referredBy === parent.referralCode && !processedEmails.has(u.email)));
            if (currentLayer.length === 0) break;
            
            L4PlusMembers.push(...currentLayer);
            currentLayer.forEach(u => processedEmails.add(u.email));
            parentLayer = currentLayer;
        }

        const activeMembers = L4PlusMembers.filter(m => allUsers.find(u => u.email === m.email)?.status === 'active');
        const totalEarnings = activeMembers.reduce((sum, m) => {
            const completedTasksForCycle = JSON.parse(localStorage.getItem(`${m.email}_completedTasks`) || '[]')
                .filter((task: { completedAt: string }) => {
                    const completedAt = new Date(task.completedAt).getTime();
                    return completedAt >= cycleStartTime;
                });

            return sum + completedTasksForCycle.reduce((taskSum: number, task: { earnings: number }) => taskSum + task.earnings, 0);
        }, 0);
        
        const enrichedMembers: TeamMember[] = L4PlusMembers.map(m => ({ ...m, level: getLevelForUser(m, allUsers), status: allUsers.find(u => u.email === m.email)?.status || m.status }));

        const activationsToday = allUsers.filter(u => L4PlusMembers.some(m => m.email === u.email) && u.status === 'active' && u.activatedAt && new Date(u.activatedAt).getTime() >= cycleStartTime).length;

        return {
            members: enrichedMembers,
            totalEarnings,
            activeCount: activeMembers.length,
            activationsToday,
        };
    }, []);


    const calculateTeamData = useCallback((user: User, allUsers: User[], cycleStartTime: number): TeamData => {
        const calculateLayer = (members: User[]): TeamLevelData => {
            const activeMembers = members.filter(m => {
                const latestUser = allUsers.find(u => u.email === m.email);
                return latestUser?.status === 'active';
            });
            const enrichedMembers: TeamMember[] = members.map(m => ({ ...m, level: getLevelForUser(m, allUsers), status: allUsers.find(u => u.email === m.email)?.status || m.status }));
            const totalDeposits = enrichedMembers.reduce((sum, m) => sum + getTotalDepositsForUser(m.email), 0);
            const totalNetWorth = enrichedMembers.reduce((sum, m) => sum + getNetWorthForUser(m.email), 0);
            
            const dailyTaskEarnings = activeMembers.reduce((sum, m) => {
                const completedTasksForCycle = JSON.parse(localStorage.getItem(`${m.email}_completedTasks`) || '[]')
                    .filter((task: { completedAt: string }) => {
                        const completedAt = new Date(task.completedAt).getTime();
                        return completedAt >= cycleStartTime;
                    });
                
                return sum + completedTasksForCycle.reduce((taskSum: number, task: { earnings: number }) => taskSum + task.earnings, 0);
            }, 0);

            const activationsToday = allUsers.filter(u => members.some(m => m.email === u.email) && u.status === 'active' && u.activatedAt && new Date(u.activatedAt).getTime() >= cycleStartTime).length;
            
            return {
                count: members.length,
                activeCount: activeMembers.length,
                commission: dailyTaskEarnings,
                members: enrichedMembers,
                totalDeposits,
                totalNetWorth,
                activationsToday
            };
        };

        const level1Members = allUsers.filter(u => u.referredBy === user.referralCode);
        const level2Members = level1Members.flatMap(l1User => allUsers.filter(u => u.referredBy === l1User.referralCode));
        const level3Members = level2Members.flatMap(l2User => users.filter(u => u.referredBy === l2User.referralCode));
        
        const level1 = calculateLayer(level1Members);
        const purchasedReferrals = parseInt(localStorage.getItem(`${user.email}_purchased_referrals`) || '0');
        level1.count += purchasedReferrals; 
        setActiveL1Referrals(level1.activeCount);

        const level2 = calculateLayer(level2Members);
        const level3 = calculateLayer(level3Members);
        
        if (user.referredBy) {
            const uplineUser = allUsers.find(u => u.referralCode === user.referredBy);
            if (uplineUser) {
                setUplineInfo({ name: uplineUser.fullName, email: uplineUser.email });
            } else {
                setUplineInfo(null);
            }
        } else {
            setUplineInfo(null);
        }

        return { level1, level2, level3 };

    }, [users]);
    
    const handleCommissionPayouts = useCallback(() => {
        if (!currentUser || currentUser.status !== 'active') return;

        const lastCreditTime = new Date(localStorage.getItem(commissionCreditKey) || 0).getTime();
        
        // --- TEAM COMMISSION PAYOUT ---
        const currentTeamData = calculateTeamData(currentUser, users, lastCreditTime);
        let totalTeamCommission = 0;
        if (currentTeamData.level1.activeCount >= 1 && commissionEnabled.level1) totalTeamCommission += currentTeamData.level1.commission * (commissionRates.level1 / 100);
        if (currentTeamData.level1.activeCount >= 2 && commissionEnabled.level2) totalTeamCommission += currentTeamData.level2.commission * (commissionRates.level2 / 100);
        if (currentTeamData.level1.activeCount >= 3 && commissionEnabled.level3) totalTeamCommission += currentTeamData.level3.commission * (commissionRates.level3 / 100);
        const commissionBoostPercent = getReferralCommissionBoost();
        const boostAmount = totalTeamCommission * (commissionBoostPercent / 100);
        const finalTeamCommission = totalTeamCommission + boostAmount;
        if (finalTeamCommission > 0) {
            addCommissionToMainBalance(finalTeamCommission);
        }
        
        // --- COMMUNITY COMMISSION PAYOUT ---
        const payoutCommunityData = calculateCommunityData(currentUser, users, lastCreditTime);
        const applicableRule = [...communityCommissionRules]
            .sort((a, b) => b.requiredLevel - a.requiredLevel)
            .find(rule => rule.requiredLevel === 0 || currentLevel >= rule.requiredLevel);
        
        if (applicableRule) {
            const l1to3size = (currentTeamData.level1.count || 0) + (currentTeamData.level2.count || 0) + (currentTeamData.level3.count || 0);
            const referralsMet = activeL1Referrals >= applicableRule.requiredDirectReferrals;
            const teamSizeMet = l1to3size >= applicableRule.requiredTeamSize;

            if (referralsMet && teamSizeMet) {
                const communityCommissionAmount = payoutCommunityData.totalEarnings * (applicableRule.commissionRate / 100);
                if (communityCommissionAmount > 0) {
                    addCommunityCommissionToMainBalance(communityCommissionAmount);
                }
            }
        }
        
        // --- UPLINE COMMISSION PAYOUT ---
        // This is now handled by the `totalUplineCommission` useMemo directly. 
        // We only need to credit the amount calculated there.
        const uplinePayoutAmount = totalUplineCommission;
        if (uplinePayoutAmount > 0) {
            addUplineCommissionToMainBalance(uplinePayoutAmount);
        }
        
        localStorage.setItem(commissionCreditKey, new Date().toISOString());
        setLastCommissionCredit(localStorage.getItem(commissionCreditKey));

    }, [currentUser, users, commissionCreditKey, commissionEnabled, commissionRates, getReferralCommissionBoost, addCommissionToMainBalance, calculateTeamData, calculateCommunityData, communityCommissionRules, currentLevel, activeL1Referrals, addCommunityCommissionToMainBalance, totalUplineCommission, addUplineCommissionToMainBalance]);


    useEffect(() => {
        const checkPayouts = () => {
            if (!currentUser?.email) return;
            const timeSource = localStorage.getItem('platform_time_source') || 'live';
            const resetTimeStr = localStorage.getItem('platform_task_reset_time') || '00:00';
            const [resetHours, resetMinutes] = resetTimeStr.split(':').map(Number);
            let now = timeSource === 'manual' 
                ? new Date(localStorage.getItem('platform_manual_time') || new Date()) 
                : new Date();
            const istNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
            const lastPayoutCheckTime = new Date(localStorage.getItem(`${currentUser.email}_lastPayoutCheck`) || 0);
            let lastResetTime = new Date(istNow);
            lastResetTime.setHours(resetHours, resetMinutes, 0, 0);
            if (istNow < lastResetTime) {
                lastResetTime.setDate(lastResetTime.getDate() - 1);
            }
            if (lastPayoutCheckTime < lastResetTime) {
                 handleCommissionPayouts();
                 localStorage.setItem(`${currentUser.email}_lastPayoutCheck`, new Date().toISOString());
            }
        };

        const interval = setInterval(checkPayouts, 5000); // Check every 5 seconds
        return () => clearInterval(interval);

    }, [currentUser, handleCommissionPayouts]);


    useEffect(() => {
        if (currentUser) {
            setIsLoading(true);
            const commissionCreditTime = new Date(lastCommissionCredit || 0).getTime();
            const currentTeamData = calculateTeamData(currentUser, users, commissionCreditTime);
            const currentCommunityData = calculateCommunityData(currentUser, users, commissionCreditTime);
            
            setTeamData(currentTeamData);
            setCommunityData(currentCommunityData);
            setIsLoading(false);
        }
    }, [currentUser, users, calculateTeamData, calculateCommunityData, lastCommissionCredit]);


    const totalTeamBusiness = useMemo(() => {
        if (!teamData) return 0;
        return (teamData.level1.totalDeposits || 0) + (teamData.level2.totalDeposits || 0) + (teamData.level3.totalDeposits || 0);
    }, [teamData]);

    const totalTeamNetWorth = useMemo(() => {
        if (!teamData) return 0;
        return (teamData.level1.totalNetWorth || 0) + (teamData.level2.totalNetWorth || 0) + (teamData.level3.totalNetWorth || 0);
    }, [teamData]);

    const totalActivationsToday = useMemo(() => {
        if (!teamData || !communityData) return 0;
        return teamData.level1.activationsToday + teamData.level2.activationsToday + teamData.level3.activationsToday + communityData.activationsToday;
    }, [teamData, communityData]);

    const value = {
        teamData,
        communityData,
        communityCommissionRules,
        teamRewards,
        teamSizeRewards,
        salaryPackages,
        commissionRates,
        commissionEnabled,
        isLoading,
        totalTeamBusiness,
        totalTeamNetWorth,
        totalActivationsToday,
        totalUplineCommission,
        uplineCommissionSettings,
        uplineInfo,
        activeL1Referrals,
        getLevelForUser,
    };

    return (
        <TeamContext.Provider value={value}>
            {children}
        </TeamContext.Provider>
    );
};

export const useTeam = () => {
    const context = useContext(TeamContext);
    if (context === undefined) {
        throw new Error('useTeam must be used within a TeamProvider');
    }
    return context;
};
