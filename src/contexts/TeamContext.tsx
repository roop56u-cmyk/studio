
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
import { createClient } from '@/lib/supabase/client';


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

// This function needs to be standalone so it can be used outside the context.
export const getLevelForUser = (user: User, allUsers: User[]): number => {
    if (typeof window === 'undefined' || !user) return 0;
    
    // Find the latest version of the user from the allUsers list
    const latestUser = allUsers.find(u => u.email === user.email) || user;

    if (latestUser.overrideLevel !== null && latestUser.overrideLevel !== undefined) {
        return latestUser.overrideLevel;
    }

    const taskBalance = parseFloat(localStorage.getItem(`${latestUser.email}_taskRewardsBalance`) || '0');
    const interestBalance = parseFloat(localStorage.getItem(`${latestUser.email}_interestEarningsBalance`) || '0');
    const committedBalance = taskBalance + interestBalance;

    const purchasedReferrals = parseInt(localStorage.getItem(`${latestUser.email}_purchased_referrals`) || '0');
    const directReferralsCount = allUsers.filter(u => u.referredBy === latestUser.referralCode).length + purchasedReferrals;
    
    const platformLevelsString = localStorage.getItem('platform_levels');
    const platformLevels = platformLevelsString ? JSON.parse(platformLevelsString) : defaultLevels;

    const finalLevel = platformLevels.slice().reverse().find((l:Level) => {
        if (l.level === 0) return false;
        const balanceMet = committedBalance >= l.minAmount;
        const referralsMet = directReferralsCount >= l.referrals;
        return balanceMet && referralsMet;
    })?.level ?? 0;

    return finalLevel;
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
    } = useWallet();
    
    const [commissionRates, setCommissionRates] = useState({ level1: 10, level2: 5, level3: 2 });
    const [commissionEnabled, setCommissionEnabled] = useState({ level1: true, level2: true, level3: true });
    const [uplineCommissionSettings, setUplineCommissionSettings] = useState<UplineCommissionSettings>({ enabled: false, rate: 5, requiredReferrals: 3 });
    
    const [lastPayoutCheckTime, setLastPayoutCheckTime] = useState<string | null>(null);
    
    const lastPayoutCheckKey = currentUser?.email ? `${currentUser.email}_lastPayoutCheck` : '';
    useLocalStorageWatcher(lastPayoutCheckKey, setLastPayoutCheckTime);

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
                setLastPayoutCheckTime(localStorage.getItem(lastPayoutCheckKey));
            }
        }
    }, [currentUser?.email, lastPayoutCheckKey]);

    const totalUplineCommission = useMemo(() => {
        if (!currentUser?.email) return 0;
        
        const lastPayoutTime = new Date(lastPayoutCheckTime || 0).getTime();

        return activityHistory
            .filter((activity) => {
                return activity.type === 'Upline Commission' && activity.amount && new Date(activity.date).getTime() >= lastPayoutTime;
            })
            .reduce((sum, activity) => sum + (activity.amount || 0), 0);
    }, [activityHistory, lastPayoutCheckTime, currentUser?.email]);

    // Simplified for now - real logic moved to TeamPage component
    const totalTeamBusiness = 0;
    const totalTeamNetWorth = 0;
    const totalActivationsToday = 0;


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
