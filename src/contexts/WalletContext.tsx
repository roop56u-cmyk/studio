
"use client";

import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from './AuthContext';
import { GenerateTaskSuggestionOutput, generateTaskSuggestion } from '@/app/actions';
import { levels as defaultLevels, Level } from '@/components/dashboard/level-tiers';
import { platformMessages } from '@/lib/platform-messages';
import type { BonusTier } from '@/app/dashboard/admin/settings/page';
import type { DailyReward } from '@/app/dashboard/admin/daily-rewards/page';
import { nftLibrary } from '@/lib/nft-library';
import type { NftStakingPackage } from '@/app/dashboard/admin/nft-staking/page';


export type Request = {
    id: string;
    user: string;
    type: 'Recharge' | 'Withdrawal' | 'Team Reward' | 'Team Size Reward' | 'Sign-up Bonus' | 'Referral Bonus' | 'Salary Claim' | 'Reimbursement';
    amount: number;
    address: string | null;
    level: number;
    deposits: number;
    withdrawals: number;
    referrals: number;
    balance: number;
    status: 'Pending' | 'Approved' | 'Declined' | 'On Hold';
    date: string;
    upline?: string | null;
};

export type Nft = {
    id: string;
    title: string;
    artworkUrl: string;
    mintedAt: string;
    currentValue: number;
    stakedUntil?: number | null; // Timestamp
    stakedInPackageId?: string | null;
};

export type CompletedTask = {
    id: string;
    title: string;
    description: string;
    earnings: number;
    completedAt: string;
};

export type WithdrawalAddress = {
    id: string;
    name: string;
    address: string;
    type: string;
    enabled: boolean;
};

export type BoosterType = 'TASK_EARNING' | 'TASK_QUOTA' | 'INTEREST_RATE' | 'REFERRAL_COMMISSION' | 'PURCHASE_REFERRAL';

export type Booster = {
    id: string;
    name: string;
    description: string;
    type: BoosterType;
    value: number; // e.g., 20 for 20%, or 10 for +10 tasks
    price: number;
    duration: number; // in hours
    level: number; // 0 for all levels
    enabled: boolean;
    userEmail?: string;
};

export type ActiveBooster = {
    boosterId: string;
    type: BoosterType;
    value: number;
    expiresAt: number; // timestamp
};

type LevelUnlockStatus = {
    isUnlocked: boolean;
    isCurrentLevel: boolean;
    balanceMet: boolean;
    referralsMet: boolean;
    referralProgress?: number;
    currentReferrals?: number;
};

type DailyRewardState = {
  isEnabled: boolean;
  canClaim: boolean;
  streak: number;
  reward: number;
};

type NftCooldowns = {
  failedSale: number | null; // timestamp
  successfulSale: number | null; // timestamp
}

export type MiningPackageInfo = {
    id: string;
    name: string;
    price: number;
    miningRate: number; // Tokens per hour
    duration: number; // in hours
};

export type PurchasedMiningPackage = {
    id: string; // unique instance id
    packageId: string; // id of the package from store
    name: string;
    status: 'available' | 'active' | 'expired';
};

export type ActiveMiningPackage = {
    id: string; // unique instance id
    packageId: string;
    name: string;
    miningRate: number;
    duration: number; // hours
    startedAt: number; // timestamp
    expiresAt: number; // timestamp
};

export type TokenomicsSettings = {
  tokenName: string;
  tokenSymbol: string;
  conversionRate: number; // How many tokens for 1 USDT
  miningEnabled: boolean;
};

interface WalletContextType {
  mainBalance: number;
  taskRewardsBalance: number;
  interestEarningsBalance: number;
  committedBalance: number;
  currentLevel: number;
  taskLevel: number;
  currentRate: number;
  dailyTaskQuota: number;
  monthlyWithdrawalLimit: number;
  minWithdrawalAmount: number;
  maxWithdrawalAmount: number;
  monthlyWithdrawalsCount: number;
  withdrawalFee: number;
  earningPerTask: number;
  tasksCompletedToday: number;
  completedTasks: CompletedTask[];
  levelUnlockProgress: Record<number, LevelUnlockStatus>;
  minRequiredBalanceForLevel: (level: number) => number;
  handleMoveFunds: (destination: 'Task Rewards' | 'Interest Earnings' | 'Main Wallet', amountToMove: number, fromAccount?: 'Task Rewards' | 'Interest Earnings') => void;
  approveRecharge: (userEmail: string, rechargeAmount: number) => void;
  addCommissionToMainBalance: (commissionAmount: number) => void;
  addCommunityCommissionToMainBalance: (commissionAmount: number) => void;
  addUplineCommissionToMainBalance: (commissionAmount: number) => void;
  requestWithdrawal: (withdrawalAmount: number, withdrawalAddress: string) => void;
  approveWithdrawal: (userEmail: string, amount: number) => void;
  approveSignUpBonus: (userEmail: string, amount: number) => void;
  approveReferralBonus: (userEmail: string, referredUser: string, amount: number) => void;
  approveSalary: (userEmail: string, amount: number, salaryPackageName: string) => void;
  refundWithdrawal: (userEmail: string, withdrawalAmount: number) => void;
  isLoading: boolean;
  interestCounter: CounterState;
  startCounter: (type: 'task' | 'interest', durationHours?: number) => void;
  claimAndRestartCounter: (type: 'task' | 'interest') => void;
  completeTask: (task: GenerateTaskSuggestionOutput) => void;
  withdrawalAddresses: WithdrawalAddress[];
  addWithdrawalAddress: (address: Omit<WithdrawalAddress, 'id'>) => void;
  updateWithdrawalAddress: (id: string, data: Partial<Omit<WithdrawalAddress, 'id'>>) => void;
  deleteWithdrawalAddress: (id: string) => void;
  isWithdrawalRestrictionEnabled: boolean;
  withdrawalRestrictionDays: number;
  purchaseBooster: (booster: Booster) => boolean;
  activeBoosters: ActiveBooster[];
  purchasedBoosterIds: string[];
  getReferralCommissionBoost: () => number;
  isFundMovementLocked: (type: 'interest' | 'task' | 'mining') => boolean;
  addActivity: (userEmail: string, activity: Omit<Activity, 'id'>) => void;
  activityHistory: Activity[];
  multipleAddressesEnabled: boolean;
  // Manual Bonus Claiming
  claimSignUpBonus: () => void;
  hasClaimedSignUpBonus: boolean;
  isEligibleForSignUpBonus: boolean;
  signupBonusAmount: number;
  referralBonuses: BonusTier[];
  referralBonusFor: (referralEmail: string) => number;
  claimReferralBonus: (referralEmail: string) => void;
  claimedReferralIds: string[];
  purchasedReferralsCount: number;
  dailyRewardState?: DailyRewardState;
  claimDailyReward: () => void;
  isInactiveWarningOpen: boolean;
  setIsInactiveWarningOpen: (isOpen: boolean) => void;
  isInterestFeatureEnabled: boolean;
  interestEarningModel: 'flexible' | 'fixed';
  fixedTermDurations: string;
  nftCollection: Nft[];
  mintNft: (achievementId: string, achievementTitle: string) => Promise<void>;
  sellNft: (nftId: string) => Promise<void>;
  nftCooldowns: NftCooldowns;
  isNftFeatureEnabled: boolean;
  stakeNft: (nftId: string, packageId: string) => void;
  claimStakedNftRewards: (nftId: string) => void;
  // Token Mining
  isMiningEnabled: boolean;
  tokenBalance: number;
  tokenomics: TokenomicsSettings;
  activeMiningPackage: ActiveMiningPackage | null;
  purchasedMiningPackages: PurchasedMiningPackage[];
  purchaseMiningPackage: (packageId: string) => void;
  startMining: (purchasedPackageId: string) => void;
  claimMinedTokens: () => void;
  convertTokensToUsdt: (tokenAmount: number) => void;
}

export type Activity = {
    id: string;
    type: string;
    description: string;
    amount?: number;
    status?: 'Pending' | 'Approved' | 'Declined' | 'On Hold';
    date: string;
};

export type CounterType = 'task' | 'interest';

export interface CounterState {
    isRunning: boolean;
    startTime: number | null;
    durationHours?: number;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const { currentUser, users, activateUserAccount, updateUserStatus } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  // Global system settings
  const [isWithdrawalRestrictionEnabled, setIsWithdrawalRestrictionEnabled] = useState(true);
  const [withdrawalRestrictionDays, setWithdrawalRestrictionDays] = useState(45);
  const [configuredLevels, setConfiguredLevels] = useState<Level[]>(defaultLevels);
  const [earningModel, setEarningModel] = useState("dynamic");
  const [multipleAddressesEnabled, setMultipleAddressesEnabled] = useState(true);
  const [signupBonuses, setSignupBonuses] = useState<BonusTier[]>([]);
  const [isSignupApprovalRequired, setIsSignupApprovalRequired] = useState(false);
  const [referralBonuses, setReferralBonuses] = useState<BonusTier[]>([]);
  const [isReferralApprovalRequired, setIsReferralApprovalRequired] = useState(false);
  const [isInterestFeatureEnabled, setIsInterestFeatureEnabled] = useState(true);
  const [interestEarningModel, setInterestEarningModel] = useState<'flexible' | 'fixed'>('flexible');
  const [fixedTermDurations, setFixedTermDurations] = useState("12h, 1d, 10d, 30d");
  const [isNftFeatureEnabled, setIsNftFeatureEnabled] = useState(false);
  
  const getGlobalSetting = (key: string, defaultValue: any, isJson: boolean = false) => {
     if (typeof window === 'undefined') {
      return defaultValue;
    }
    try {
      const storedValue = localStorage.getItem(key);
      if (storedValue) {
        if (isJson) {
            return JSON.parse(storedValue);
        }
        return storedValue;
      }
    } catch (error) {
      console.error(`Failed to parse global setting ${key} from localStorage`, error);
    }
    return defaultValue;
  };

  const [mainBalance, setMainBalance] = useState(0);
  const [taskRewardsBalance, setTaskRewardsBalance] = useState(0);
  const [interestEarningsBalance, setInterestEarningsBalance] = useState(0);
  const [deposits, setDeposits] = useState(0);
  const [withdrawals, setWithdrawals] = useState(0);
  const [activityHistory, setActivityHistory] = useState<Activity[]>([]);
  const [interestCounter, setInterestCounter] = useState<CounterState>({ isRunning: false, startTime: null, durationHours: 24 });
  const [tasksCompletedToday, setTasksCompletedToday] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>([]);
  const [withdrawalAddresses, setWithdrawalAddresses] = useState<WithdrawalAddress[]>([]);
  const [monthlyWithdrawalsCount, setMonthlyWithdrawalsCount] = useState(0);
  const [lastWithdrawalMonth, setLastWithdrawalMonth] = useState(-1);
  const [activeBoosters, setActiveBoosters] = useState<ActiveBooster[]>([]);
  const [purchasedBoosterIds, setPurchasedBoosterIds] = useState<string[]>([]);
  const [purchasedReferralsCount, setPurchasedReferralsCount] = useState<number>(0);
  const [hasClaimedSignUpBonus, setHasClaimedSignUpBonus] = useState<boolean>(false);
  const [claimedReferralIds, setClaimedReferralIds] = useState<string[]>([]);
  const [dailyRewardState, setDailyRewardState] = useState<DailyRewardState>({ isEnabled: false, canClaim: false, streak: 0, reward: 0 });
  const [isReady, setIsReady] = useState(false);
  const [isInactiveWarningOpen, setIsInactiveWarningOpen] = useState(false);
  const [nftCollection, setNftCollection] = useState<Nft[]>([]);
  const [nftCooldowns, setNftCooldowns] = useState<NftCooldowns>({ failedSale: null, successfulSale: null });

  // Token Mining States
  const [isMiningEnabled, setIsMiningEnabled] = useState(true);
  const [tokenomics, setTokenomics] = useState<TokenomicsSettings>({ tokenName: 'Taskify Coin', tokenSymbol: 'TFT', conversionRate: 10, miningEnabled: true });
  const [tokenBalance, setTokenBalance] = useState(0);
  const [purchasedMiningPackages, setPurchasedMiningPackages] = useState<PurchasedMiningPackage[]>([]);
  const [activeMiningPackage, setActiveMiningPackage] = useState<ActiveMiningPackage | null>(null);
  
  const committedBalance = taskRewardsBalance + interestEarningsBalance;
  
  const getInitialState = useCallback((key: string, defaultValue: any, userEmail?: string) => {
    const targetEmail = userEmail || currentUser?.email;
    if (typeof window === 'undefined' || !targetEmail) {
      return defaultValue;
    }
    try {
      const storedValue = localStorage.getItem(`${targetEmail}_${key}`);
      if (storedValue) {
        return JSON.parse(storedValue);
      }
    } catch (error) {
      // It might be a simple string, not JSON.
      const storedValue = localStorage.getItem(`${targetEmail}_${key}`);
      if(storedValue) return storedValue;
    }
    return defaultValue;
  }, [currentUser?.email]);

  const setPersistentState = useCallback((key: string, value: any) => {
    if (typeof window !== 'undefined' && currentUser?.email) {
      try {
        localStorage.setItem(`${currentUser.email}_${key}`, JSON.stringify(value));
      } catch (error) {
        console.error(`Failed to save ${key} to localStorage for ${currentUser.email}`, error);
      }
    }
  }, [currentUser?.email]);

  const directReferralsCount = useMemo(() => {
    if (!currentUser) return 0;
    const actualReferrals = users.filter(u => u.referredBy === currentUser.referralCode).length;
    return actualReferrals + purchasedReferralsCount;
  }, [currentUser, users, purchasedReferralsCount]);


  const { currentLevel, levelUnlockProgress } = useMemo(() => {
    if (currentUser?.overrideLevel !== null && currentUser?.overrideLevel !== undefined) {
        const progress: Record<number, LevelUnlockStatus> = {};
        configuredLevels.filter(l => l.level > 0).forEach(level => {
             progress[level.level] = {
                isUnlocked: level.level <= currentUser.overrideLevel!,
                isCurrentLevel: level.level === currentUser.overrideLevel!,
                balanceMet: true, 
                referralsMet: true,
            };
        });
        return { currentLevel: currentUser.overrideLevel, levelUnlockProgress: progress };
    }

    let finalLevel = 0;
    const progress: Record<number, LevelUnlockStatus> = {};
    
    configuredLevels.slice().reverse().forEach(level => {
        if (level.level === 0) return;
        const balanceMet = committedBalance >= level.minAmount;
        const referralsMet = directReferralsCount >= level.referrals;
        const isUnlocked = balanceMet && referralsMet;
        if (isUnlocked && finalLevel === 0) {
            finalLevel = level.level;
        }
    });

    configuredLevels.filter(l => l.level > 0).forEach(level => {
        const balanceMet = committedBalance >= level.minAmount;
        const referralsMet = directReferralsCount >= level.referrals;
        const isUnlocked = balanceMet && referralsMet;
        const referralProgress = level.referrals > 0 ? (directReferralsCount / level.referrals) * 100 : 100;
         progress[level.level] = {
            isUnlocked,
            isCurrentLevel: level.level === finalLevel, 
            balanceMet,
            referralsMet,
            referralProgress: Math.min(referralProgress, 100),
            currentReferrals: directReferralsCount
        };
    });

    return { currentLevel: finalLevel, levelUnlockProgress: progress };
  }, [committedBalance, directReferralsCount, configuredLevels, currentUser]);


  const currentLevelData = useMemo(() => configuredLevels.find(level => level.level === currentLevel) ?? configuredLevels[0], [configuredLevels, currentLevel]);
  
  const minRequiredBalanceForLevel = useCallback((level: number) => {
    return configuredLevels.find(l => l.level === level)?.minAmount ?? 0;
  }, [configuredLevels]);

  const taskQuotaBoost = useMemo(() => activeBoosters.find(b => b.type === 'TASK_QUOTA')?.value || 0, [activeBoosters]);
  const interestRateBoost = useMemo(() => activeBoosters.find(b => b.type === 'INTEREST_RATE')?.value || 0, [activeBoosters]);
  
  const taskLevel = useMemo(() => {
    // Determine the highest level achievable based on task balance alone
    const balanceBasedLevel = configuredLevels.slice().reverse().find(l => taskRewardsBalance >= l.minAmount)?.level ?? 0;
    // The true task level cannot exceed the user's overall currentLevel (which considers referrals)
    return Math.min(balanceBasedLevel, currentLevel);
  }, [taskRewardsBalance, configuredLevels, currentLevel]);

  const taskLevelData = useMemo(() => {
    return configuredLevels.find(l => l.level === taskLevel) ?? configuredLevels[0];
  }, [configuredLevels, taskLevel]);

  const { monthlyWithdrawalLimit, minWithdrawalAmount, maxWithdrawalAmount, withdrawalFee } = currentLevelData;
  const dailyTaskQuota = taskLevelData.dailyTasks + taskQuotaBoost;
  
  const currentRate = useMemo(() => {
    // Interest rate is now determined by the amount in the interest wallet,
    // but capped at the user's overall account level.
    const userAccountLevelData = currentLevelData;
    
    const interestLevelData = configuredLevels
        .slice()
        .reverse()
        .find(l => interestEarningsBalance >= l.minAmount) ?? configuredLevels[0];

    const finalRate = Math.min(userAccountLevelData.rate, interestLevelData.rate);

    return finalRate + interestRateBoost;
  }, [currentLevelData, interestEarningsBalance, configuredLevels, interestRateBoost]);
  
  const earningPerTask = useMemo(() => {
    if (earningModel === 'fixed') {
        const taskEarningBoost = activeBoosters.find(b => b.type === 'TASK_EARNING')?.value || 0;
        const baseEarning = taskLevelData.earningPerTask || 0;
        return baseEarning + (baseEarning * (taskEarningBoost / 100));
    }
    if (dailyTaskQuota === 0 || taskRewardsBalance < minRequiredBalanceForLevel(taskLevel)) return 0;
    
    const dailyEarningPotential = taskRewardsBalance * (taskLevelData.rate / 100);
    const baseEarning = dailyTaskQuota > 0 ? dailyEarningPotential / dailyTaskQuota : 0;
    
    const taskEarningBoost = activeBoosters.find(b => b.type === 'TASK_EARNING')?.value || 0;
    return baseEarning + (baseEarning * (taskEarningBoost / 100));
  }, [taskRewardsBalance, taskLevelData, dailyTaskQuota, earningModel, taskLevel, minRequiredBalanceForLevel, activeBoosters]);
  
  // This effect will run once on mount to load initial data
  useEffect(() => {
    const loadInitialData = () => {
        // Global settings
        const tokenomicsSettings = getGlobalSetting('tokenomics_settings', { miningEnabled: true, tokenName: "Taskify Coin", tokenSymbol: "TFT", conversionRate: 10 }, true);
        setIsMiningEnabled(tokenomicsSettings.miningEnabled);
        setTokenomics(tokenomicsSettings);
        setIsWithdrawalRestrictionEnabled(getGlobalSetting('system_withdrawal_restriction_enabled', true, true));
        setWithdrawalRestrictionDays(parseInt(getGlobalSetting('system_withdrawal_restriction_days', '45'), 10));
        setConfiguredLevels(getGlobalSetting('platform_levels', defaultLevels, true));
        setEarningModel(getGlobalSetting('system_earning_model', 'dynamic'));
        setMultipleAddressesEnabled(getGlobalSetting('system_multiple_addresses_enabled', true, true));
        setSignupBonuses(getGlobalSetting('system_signup_bonuses', [], true));
        setReferralBonuses(getGlobalSetting('system_referral_bonuses', [], true));
        setIsSignupApprovalRequired(getGlobalSetting('system_signup_bonus_approval_required', false, true));
        setIsReferralApprovalRequired(getGlobalSetting('system_referral_bonus_approval_required', false, true));
        setIsInterestFeatureEnabled(getGlobalSetting('system_interest_enabled', true, true));
        setInterestEarningModel(getGlobalSetting('system_interest_model', 'flexible'));
        setFixedTermDurations(getGlobalSetting('system_interest_fixed_term_durations', "12h, 1d, 10d, 30d"));
        setIsNftFeatureEnabled(getGlobalSetting('nft_market_settings', { isNftEnabled: false }, true).isNftEnabled);

        // User-specific data
        if (currentUser?.email) {
            setMainBalance(getInitialState('mainBalance', 0));
            setTaskRewardsBalance(getInitialState('taskRewardsBalance', 0));
            setInterestEarningsBalance(getInitialState('interestEarningsBalance', 0));
            setTokenBalance(getInitialState('tokenBalance', 0));
            setPurchasedMiningPackages(getInitialState('purchasedMiningPackages', []));
            setActiveMiningPackage(getInitialState('activeMiningPackage', null));
            setDeposits(getInitialState('deposits', 0));
            setWithdrawals(getInitialState('withdrawals', 0));
            setActivityHistory(getInitialState('activityHistory', []));
            setInterestCounter(getInitialState('interestCounter', { isRunning: false, startTime: null, durationHours: 24 }));
            
            setCompletedTasks(getInitialState('completedTasks', []));
            setWithdrawalAddresses(getInitialState('withdrawalAddresses', []));
            setActiveBoosters(getInitialState('activeBoosters', []));
            setPurchasedBoosterIds(getInitialState('purchasedBoosterIds', []));
            setPurchasedReferralsCount(getInitialState('purchased_referrals', 0));
            setHasClaimedSignUpBonus(getInitialState('hasClaimedSignUpBonus', false));
            setClaimedReferralIds(getInitialState('claimedReferralIds', []));
            setNftCollection(getInitialState('nftCollection', []));
            setNftCooldowns(getInitialState('nftCooldowns', { failedSale: null, successfulSale: null }));

            // Daily task reset logic
            const timeSource = getGlobalSetting('platform_time_source', 'live');
            let now;
            if (timeSource === 'manual') {
                const manualTime = getGlobalSetting('platform_manual_time', new Date().toISOString());
                now = new Date(manualTime);
            } else {
                now = new Date();
            }

            const resetTimeStr = getGlobalSetting('platform_task_reset_time', '09:30');
            const [resetHours, resetMinutes] = resetTimeStr.split(':').map(Number);

            const istOffset = -330; // UTC+5:30 is -330 minutes from UTC
            const localOffset = now.getTimezoneOffset();
            const totalOffset = localOffset - istOffset;

            const lastResetDateStr = getInitialState('lastTaskResetDate', null);
            const lastResetDate = lastResetDateStr ? new Date(lastResetDateStr) : null;
            
            let resetTimeToday = new Date(now);
            resetTimeToday.setHours(resetHours, resetMinutes, 0, 0);
            resetTimeToday.setMinutes(resetTimeToday.getMinutes() + totalOffset);

            let resetTimeYesterday = new Date(resetTimeToday);
            resetTimeYesterday.setDate(resetTimeToday.getDate() - 1);

            const lastEffectiveReset = now >= resetTimeToday ? resetTimeToday : resetTimeYesterday;
            
            if (!lastResetDate || lastResetDate.getTime() < lastEffectiveReset.getTime()) {
                setTasksCompletedToday(0);
                setPersistentState('tasksCompletedToday', 0);
                setPersistentState('lastTaskResetDate', now.toISOString()); // Mark reset
            } else {
                 setTasksCompletedToday(getInitialState('tasksCompletedToday', 0));
            }


            const currentMonth = new Date().getMonth();
            const lastMonth = getInitialState('lastWithdrawalMonth', -1);
            if (currentMonth !== lastMonth) {
                setMonthlyWithdrawalsCount(0);
                setPersistentState('monthlyWithdrawalsCount', 0);
                setLastWithdrawalMonth(currentMonth);
                setPersistentState('lastWithdrawalMonth', currentMonth);
            } else {
                setMonthlyWithdrawalsCount(getInitialState('monthlyWithdrawalsCount', 0));
            }

            // Daily Reward Logic
            const isEnabled = getGlobalSetting('daily_login_rewards_enabled', true, true);
            const lastClaimDateStr = getInitialState('last_daily_claim_date', null);
            const streak = getInitialState('daily_claim_streak', 0);
            const today = new Date().toISOString().split('T')[0];
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            
            let newStreak = streak;
            if (lastClaimDateStr && lastClaimDateStr < yesterday) {
                newStreak = 0; // Reset streak if they missed a day
            }

            const canClaim = lastClaimDateStr !== today;
            const rewardTiers: DailyReward[] = getGlobalSetting('daily_login_rewards', [], true);
            const rewardIndex = newStreak % rewardTiers.length;
            const reward = rewardTiers.length > 0 ? rewardTiers[rewardIndex]?.reward ?? 0 : 0;

            setDailyRewardState({ isEnabled, canClaim, streak: newStreak, reward: reward });
            if (newStreak !== streak) {
              setPersistentState('daily_claim_streak', newStreak);
            }
        } else {
            // Reset state if no user is logged in
            setMainBalance(0); setTaskRewardsBalance(0); setInterestEarningsBalance(0);
            setTokenBalance(0); setPurchasedMiningPackages([]); setActiveMiningPackage(null);
            setDeposits(0); setWithdrawals(0); setActivityHistory([]);
            setInterestCounter({ isRunning: false, startTime: null, durationHours: 24 });
            setTasksCompletedToday(0); setCompletedTasks([]); setWithdrawalAddresses([]);
            setMonthlyWithdrawalsCount(0); setLastWithdrawalMonth(-1);
            setActiveBoosters([]); setPurchasedBoosterIds([]); setPurchasedReferralsCount(0);
            setHasClaimedSignUpBonus(false); setClaimedReferralIds([]);
            setDailyRewardState({ isEnabled: false, canClaim: false, streak: 0, reward: 0 });
            setNftCollection([]);
            setNftCooldowns({ failedSale: null, successfulSale: null });
        }
        setIsLoading(false);
        setIsReady(true);
    };

    loadInitialData();
  }, [currentUser?.email, getInitialState, setPersistentState]);

  useEffect(() => {
    // Check for expired boosters every minute
    const interval = setInterval(() => {
        if (activeBoosters.length > 0) {
            const now = Date.now();
            const unexpiredBoosters = activeBoosters.filter(b => b.expiresAt > now);
            if (unexpiredBoosters.length < activeBoosters.length) {
                setActiveBoosters(unexpiredBoosters);
            }
        }
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [activeBoosters]);

  useEffect(() => {
    // Check for expired mining package
    const interval = setInterval(() => {
        if (activeMiningPackage && Date.now() >= activeMiningPackage.expiresAt) {
            toast({ title: 'Mining Complete!', description: `Your ${activeMiningPackage.name} package has finished. You can now claim your tokens.` });
        }
    }, 1000 * 60); // Check every minute
    return () => clearInterval(interval);
  }, [activeMiningPackage, toast]);

  const { requests: userRequests } = useMemo(() => {
    if (typeof window === 'undefined' || !currentUser) {
        return { requests: [] };
    }
    const storedRequests = localStorage.getItem('requests');
    const allRequests: Request[] = storedRequests ? JSON.parse(storedRequests) : [];
    return {
        requests: allRequests.filter(req => req.user === currentUser.email)
    };
  }, [currentUser, isReady]); // Re-run when context is ready

  const hasPendingSignUpBonus = useMemo(() => {
    return userRequests.some(req => req.type === 'Sign-up Bonus' && req.status === 'Pending');
  }, [userRequests]);


  const isEligibleForSignUpBonus = useMemo(() => {
    if (!currentUser) return false;
    const signupBonusEnabled = getGlobalSetting('system_signup_bonus_enabled', true, true);
    if (!signupBonusEnabled || currentUser.isBonusDisabled) return false;
    
    return currentUser.isAccountActive;
  }, [currentUser]);


  const signupBonusAmount = useMemo(() => {
    if (!currentUser || !isEligibleForSignUpBonus) return 0;
    
    if (committedBalance === 0) return 0;

    const applicableTiers = signupBonuses
      .filter(tier => committedBalance >= tier.minDeposit)
      .sort((a, b) => b.bonusAmount - a.bonusAmount);

    return applicableTiers.length > 0 ? applicableTiers[0].bonusAmount : 0;
  }, [currentUser, isEligibleForSignUpBonus, signupBonuses, committedBalance]);


  useEffect(() => { if (!isLoading) setPersistentState('mainBalance', mainBalance)}, [mainBalance, isLoading, setPersistentState]);
  useEffect(() => { if (!isLoading) setPersistentState('taskRewardsBalance', taskRewardsBalance)}, [taskRewardsBalance, isLoading, setPersistentState]);
  useEffect(() => { if (!isLoading) setPersistentState('interestEarningsBalance', interestEarningsBalance)}, [interestEarningsBalance, isLoading, setPersistentState]);
  useEffect(() => { if (!isLoading) setPersistentState('tokenBalance', tokenBalance)}, [tokenBalance, isLoading, setPersistentState]);
  useEffect(() => { if (!isLoading) setPersistentState('purchasedMiningPackages', purchasedMiningPackages)}, [purchasedMiningPackages, isLoading, setPersistentState]);
  useEffect(() => { if (!isLoading) setPersistentState('activeMiningPackage', activeMiningPackage)}, [activeMiningPackage, isLoading, setPersistentState]);
  useEffect(() => { if (!isLoading) setPersistentState('deposits', deposits)}, [deposits, isLoading, setPersistentState]);
  useEffect(() => { if (!isLoading) setPersistentState('withdrawals', withdrawals)}, [withdrawals, isLoading, setPersistentState]);
  useEffect(() => { if (!isLoading) setPersistentState('activityHistory', activityHistory)}, [activityHistory, isLoading, setPersistentState]);
  useEffect(() => { if (!isLoading) setPersistentState('interestCounter', interestCounter)}, [interestCounter, isLoading, setPersistentState]);
  useEffect(() => { if (!isLoading) setPersistentState('tasksCompletedToday', tasksCompletedToday)}, [tasksCompletedToday, isLoading, setPersistentState]);
  useEffect(() => { if (!isLoading) setPersistentState('completedTasks', completedTasks)}, [completedTasks, isLoading, setPersistentState]);
  useEffect(() => { if (!isLoading) setPersistentState('withdrawalAddresses', withdrawalAddresses)}, [withdrawalAddresses, isLoading, setPersistentState]);
  useEffect(() => { if (!isLoading) setPersistentState('monthlyWithdrawalsCount', monthlyWithdrawalsCount)}, [monthlyWithdrawalsCount, isLoading, setPersistentState]);
  useEffect(() => { if (!isLoading) setPersistentState('lastWithdrawalMonth', lastWithdrawalMonth)}, [lastWithdrawalMonth, isLoading, setPersistentState]);
  useEffect(() => { if (!isLoading) setPersistentState('activeBoosters', activeBoosters)}, [activeBoosters, isLoading, setPersistentState]);
  useEffect(() => { if (!isLoading) setPersistentState('purchasedBoosterIds', purchasedBoosterIds)}, [purchasedBoosterIds, isLoading, setPersistentState]);
  useEffect(() => { if (!isLoading) setPersistentState('purchased_referrals', purchasedReferralsCount)}, [purchasedReferralsCount, isLoading, setPersistentState]);
  useEffect(() => { if (!isLoading) setPersistentState('hasClaimedSignUpBonus', hasClaimedSignUpBonus)}, [hasClaimedSignUpBonus, isLoading, setPersistentState]);
  useEffect(() => { if (!isLoading) setPersistentState('claimedReferralIds', claimedReferralIds)}, [claimedReferralIds, isLoading, setPersistentState]);
  useEffect(() => { if (!isLoading) setPersistentState('nftCollection', nftCollection)}, [nftCollection, isLoading, setPersistentState]);
  useEffect(() => { if (!isLoading) setPersistentState('nftCooldowns', nftCooldowns)}, [nftCooldowns, isLoading, setPersistentState]);

 const addActivity = useCallback((userEmail: string, activity: Omit<Activity, 'id'>) => {
    const newActivity: Activity = {
        ...activity,
        id: `ACT-${Date.now()}-${Math.random()}`,
    };
     const key = `${userEmail}_activityHistory`;
     const currentHistory = JSON.parse(localStorage.getItem(key) || '[]');
     localStorage.setItem(key, JSON.stringify([newActivity, ...currentHistory]));

     if (currentUser?.email === userEmail) {
        setActivityHistory(prev => [newActivity, ...prev]);
     }
 }, [currentUser]);

  const handleMoveFunds = (destination: 'Task Rewards' | 'Interest Earnings' | 'Main Wallet', amountToMove: number, fromAccount?: 'Task Rewards' | 'Interest Earnings') => {
    if (!currentUser) return;

    let description = '';
    let tempMainBalance = mainBalance;
    let tempTaskBalance = taskRewardsBalance;
    let tempInterestBalance = interestEarningsBalance;

    if (!fromAccount) { // Moving from Main Wallet
      if (amountToMove > tempMainBalance) { toast({ variant: "destructive", title: "Insufficient Funds" }); return; }
      tempMainBalance -= amountToMove;
      if (destination === 'Task Rewards') tempTaskBalance += amountToMove;
      if (destination === 'Interest Earnings') tempInterestBalance += amountToMove;
      description = `Moved $${amountToMove.toFixed(2)} to ${destination}`;
    } else { // Moving between earning wallets or back to main
        if (fromAccount === 'Task Rewards') {
            if (amountToMove > taskRewardsBalance) { toast({ variant: "destructive", title: "Insufficient Funds", description: `You cannot move more than the available balance of $${taskRewardsBalance.toFixed(2)}.` }); return; }
            tempTaskBalance -= amountToMove;
        } else if (fromAccount === 'Interest Earnings') {
            if (amountToMove > interestEarningsBalance) { toast({ variant: "destructive", title: "Insufficient Funds", description: `You cannot move more than the available balance of $${interestEarningsBalance.toFixed(2)}.` }); return; }
            tempInterestBalance -= amountToMove;
        }

        if (destination === 'Main Wallet') tempMainBalance += amountToMove;
        if (destination === 'Interest Earnings') tempInterestBalance += amountToMove;
        if (destination === 'Task Rewards') tempTaskBalance += amountToMove;
        description = `Moved $${amountToMove.toFixed(2)} from ${fromAccount} to ${destination}`;
    }

    setMainBalance(tempMainBalance);
    setTaskRewardsBalance(tempTaskBalance);
    setInterestEarningsBalance(tempInterestBalance);

    const newCommittedBalance = tempTaskBalance + tempInterestBalance;
    const minBalanceForLevel1 = minRequiredBalanceForLevel(1);

    // Check for Activation/Deactivation
    if (currentUser.status === 'inactive' && newCommittedBalance >= minBalanceForLevel1) {
      activateUserAccount(currentUser.email);
    } else if (currentUser.status === 'active' && newCommittedBalance < minBalanceForLevel1) {
      updateUserStatus(currentUser.email, 'inactive');
    }

    addActivity(currentUser.email, {
        type: 'Fund Movement',
        description: description,
        amount: 0,
        date: new Date().toISOString()
    })
    toast({ title: "Funds Moved", description: `${amountToMove.toFixed(2)} USDT transfer complete.` });
  };

  const approveRecharge = (userEmail: string, rechargeAmount: number) => {
      const mainBalanceKey = `${userEmail}_mainBalance`;
      const currentMainBalance = parseFloat(localStorage.getItem(mainBalanceKey) || '0');
      const newMainBalance = currentMainBalance + rechargeAmount;
      localStorage.setItem(mainBalanceKey, newMainBalance.toString());

      const depositsKey = `${userEmail}_deposits`;
      const depositCount = parseInt(localStorage.getItem(depositsKey) || '0');
      localStorage.setItem(depositsKey, (depositCount + 1).toString());
      
      if(currentUser?.email === userEmail) {
          setMainBalance(prev => prev + rechargeAmount);
          setDeposits(prev => prev + 1);
          toast({ title: "Recharge Approved", description: `Your balance has been updated by ${rechargeAmount.toFixed(2)} USDT.` });
      }

      addActivity(userEmail, {
          type: 'Recharge',
          description: 'Recharge approved by admin',
          amount: rechargeAmount,
          date: new Date().toISOString()
      });
  };

  const addCommissionToMainBalance = useCallback((commissionAmount: number) => {
    if (!currentUser || currentUser.status !== 'active' || commissionAmount <= 0) return;
    setMainBalance(prev => prev + commissionAmount);
    addActivity(currentUser.email, {
        type: 'Team Commission',
        description: 'Daily commission from team earnings',
        amount: commissionAmount,
        date: new Date().toISOString()
    });
    toast({ title: "Team Commission Received!", description: `Your daily team commission of $${commissionAmount.toFixed(2)} has been credited.` });
  }, [toast, addActivity, currentUser]);
  
  const addCommunityCommissionToMainBalance = useCallback((commissionAmount: number) => {
    if (!currentUser || currentUser.status !== 'active' || commissionAmount <= 0) return;
    setMainBalance(prev => prev + commissionAmount);
    addActivity(currentUser.email, {
        type: 'Community Commission',
        description: 'Commission from community earnings',
        amount: commissionAmount,
        date: new Date().toISOString()
    });
    toast({ title: "Community Commission Received!", description: `Your community commission of $${commissionAmount.toFixed(2)} has been credited.` });
  }, [toast, addActivity, currentUser]);

  const addUplineCommissionToMainBalance = useCallback((commissionAmount: number) => {
    if (!currentUser || currentUser.status !== 'active' || commissionAmount <= 0) return;
    setMainBalance(prev => prev + commissionAmount);
    addActivity(currentUser.email, {
      type: 'Upline Commission Payout',
      description: 'Daily commission from sponsor credited',
      amount: commissionAmount,
      date: new Date().toISOString(),
    });
    toast({ title: 'Upline Commission Received!', description: `Your daily upline commission of $${commissionAmount.toFixed(2)} has been credited.` });
  }, [toast, addActivity, currentUser]);


  const requestWithdrawal = (withdrawalAmount: number, withdrawalAddress: string) => { 
    if (!currentUser) return;
    setMainBalance(prev => prev - withdrawalAmount); 
  }

  const approveWithdrawal = (userEmail: string, amount: number) => {
    const withdrawalsKey = `${userEmail}_withdrawals`;
    const withdrawalCount = parseInt(localStorage.getItem(withdrawalsKey) || '0');
    localStorage.setItem(withdrawalsKey, (withdrawalCount + 1).toString());
    const monthlyCountKey = `${userEmail}_monthlyWithdrawalsCount`;
    const monthlyCount = parseInt(localStorage.getItem(monthlyCountKey) || '0');
    localStorage.setItem(monthlyCountKey, (monthlyCount + 1).toString());
    const lastMonthKey = `${userEmail}_lastWithdrawalMonth`;
    localStorage.setItem(lastMonthKey, new Date().getMonth().toString());

    addActivity(userEmail, {
        type: 'Withdrawal',
        description: `Withdrawal of $${amount.toFixed(2)} approved`,
        amount: -amount,
        date: new Date().toISOString()
    });

    if(currentUser?.email === userEmail) {
      setWithdrawals(prev => prev + 1);
      setMonthlyWithdrawalsCount(prev => prev + 1);
      const currentMonth = new Date().getMonth();
      setLastWithdrawalMonth(currentMonth);
    }
  }

  const approveSignUpBonus = (userEmail: string, amount: number) => {
    const key = `${userEmail}_mainBalance`;
    const currentBalance = parseFloat(localStorage.getItem(key) || '0');
    localStorage.setItem(key, (currentBalance + amount).toString());

    localStorage.setItem(`${userEmail}_hasClaimedSignUpBonus`, JSON.stringify(true));

    addActivity(userEmail, {
        type: 'Sign-up Bonus',
        description: 'Sign-up bonus approved by admin',
        amount: amount,
        date: new Date().toISOString()
    });

    if (currentUser?.email === userEmail) {
        setMainBalance(prev => prev + amount);
        setHasClaimedSignUpBonus(true);
    }
  };

  const approveReferralBonus = (userEmail: string, referredUser: string, amount: number) => {
    const key = `${userEmail}_mainBalance`;
    const currentBalance = parseFloat(localStorage.getItem(key) || '0');
    localStorage.setItem(key, (currentBalance + amount).toString());

    const claimedIdsKey = `${userEmail}_claimedReferralIds`;
    const currentClaimedIds = JSON.parse(localStorage.getItem(claimedIdsKey) || '[]');
    localStorage.setItem(claimedIdsKey, JSON.stringify([...currentClaimedIds, referredUser]));

     addActivity(userEmail, {
        type: 'Referral Bonus',
        description: `Bonus for referral ${referredUser} approved`,
        amount: amount,
        date: new Date().toISOString()
    });

    if (currentUser?.email === userEmail) {
        setMainBalance(prev => prev + amount);
        setClaimedReferralIds(prev => [...prev, referredUser]);
    }
  };
  
  const approveSalary = (userEmail: string, amount: number, salaryPackageName: string) => {
    const key = `${userEmail}_mainBalance`;
    const currentBalance = parseFloat(localStorage.getItem(key) || '0');
    localStorage.setItem(key, (currentBalance + amount).toString());

    addActivity(userEmail, {
        type: 'Salary Claim',
        description: `Salary claim for '${salaryPackageName}' approved`,
        amount: amount,
        date: new Date().toISOString()
    });
    
    if (currentUser?.email === userEmail) {
        setMainBalance(prev => prev + amount);
    }
  };

  const refundWithdrawal = (userEmail: string, withdrawalAmount: number) => {
    const key = `${userEmail}_mainBalance`;
    const currentBalance = parseFloat(localStorage.getItem(key) || '0');
    localStorage.setItem(key, (currentBalance + withdrawalAmount).toString());

     addActivity(userEmail, {
        type: 'Withdrawal',
        description: 'Withdrawal declined, funds refunded',
        amount: withdrawalAmount,
        date: new Date().toISOString()
    });

    if(currentUser?.email === userEmail) {
        setMainBalance(prev => prev + withdrawalAmount);
        toast({ variant: "default", title: "Withdrawal Refunded", description: `Your withdrawal request was declined. ${withdrawalAmount.toFixed(2)} has been returned to your main balance.` });
    }
  }
  
  const startCounter = (type: CounterType, durationHours = 24) => {
      const now = Date.now();
      if (type === 'interest') {
          const minBalanceForLevel1 = configuredLevels.find(l => l.level === 1)?.minAmount ?? 100;
           if (interestEarningsBalance < minBalanceForLevel1) {
                toast({ variant: "destructive", title: "Insufficient Funds", description: `A minimum of $${minBalanceForLevel1} is required in the interest wallet.` });
                return;
           }
          setInterestCounter({ isRunning: true, startTime: now, durationHours });
          toast({ title: `Interest Earning Started`, description: `Your ${durationHours}-hour earning cycle has begun.` });
      }
  };
  
  const isFundMovementLocked = (type: 'interest' | 'task' | 'mining') => {
      if (type === 'interest') {
        return interestCounter.isRunning;
      }
      if (type === 'task') {
        const tasksInProgress = tasksCompletedToday > 0 && tasksCompletedToday < dailyTaskQuota;
        return tasksInProgress;
      }
      if (type === 'mining') {
          return activeMiningPackage !== null;
      }
      return false;
  }

  const claimAndRestartCounter = (type: CounterType) => {
      if(!currentUser) return;
      const dailyRate = currentRate / 100;
      if (type === 'interest') {
          const lockedDurationHours = interestCounter.durationHours || 24;
          const lockedDurationDays = lockedDurationHours / 24;
          const earnings = interestEarningsBalance * dailyRate * lockedDurationDays;
          setInterestEarningsBalance(prev => prev + earnings);
          addActivity(currentUser.email, {
            type: 'Interest Claim',
            description: `Claimed ${lockedDurationHours}-hour interest`,
            amount: earnings,
            date: new Date().toISOString()
          });
          setInterestCounter({ isRunning: false, startTime: null, durationHours: 24 }); 
          toast({ title: "Interest Claimed!", description: `You earned ${earnings.toFixed(4)} USDT. You can now move funds and restart the timer when ready.`});
      }
  };

  const completeTask = (task: GenerateTaskSuggestionOutput) => {
      if (!currentUser) return;
      if (tasksCompletedToday >= dailyTaskQuota) {
          toast({ variant: "destructive", title: "Daily Limit Reached", description: "You have already completed all your tasks for today." });
          return;
      }
      
      const finalEarning = earningPerTask;

      const newTasksCompleted = tasksCompletedToday + 1;
      const newTaskRewardsBalance = taskRewardsBalance + finalEarning;
      const newCompletedTask: CompletedTask = { id: `TASK-${Date.now()}`, title: task.taskTitle, description: task.taskDescription, earnings: finalEarning, completedAt: new Date().toISOString() };
      const newCompletedTasks = [newCompletedTask, ...completedTasks];
      
      setTaskRewardsBalance(newTaskRewardsBalance);
      setTasksCompletedToday(newTasksCompleted);
      setCompletedTasks(newCompletedTasks);
      
      setPersistentState('taskRewardsBalance', newTaskRewardsBalance);
      setPersistentState('tasksCompletedToday', newTasksCompleted);
      setPersistentState('completedTasks', newCompletedTasks);
      setPersistentState('lastTaskResetDate', new Date().toISOString());

      // Find the direct downline user to record their potential commission
      const downlineUser = users.find(u => u.referredBy === currentUser.referralCode);
      if (downlineUser) {
        const uplineCommissionSettings = getGlobalSetting('upline_commission_settings', { enabled: false, rate: 0, requiredReferrals: 0 }, true);
        if (uplineCommissionSettings.enabled && downlineUser.status === 'active') {
          const downlineUserReferralCount = users.filter(u => u.referredBy === downlineUser.referralCode && u.status === 'active').length;
          if (downlineUserReferralCount >= uplineCommissionSettings.requiredReferrals) {
            const commissionAmount = finalEarning * (uplineCommissionSettings.rate / 100);
            if (commissionAmount > 0) {
              addActivity(downlineUser.email, {
                  type: 'Upline Commission',
                  description: `Commission from upline: ${currentUser.email}`,
                  amount: commissionAmount,
                  date: new Date().toISOString(),
              });
            }
          }
        }
      }

      toast({ title: "Task Completed!", description: `You've earned ${finalEarning.toFixed(4)} USDT.` });
  };

  const addWithdrawalAddress = (addressData: Omit<WithdrawalAddress, 'id'>) => {
    const newAddress: WithdrawalAddress = {
      id: `ADDR-${Date.now()}`,
      ...addressData,
      enabled: true,
    };
    if (multipleAddressesEnabled) {
      setWithdrawalAddresses(prev => [...prev, newAddress]);
    } else {
      setWithdrawalAddresses([newAddress]);
    }
  };
  
  const updateWithdrawalAddress = (id: string, data: Partial<Omit<WithdrawalAddress, 'id'>>) => {
    setWithdrawalAddresses(prev => prev.map(addr => addr.id === id ? { ...addr, ...data } : addr));
  };

  const deleteWithdrawalAddress = (id: string) => {
    setWithdrawalAddresses(prev => prev.filter(addr => addr.id !== id));
  };

  const purchaseBooster = (booster: Booster): boolean => {
    if (!currentUser) return false;

    if (currentUser.status !== 'active') {
        setIsInactiveWarningOpen(true);
        return false;
    }

    if (mainBalance < booster.price) {
        toast({ variant: 'destructive', title: 'Insufficient Funds', description: 'You do not have enough funds in your main wallet to purchase this booster.'});
        return false;
    }
    
    if (purchasedBoosterIds.includes(booster.id)) {
        toast({ variant: 'destructive', title: 'Booster Already Purchased', description: 'You have already purchased this booster. Wait for it to expire if it is temporary.'});
        return false;
    }

    setMainBalance(prev => prev - booster.price);
    
    addActivity(currentUser.email, {
        type: 'Booster Purchase',
        description: `Purchased ${booster.name}`,
        amount: -booster.price,
        date: new Date().toISOString()
    });
    
    if (booster.type === 'PURCHASE_REFERRAL') {
        const referralCount = booster.value;
        const newReferralCount = purchasedReferralsCount + referralCount;
        setPurchasedReferralsCount(newReferralCount);
        setPurchasedBoosterIds(prev => [...prev, booster.id]);
        toast({ title: 'Referrals Purchased!', description: `You have successfully purchased ${referralCount} referrals. Your level may be automatically updated.`});
    } else {
        const newActiveBooster: ActiveBooster = {
            boosterId: booster.id,
            type: booster.type,
            value: booster.value,
            expiresAt: Date.now() + booster.duration * 60 * 60 * 1000,
        };
        setActiveBoosters(prev => [...prev, newActiveBooster]);
        setPurchasedBoosterIds(prev => [...prev, booster.id]);
        toast({ title: 'Booster Purchased!', description: `The "${booster.name}" booster is now active!`});
    }
    
    return true;
  };
  
  const claimSignUpBonus = () => {
    if (!currentUser || hasClaimedSignUpBonus || !isEligibleForSignUpBonus || hasPendingSignUpBonus) return;
    
    if (currentUser.status !== 'active') {
        setIsInactiveWarningOpen(true);
        return;
    }

    const bonus = signupBonusAmount;
    if (bonus <= 0) return;

    if (isSignupApprovalRequired) {
        // This is handled by RequestContext now.
    } else {
        setMainBalance(prev => prev + bonus);
        addActivity(currentUser.email, {
            type: "Sign-up Bonus",
            description: `Sign-up bonus claimed`,
            amount: bonus,
            date: new Date().toISOString()
        });
        setHasClaimedSignUpBonus(true);
        toast({
            title: "Sign-up Bonus Claimed!",
            description: `The reward of $${bonus.toFixed(2)} has been added to your main wallet.`,
        });
    }
  };
  
  const referralBonusFor = useCallback((referralEmail: string): number => {
    const referralUser = users.find(u => u.email === referralEmail);
    if (!referralUser || !referralUser.isAccountActive) return 0;
    
    const referralBonusEnabled = getGlobalSetting('system_referral_bonus_enabled', true, true);
    if (!referralBonusEnabled) return 0;

    const referralTaskBalance = getInitialState('taskRewardsBalance', 0, referralEmail);
    const referralInterestBalance = getInitialState('interestEarningsBalance', 0, referralEmail);
    const referralCommittedBalance = referralTaskBalance + referralInterestBalance;

    if (referralCommittedBalance === 0) return 0;

    const applicableTiers = referralBonuses
        .filter(tier => referralCommittedBalance >= tier.minDeposit)
        .sort((a, b) => b.bonusAmount - a.bonusAmount);

    return applicableTiers.length > 0 ? applicableTiers[0].bonusAmount : 0;
  }, [referralBonuses, users, getInitialState]);
  
  const claimReferralBonus = (referralEmail: string) => {
    if (!currentUser || claimedReferralIds.includes(referralEmail) || userRequests.some(req => req.type === 'Referral Bonus' && req.address === referralEmail && req.status === 'Pending')) return;
    
    if (currentUser.status !== 'active') {
        setIsInactiveWarningOpen(true);
        return;
    }

    const referral = users.find(u => u.email === referralEmail);
    if (!referral || !referral.isAccountActive) return;
    
    const bonusAmount = referralBonusFor(referralEmail);
    if (bonusAmount <= 0) return;

    if(isReferralApprovalRequired) {
        // Handled by RequestContext
    } else {
        setMainBalance(prev => prev + bonusAmount);
        addActivity(currentUser.email, {
            type: "Referral Bonus",
            description: `Bonus for referral: ${referralEmail}`,
            amount: bonusAmount,
            date: new Date().toISOString()
        });
        setClaimedReferralIds(prev => [...prev, referralEmail]);
        toast({
            title: "Referral Bonus Claimed!",
            description: `Reward of $${bonusAmount.toFixed(2)} for referring ${referralEmail} has been credited.`,
        });
    }
  };

  const claimDailyReward = () => {
    if (!currentUser || currentUser.status !== 'active' || !dailyRewardState?.canClaim || !dailyRewardState.isEnabled) {
      if (currentUser?.status !== 'active') {
        setIsInactiveWarningOpen(true);
      }
      return;
    }
    
    const rewardAmount = dailyRewardState.reward;
    setMainBalance(prev => prev + rewardAmount);
    addActivity(currentUser.email, {
        type: 'Daily Reward',
        description: `Daily check-in streak: Day ${dailyRewardState.streak + 1}`,
        amount: rewardAmount,
        date: new Date().toISOString()
    });

    const newStreak = dailyRewardState.streak + 1;
    const today = new Date().toISOString().split('T')[0];
    
    setPersistentState('last_daily_claim_date', today);
    setPersistentState('daily_claim_streak', newStreak);

    setDailyRewardState(prev => prev ? {...prev, canClaim: false, streak: newStreak} : undefined);
    
    toast({
        title: "Daily Reward Claimed!",
        description: `$${rewardAmount.toFixed(2)} has been added to your main wallet.`
    });
  }
  
  const getReferralCommissionBoost = () => {
      const boost = activeBoosters.find(b => b.type === 'REFERRAL_COMMISSION');
      return boost ? boost.value : 0;
  }

  const mintNft = async (achievementId: string, achievementTitle: string) => {
    if (!currentUser) return;
    const nftSettings = getGlobalSetting('nft_market_settings', { mintingFee: 10 }, true);
    const mintingFee = nftSettings.mintingFee;

    if (mainBalance < mintingFee) {
        toast({ variant: 'destructive', title: 'Insufficient Funds', description: `You need at least $${mintingFee.toFixed(2)} in your main wallet to mint an NFT.` });
        return;
    }

    try {
        const artworkFromLibrary = nftLibrary.find(item => item.achievementId === achievementId);

        if (!artworkFromLibrary) {
            throw new Error('Artwork not found in library for this achievement.');
        }

        const newNft: Nft = {
            id: `NFT-${Date.now()}`,
            title: achievementTitle,
            artworkUrl: artworkFromLibrary.imageUrl,
            mintedAt: new Date().toISOString(),
            currentValue: 50, // Initial value
        };
        
        setMainBalance(prev => prev - mintingFee);
        setNftCollection(prev => [...prev, newNft]);

        addActivity(currentUser.email, {
            type: 'NFT Mint',
            description: `Minted "${achievementTitle}" NFT`,
            amount: -mintingFee,
            date: new Date().toISOString()
        });

        toast({ title: 'NFT Minted!', description: `Your "${achievementTitle}" achievement is now an NFT in your collection.` });
    } catch (error) {
        console.error("Minting Error:", error);
        toast({ variant: 'destructive', title: 'Minting Failed', description: 'Could not create NFT from the library. Please contact support.' });
    }
  };
  
  const sellNft = async (nftId: string) => {
    if (!currentUser) return;

    // Check cooldowns
    const now = Date.now();
    if ((nftCooldowns.failedSale && now < nftCooldowns.failedSale) || (nftCooldowns.successfulSale && now < nftCooldowns.successfulSale)) {
        toast({ variant: 'destructive', title: 'Action Cooldown', description: 'You cannot sell an NFT at this time.' });
        return;
    }

    const nftToSell = nftCollection.find(n => n.id === nftId);
    if (!nftToSell) return;

    const nftSettings = getGlobalSetting('nft_market_settings', {
        marketSuccessRate: 80,
        platformCommission: 2.5,
        failedAttemptCooldown: 60,
        successfulSaleCooldown: 1440,
    }, true);

    // Simulate sale success
    const isSuccessful = Math.random() * 100 < nftSettings.marketSuccessRate;

    if (isSuccessful) {
        const profit = nftToSell.currentValue * (Math.random() * 0.10 + 1.05); // 5-15% profit
        const commission = profit * (nftSettings.platformCommission / 100);
        const netProfit = profit - commission;

        setMainBalance(prev => prev + netProfit);
        setNftCollection(prev => prev.filter(n => n.id !== nftId));

        addActivity(currentUser.email, {
            type: 'NFT Sale (Success)',
            description: `Sold "${nftToSell.title}" NFT`,
            amount: netProfit,
            date: new Date().toISOString(),
        });
        
        const newCooldownEnd = Date.now() + nftSettings.successfulSaleCooldown * 60 * 1000;
        setNftCooldowns(prev => ({ ...prev, successfulSale: newCooldownEnd }));

        toast({ title: 'Sale Successful!', description: `You earned $${netProfit.toFixed(2)} from the sale of your NFT.` });
    } else {
         addActivity(currentUser.email, {
            type: 'NFT Sale (Failed)',
            description: `Failed to sell "${nftToSell.title}" NFT`,
            date: new Date().toISOString(),
        });

        const newCooldownEnd = Date.now() + nftSettings.failedAttemptCooldown * 60 * 1000;
        setNftCooldowns(prev => ({ ...prev, failedSale: newCooldownEnd }));

        toast({ variant: 'destructive', title: 'Sale Failed', description: 'Your NFT did not find a buyer this time. Please try again later.' });
    }
  };

  const stakeNft = (nftId: string, packageId: string) => {
    if (!currentUser) return;
    const nftToStake = nftCollection.find(n => n.id === nftId);
    if (!nftToStake || nftToStake.stakedUntil) return;
  
    const stakingPackages: NftStakingPackage[] = getGlobalSetting('nft_staking_packages', [], true);
    const pkg = stakingPackages.find(p => p.id === packageId);
    if (!pkg) {
      toast({ variant: 'destructive', title: 'Staking package not found.' });
      return;
    }
  
    const now = Date.now();
    const expiresAt = now + pkg.durationHours * 60 * 60 * 1000;
  
    setNftCollection(prev =>
      prev.map(nft =>
        nft.id === nftId ? { ...nft, stakedUntil: expiresAt, stakedInPackageId: pkg.id } : nft
      )
    );
  
    addActivity(currentUser.email, {
      type: 'NFT Stake',
      description: `Staked "${nftToStake.title}" for ${pkg.durationHours} hours.`,
      date: new Date().toISOString(),
    });
  
    toast({ title: 'NFT Staked!', description: `Your "${nftToStake.title}" is now earning token rewards.` });
  };
  
  const claimStakedNftRewards = (nftId: string) => {
    if (!currentUser) return;
    const nftToClaim = nftCollection.find(n => n.id === nftId);
    if (!nftToClaim || !nftToClaim.stakedUntil || Date.now() < nftToClaim.stakedUntil) {
      toast({ variant: 'destructive', title: 'Staking period not over.' });
      return;
    }
  
    const stakingPackages: NftStakingPackage[] = getGlobalSetting('nft_staking_packages', [], true);
    const pkg = stakingPackages.find(p => p.id === nftToClaim.stakedInPackageId);
    if (!pkg) {
      toast({ variant: 'destructive', title: 'Could not find staking package details.' });
      return;
    }
  
    const percentageReward = nftToClaim.currentValue * (pkg.rewardRatePercent / 100);
    const totalReward = percentageReward + pkg.fixedTokenBonus;
  
    setTokenBalance(prev => prev + totalReward);
    setNftCollection(prev =>
      prev.map(nft =>
        nft.id === nftId ? { ...nft, stakedUntil: null, stakedInPackageId: null } : nft
      )
    );
  
    addActivity(currentUser.email, {
      type: 'NFT Staking Reward',
      description: `Claimed rewards for "${nftToClaim.title}"`,
      amount: totalReward,
      date: new Date().toISOString(),
    });
  
    toast({ title: 'Rewards Claimed!', description: `You received ${totalReward.toFixed(4)} ${tokenomics.tokenSymbol} tokens.` });
  };

  const purchaseMiningPackage = (packageId: string) => {
    if (!currentUser) return;
    const allPackages = getGlobalSetting('mining_packages', [], true);
    const pkgToBuy = allPackages.find((p: MiningPackageInfo) => p.id === packageId);
    
    if (!pkgToBuy) {
        toast({ variant: 'destructive', title: 'Package not found' });
        return;
    }
    
    if (mainBalance < pkgToBuy.price) {
        toast({ variant: 'destructive', title: 'Insufficient Funds' });
        return;
    }

    setMainBalance(prev => prev - pkgToBuy.price);
    const newPurchasedPackage: PurchasedMiningPackage = {
        id: `purchased-${Date.now()}`,
        packageId: pkgToBuy.id,
        name: pkgToBuy.name,
        status: 'available',
    };
    setPurchasedMiningPackages(prev => [...prev, newPurchasedPackage]);
    
    addActivity(currentUser.email, { type: 'Mining Package Purchase', description: `Purchased ${pkgToBuy.name}`, amount: -pkgToBuy.price, date: new Date().toISOString() });
    toast({ title: 'Package Purchased', description: `${pkgToBuy.name} is now available to be activated.` });
  };
  
  const startMining = (purchasedPackageId: string) => {
    if (!currentUser || activeMiningPackage) return;
    
    const allPackages = getGlobalSetting('mining_packages', [], true);
    const purchasedPkg = purchasedMiningPackages.find(p => p.id === purchasedPackageId);
    if (!purchasedPkg || purchasedPkg.status !== 'available') {
        toast({ variant: 'destructive', title: 'Package not available' });
        return;
    }
    
    const packageInfo = allPackages.find((p: MiningPackageInfo) => p.id === purchasedPkg.packageId);
    if (!packageInfo) return;
    
    const now = Date.now();
    const newActivePackage: ActiveMiningPackage = {
        id: purchasedPkg.id,
        packageId: packageInfo.id,
        name: packageInfo.name,
        miningRate: packageInfo.miningRate,
        duration: packageInfo.duration,
        startedAt: now,
        expiresAt: now + packageInfo.duration * 60 * 60 * 1000,
    };

    setActiveMiningPackage(newActivePackage);
    setPurchasedMiningPackages(prev => prev.map(p => p.id === purchasedPackageId ? { ...p, status: 'active' } : p));
    toast({ title: 'Mining Activated!', description: `${packageInfo.name} has started mining.` });
  };

  const claimMinedTokens = () => {
    if (!currentUser || !activeMiningPackage || Date.now() < activeMiningPackage.expiresAt) return;
    
    const minedAmount = activeMiningPackage.miningRate * activeMiningPackage.duration;
    
    setTokenBalance(prev => prev + minedAmount);
    addActivity(currentUser.email, { type: 'Token Claim', description: `Claimed ${minedAmount.toFixed(4)} ${tokenomics.tokenSymbol} from ${activeMiningPackage.name}`, date: new Date().toISOString() });
    
    setPurchasedMiningPackages(prev => prev.filter(p => p.id !== activeMiningPackage.id));
    setActiveMiningPackage(null);
    toast({ title: 'Tokens Claimed!', description: `${minedAmount.toFixed(4)} ${tokenomics.tokenSymbol} has been added to your token wallet.` });
  };
  
  const convertTokensToUsdt = (tokenAmount: number) => {
    if (!currentUser) return;
    if (tokenAmount > tokenBalance) {
        toast({ variant: 'destructive', title: 'Insufficient Tokens' });
        return;
    }
    
    const usdtAmount = tokenAmount / tokenomics.conversionRate;
    
    setTokenBalance(prev => prev - tokenAmount);
    setMainBalance(prev => prev + usdtAmount);

    addActivity(currentUser.email, {
        type: 'Token Conversion',
        description: `Converted ${tokenAmount.toFixed(4)} ${tokenomics.tokenSymbol} to ${usdtAmount.toFixed(2)} USDT`,
        amount: usdtAmount,
        date: new Date().toISOString()
    });
    toast({ title: 'Conversion Successful', description: `You received ${usdtAmount.toFixed(2)} USDT in your main wallet.` });
  };

  return (
    <WalletContext.Provider
      value={{
        mainBalance,
        taskRewardsBalance,
        interestEarningsBalance,
        committedBalance,
        currentLevel,
        taskLevel,
        currentRate,
        dailyTaskQuota,
        monthlyWithdrawalLimit,
        minWithdrawalAmount,
        maxWithdrawalAmount,
        withdrawalFee,
        earningPerTask,
        monthlyWithdrawalsCount,
        tasksCompletedToday,
        completedTasks,
        levelUnlockProgress,
        minRequiredBalanceForLevel,
        handleMoveFunds,
        approveRecharge,
        addCommissionToMainBalance,
        addCommunityCommissionToMainBalance,
        addUplineCommissionToMainBalance,
        requestWithdrawal,
        approveWithdrawal,
        approveSignUpBonus,
        approveReferralBonus,
        approveSalary,
        refundWithdrawal,
        isLoading,
        interestCounter,
        startCounter,
        claimAndRestartCounter,
        completeTask,
        withdrawalAddresses,
        addWithdrawalAddress,
        updateWithdrawalAddress,
        deleteWithdrawalAddress,
        isWithdrawalRestrictionEnabled,
        withdrawalRestrictionDays,
        purchaseBooster,
        activeBoosters,
        purchasedBoosterIds,
        getReferralCommissionBoost,
        isFundMovementLocked,
        addActivity,
        activityHistory,
        multipleAddressesEnabled,
        claimSignUpBonus,
        hasClaimedSignUpBonus,
        isEligibleForSignUpBonus,
        signupBonusAmount,
        referralBonuses,
        referralBonusFor,
        claimReferralBonus,
        claimedReferralIds,
        purchasedReferralsCount,
        dailyRewardState,
        claimDailyReward,
        isInactiveWarningOpen,
        setIsInactiveWarningOpen,
        isInterestFeatureEnabled,
        interestEarningModel,
        fixedTermDurations,
        nftCollection,
        mintNft,
        sellNft,
        nftCooldowns,
        isNftFeatureEnabled,
        stakeNft,
        claimStakedNftRewards,
        // Token Mining
        isMiningEnabled,
        tokenBalance,
        tokenomics,
        activeMiningPackage,
        purchasedMiningPackages,
        purchaseMiningPackage,
        startMining,
        claimMinedTokens,
        convertTokensToUsdt
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
