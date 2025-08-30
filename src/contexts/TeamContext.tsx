

"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import type { User } from './AuthContext';
import { levels as defaultLevels, Level } from '@/components/dashboard/level-tiers';
import { useWallet } from './WalletContext';
import { TeamReward } from '@/app/dashboard/admin/team-rewards/page';
import { TeamSizeReward } from '@/app/dashboard/admin/team-size-rewards/page';

type TeamMember = User & {
    level: number;
};

type TeamLevelData = {
    count: number;
    activeCount: number;
    commission: number;
    members: TeamMember[];
    totalDeposits: number;
    activationsToday: number;
};

type TeamData = {
    level1: TeamLevelData;
    level2: TeamLevelData;
    level3: TeamLevelData;
};

interface TeamContextType {
  teamData: TeamData | null;
  teamRewards: TeamReward[];
  teamSizeRewards: TeamSizeReward[];
  commissionRates: { level1: number; level2: number; level3: number; };
  commissionEnabled: { level1: boolean; level2: boolean; level3: boolean; };
  isLoading: boolean;
  totalTeamBusiness: number;
  totalActivationsToday: number;
}


const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider = ({ children }: { children: ReactNode }) => {
    const { currentUser, users } = useAuth();
    const [teamData, setTeamData] = useState<TeamData | null>(null);
    const [teamRewards, setTeamRewards] = useState<TeamReward[]>([]);
    const [teamSizeRewards, setTeamSizeRewards] = useState<TeamSizeReward[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const [commissionRates, setCommissionRates] = useState({ level1: 10, level2: 5, level3: 2 });
    const [commissionEnabled, setCommissionEnabled] = useState({ level1: true, level2: true, level3: true });


    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedRates = localStorage.getItem('team_commission_rates');
            if (savedRates) setCommissionRates(JSON.parse(savedRates));

            const savedEnabled = localStorage.getItem('team_commission_enabled');
            if (savedEnabled) setCommissionEnabled(JSON.parse(savedEnabled));

            const savedRewards = localStorage.getItem('platform_team_rewards');
            if (savedRewards) {
              const parsedRewards = JSON.parse(savedRewards);
              const userIsActive = currentUser?.status === 'active';
              if (userIsActive) {
                setTeamRewards(parsedRewards);
              } else {
                setTeamRewards([]);
              }
            }

            const savedSizeRewards = localStorage.getItem('platform_team_size_rewards');
             if (savedSizeRewards) {
              const parsedRewards = JSON.parse(savedSizeRewards).filter((r: TeamSizeReward) => r.enabled);
              const userIsActive = currentUser?.status === 'active';
              if (userIsActive) {
                setTeamSizeRewards(parsedRewards);
              } else {
                setTeamSizeRewards([]);
              }
            }
        }
    }, [currentUser]);

    const getLevelForUser = useCallback((user: User, allUsers: User[]): number => {
        if (typeof window === 'undefined') return 0;
        
        if (user.overrideLevel !== null && user.overrideLevel !== undefined) {
            return user.overrideLevel;
        }

        const taskBalance = parseFloat(localStorage.getItem(`${user.email}_taskRewardsBalance`) || '0');
        const interestBalance = parseFloat(localStorage.getItem(`${user.email}_interestEarningsBalance`) || '0');
        const committedBalance = taskBalance + interestBalance;

        const purchasedReferrals = parseInt(localStorage.getItem(`${user.email}_purchased_referrals`) || '0');
        const directReferralsCount = allUsers.filter(u => u.referredBy === user.referralCode).length + purchasedReferrals;
        
        const platformLevels = JSON.parse(localStorage.getItem('platform_levels') || JSON.stringify(defaultLevels));

        const finalLevel = platformLevels.slice().reverse().find((l:Level) => {
            if (l.level === 0) return false;
            const balanceMet = committedBalance >= l.minAmount;
            const referralsMet = directReferralsCount >= l.referrals;
            return balanceMet && referralsMet;
        })?.level ?? 0;

        return finalLevel;
    }, []);
    
    const getDepositsForUser = useCallback((userEmail: string): number => {
        if (typeof window === 'undefined') return 0;
        const mainBalance = parseFloat(localStorage.getItem(`${userEmail}_mainBalance`) || '0');
        const taskBalance = parseFloat(localStorage.getItem(`${userEmail}_taskRewardsBalance`) || '0');
        const interestBalance = parseFloat(localStorage.getItem(`${userEmail}_interestEarningsBalance`) || '0');
        return mainBalance + taskBalance + interestBalance;
    }, []);

    const getIsNewToday = useCallback((user: User): boolean => {
         if (typeof window === 'undefined') return false;
         
         const activationDateStr = localStorage.getItem(`${user.email}_activationDate`);
         if (!activationDateStr) return false;

         const activationDate = new Date(activationDateStr);
         const today = new Date();

         const isToday = activationDate.getFullYear() === today.getFullYear() &&
                activationDate.getMonth() === today.getMonth() &&
                activationDate.getDate() === today.getDate();
        
        // Ensure we check the LATEST status from the users array
        const latestUser = users.find(u => u.email === user.email);

        return isToday && latestUser?.status === 'active';
    }, [users]);

    const calculateTeamData = useCallback((user: User, allUsers: User[]): TeamData => {
        const purchasedReferrals = parseInt(localStorage.getItem(`${user.email}_purchased_referrals`) || '0');
        const platformLevels = JSON.parse(localStorage.getItem('platform_levels') || JSON.stringify(defaultLevels));

        const calculateLayer = (members: User[]): TeamLevelData => {
            const activeMembers = members.filter(m => {
                const latestUser = allUsers.find(u => u.email === m.email);
                return latestUser?.status === 'active';
            });
            const enrichedMembers: TeamMember[] = members.map(m => ({ ...m, level: getLevelForUser(m, allUsers) }));
            const totalDeposits = enrichedMembers.reduce((sum, m) => sum + getDepositsForUser(m.email), 0);
            const dailyTaskEarnings = enrichedMembers.reduce((sum, m) => {
                 const levelData = platformLevels.find((l:Level) => l.level === m.level);
                 return sum + (levelData ? levelData.earningPerTask * levelData.dailyTasks : 0);
            }, 0);

            const activationsToday = members.filter(m => getIsNewToday(m)).length;
            
            return {
                count: members.length,
                activeCount: activeMembers.length,
                commission: dailyTaskEarnings,
                members: enrichedMembers,
                totalDeposits,
                activationsToday
            };
        };

        const level1Members = allUsers.filter(u => u.referredBy === user.referralCode);
        const level2Members = level1Members.flatMap(l1User => allUsers.filter(u => u.referredBy === l1User.referralCode));
        const level3Members = level2Members.flatMap(l2User => allUsers.filter(u => u.referredBy === l2User.referralCode));
        
        const level1 = calculateLayer(level1Members);
        level1.count += purchasedReferrals; 

        const level2 = calculateLayer(level2Members);
        const level3 = calculateLayer(level3Members);

        return { level1, level2, level3 };

    }, [getLevelForUser, getDepositsForUser, getIsNewToday]);


    useEffect(() => {
        if (currentUser && users.length > 1) {
            setIsLoading(true);
            const data = calculateTeamData(currentUser, users);
            setTeamData(data);
            setIsLoading(false);
        } else if (currentUser) {
            // Handle case where user has no referrals yet but might have purchased some
            setIsLoading(true);
            const data = calculateTeamData(currentUser, []);
            setTeamData(data);
            setIsLoading(false);
        }
    }, [currentUser, users, calculateTeamData]);


    const totalTeamBusiness = useMemo(() => {
        if (!teamData) return 0;
        return teamData.level1.totalDeposits + teamData.level2.totalDeposits + teamData.level3.totalDeposits;
    }, [teamData]);

    const totalActivationsToday = useMemo(() => {
        if (!teamData) return 0;
        return teamData.level1.activationsToday + teamData.level2.activationsToday + teamData.level3.activationsToday;
    }, [teamData]);
    
    const value = {
        teamData,
        teamRewards,
        teamSizeRewards,
        commissionRates,
        commissionEnabled,
        isLoading,
        totalTeamBusiness,
        totalActivationsToday
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
