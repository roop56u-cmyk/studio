

"use client";

import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from './AuthContext';
import { GenerateTaskSuggestionOutput } from '@/app/actions';
import { levels as defaultLevels, Level } from '@/components/dashboard/level-tiers';
import { platformMessages } from '@/lib/platform-messages';
import type { BonusTier } from '@/app/dashboard/admin/settings/page';
import type { DailyReward } from '@/app/dashboard/admin/daily-rewards/page';


export type Request = {
    id: string;
    user: string;
    type: 'Recharge' | 'Withdrawal' | 'Team Reward' | 'Team Size Reward' | 'Sign-up Bonus' | 'Referral Bonus' | 'Salary Claim';
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
    enabled: boolean;
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

interface WalletContextType {
  mainBalance: number;
  taskRewardsBalance: number;
  interestEarningsBalance: number;
  committedBalance: number;
  currentLevel: number;
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
  amount: string;
  setAmount: (amount: string) => void;
  handleMoveFunds: (destination: 'Task Rewards' | 'Interest Earnings' | 'Main Wallet', amountToMove: number, fromAccount?: 'Task Rewards' | 'Interest Earnings') => void;
  approveRecharge: (userEmail: string, rechargeAmount: number) => void;
  addCommissionToMainBalance: (commissionAmount: number) => void;
  requestWithdrawal: (withdrawalAmount: number, withdrawalAddress: string) => void;
  approveWithdrawal: (userEmail: string, amount: number) => void;
  approveSignUpBonus: (userEmail: string, amount: number) => void;
  approveReferralBonus: (userEmail: string, referredUser: string, amount: number) => void;
  approveSalary: (userEmail: string, amount: number) => void;
  refundWithdrawal: (userEmail: string, withdrawalAmount: number) => void;
  isLoading: boolean;
  interestCounter: CounterState;
  startCounter: (type: 'task' | 'interest') => void;
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
  isFundMovementLocked: (type: 'task' | 'interest') => boolean;
  addTransaction: (userEmail: string, transaction: Omit<Transaction, 'id'>) => void;
  transactionHistory: Transaction[];
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
}

export type Transaction = {
    id: string;
    type: string;
    description: string;
    amount: number;
    date: string;
};

export type CounterType = 'task' | 'interest';

export interface CounterState {
    isRunning: boolean;
    startTime: number | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const { currentUser, users, activateUserAccount, updateUserStatus } = useAuth();
  const [amount, setAmount] = useState("");
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
  const [transactionHistory, setTransactionHistory] = useState<Transaction[]>([]);
  const [interestCounter, setInterestCounter] = useState<CounterState>({ isRunning: false, startTime: null });
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
  
  const committedBalance = taskRewardsBalance + interestEarningsBalance;
  
  const getInitialState = useCallback((key: string, defaultValue: any) => {
    if (typeof window === 'undefined' || !currentUser?.email) {
      return defaultValue;
    }
    try {
      const storedValue = localStorage.getItem(`${currentUser.email}_${key}`);
      if (storedValue) {
        return JSON.parse(storedValue);
      }
    } catch (error) {
      console.error(`Failed to parse ${key} from localStorage for ${currentUser.email}`, error);
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
  
  const { rate: baseRate, dailyTasks: baseDailyTaskQuota, monthlyWithdrawals: monthlyWithdrawalLimit, minWithdrawal: minWithdrawalAmount, maxWithdrawal: maxWithdrawalAmount, withdrawalFee } = currentLevelData;
  const currentRate = baseRate + (baseRate * (interestRateBoost / 100));
  const dailyTaskQuota = baseDailyTaskQuota + taskQuotaBoost;
  
  const earningPerTask = useMemo(() => {
    if (earningModel === 'fixed') {
        return currentLevelData.earningPerTask;
    }
    if (dailyTaskQuota === 0 || taskRewardsBalance < minRequiredBalanceForLevel(currentLevel)) return 0;
    const dailyEarningPotential = taskRewardsBalance * (currentRate / 100);
    return dailyEarningPotential / dailyTaskQuota;
  }, [taskRewardsBalance, currentRate, dailyTaskQuota, earningModel, currentLevelData, currentLevel, minRequiredBalanceForLevel]);
  
  useEffect(() => {
    setIsLoading(true);
    
    // Global settings
    setIsWithdrawalRestrictionEnabled(getGlobalSetting('system_withdrawal_restriction_enabled', true, true));
    setWithdrawalRestrictionDays(parseInt(getGlobalSetting('system_withdrawal_restriction_days', '45'), 10));
    setConfiguredLevels(getGlobalSetting('platform_levels', defaultLevels, true));
    setEarningModel(getGlobalSetting('system_earning_model', 'dynamic'));
    setMultipleAddressesEnabled(getGlobalSetting('system_multiple_addresses_enabled', true, true));
    setSignupBonuses(getGlobalSetting('system_signup_bonuses', [], true));
    setReferralBonuses(getGlobalSetting('system_referral_bonuses', [], true));
    setIsSignupApprovalRequired(getGlobalSetting('system_signup_bonus_approval_required', false, true));
    setIsReferralApprovalRequired(getGlobalSetting('system_referral_bonus_approval_required', false, true));

    // User-specific data
    if (currentUser?.email) {
        setMainBalance(getInitialState('mainBalance', 0));
        setTaskRewardsBalance(getInitialState('taskRewardsBalance', 0));
        setInterestEarningsBalance(getInitialState('interestEarningsBalance', 0));
        setDeposits(getInitialState('deposits', 0));
        setWithdrawals(getInitialState('withdrawals', 0));
        setTransactionHistory(getInitialState('transactionHistory', []));
        setInterestCounter(getInitialState('interestCounter', { isRunning: false, startTime: null }));
        setTasksCompletedToday(getInitialState('tasksCompletedToday', 0));
        setCompletedTasks(getInitialState('completedTasks', []));
        setWithdrawalAddresses(getInitialState('withdrawalAddresses', []));
        setActiveBoosters(getInitialState('activeBoosters', []));
        setPurchasedBoosterIds(getInitialState('purchasedBoosterIds', []));
        setPurchasedReferralsCount(getInitialState('purchased_referrals', 0));
        setHasClaimedSignUpBonus(getInitialState('hasClaimedSignUpBonus', false));
        setClaimedReferralIds(getInitialState('claimedReferralIds', []));

        // Reset daily task count
        const now = new Date();
        const IST_OFFSET = 5.5 * 60 * 60 * 1000;
        const nowIST = new Date(now.getTime() + IST_OFFSET);
        const resetHourIST = 9;
        const resetMinuteIST = 30;
        let lastReset = new Date(nowIST);
        lastReset.setUTCHours(resetHourIST, resetMinuteIST, 0, 0);

        if (nowIST < lastReset) {
            lastReset.setUTCDate(lastReset.getUTCDate() - 1);
        }
        const lastCompletionTime = getInitialState('lastCompletionTime', 0);
        if (!lastCompletionTime || lastCompletionTime < lastReset.getTime()) {
             setTasksCompletedToday(0);
             setPersistentState('tasksCompletedToday', 0);
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

      setDailyRewardState({ isEnabled, canClaim, streak: newStreak, reward });
      if (newStreak !== streak) {
        setPersistentState('daily_claim_streak', newStreak);
      }
    } else {
        setMainBalance(0);
        setTaskRewardsBalance(0);
        setInterestEarningsBalance(0);
        setDeposits(0);
        setWithdrawals(0);
        setTransactionHistory([]);
        setInterestCounter({ isRunning: false, startTime: null });
        setTasksCompletedToday(0);
        setCompletedTasks([]);
        setWithdrawalAddresses([]);
        setMonthlyWithdrawalsCount(0);
        setLastWithdrawalMonth(-1);
        setActiveBoosters([]);
        setPurchasedBoosterIds([]);
        setPurchasedReferralsCount(0);
        setHasClaimedSignUpBonus(false);
        setClaimedReferralIds([]);
        setDailyRewardState({ isEnabled: false, canClaim: false, streak: 0, reward: 0 });
    }
    setIsLoading(false);
    setIsReady(true);
  }, [currentUser?.email, getInitialState, setPersistentState]);

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
    
    // Eligibility is now based on active account status
    return currentUser.isAccountActive;
  }, [currentUser]);


  const signupBonusAmount = useMemo(() => {
    if (!currentUser || !isEligibleForSignUpBonus) return 0;
    
    // We base the bonus on the minimum amount required for the user's current level,
    // assuming activation implies meeting this threshold.
    const minAmount = minRequiredBalanceForLevel(currentLevel);
    if (minAmount === 0) return 0;

    const applicableTiers = signupBonuses
      .filter(tier => minAmount >= tier.minDeposit)
      .sort((a, b) => b.bonusAmount - a.bonusAmount);

    return applicableTiers.length > 0 ? applicableTiers[0].bonusAmount : 0;
  }, [currentUser, isEligibleForSignUpBonus, signupBonuses, currentLevel, minRequiredBalanceForLevel]);


  useEffect(() => { if (!isLoading) setPersistentState('mainBalance', mainBalance)}, [mainBalance, isLoading, setPersistentState]);
  useEffect(() => { if (!isLoading) setPersistentState('taskRewardsBalance', taskRewardsBalance)}, [taskRewardsBalance, isLoading, setPersistentState]);
  useEffect(() => { if (!isLoading) setPersistentState('interestEarningsBalance', interestEarningsBalance)}, [interestEarningsBalance, isLoading, setPersistentState]);
  useEffect(() => { if (!isLoading) setPersistentState('deposits', deposits)}, [deposits, isLoading, setPersistentState]);
  useEffect(() => { if (!isLoading) setPersistentState('withdrawals', withdrawals)}, [withdrawals, isLoading, setPersistentState]);
  useEffect(() => { if (!isLoading) setPersistentState('transactionHistory', transactionHistory)}, [transactionHistory, isLoading, setPersistentState]);
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

 const addTransaction = useCallback((userEmail: string, transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
        ...transaction,
        id: `TXN-${Date.now()}-${Math.random()}`,
    };
     const key = `${userEmail}_transactionHistory`;
     const currentHistory = JSON.parse(localStorage.getItem(key) || '[]');
     localStorage.setItem(key, JSON.stringify([newTransaction, ...currentHistory]));

     if (currentUser?.email === userEmail) {
        setTransactionHistory(prev => [newTransaction, ...prev]);
     }
 }, [currentUser]);

  const handleMoveFunds = (destination: 'Task Rewards' | 'Interest Earnings' | 'Main Wallet', amountToMove: number, fromAccount?: 'Task Rewards' | 'Interest Earnings') => {
    if (!currentUser) return;

    const numericAmount = fromAccount ? amountToMove : parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({ variant: 'destructive', title: 'Invalid Amount', description: 'Please enter a valid positive number to move.' });
      return;
    }

    let description = '';
    let tempMainBalance = mainBalance;
    let tempTaskBalance = taskRewardsBalance;
    let tempInterestBalance = interestEarningsBalance;
    let originalCommittedBalance = taskRewardsBalance + interestEarningsBalance;

    if (!fromAccount) { // Moving from Main Wallet
      if (numericAmount > mainBalance) {
        toast({ variant: "destructive", title: "Insufficient Funds", description: `You cannot move more than your main balance of $${mainBalance.toFixed(2)}.` });
        return;
      }
      tempMainBalance -= numericAmount;
      if (destination === 'Task Rewards') tempTaskBalance += numericAmount;
      if (destination === 'Interest Earnings') tempInterestBalance += numericAmount;
      description = `Moved $${numericAmount.toFixed(2)} to ${destination}`;
    } else { // Moving between earning wallets or back to main
        if (fromAccount === 'Task Rewards') {
            if (numericAmount > taskRewardsBalance) { toast({ variant: "destructive", title: "Insufficient Funds", description: `You cannot move more than the available balance of $${taskRewardsBalance.toFixed(2)}.` }); return; }
            tempTaskBalance -= numericAmount;
        } else {
            if (numericAmount > interestEarningsBalance) { toast({ variant: "destructive", title: "Insufficient Funds", description: `You cannot move more than the available balance of $${interestEarningsBalance.toFixed(2)}.` }); return; }
            tempInterestBalance -= numericAmount;
        }

        if (destination === 'Main Wallet') tempMainBalance += numericAmount;
        if (destination === 'Interest Earnings') tempInterestBalance += numericAmount;
        if (destination === 'Task Rewards') tempTaskBalance += numericAmount;
        description = `Moved $${numericAmount.toFixed(2)} from ${fromAccount} to ${destination}`;
    }

    setMainBalance(tempMainBalance);
    setTaskRewardsBalance(tempTaskBalance);
    setInterestEarningsBalance(tempInterestBalance);

    const newCommittedBalance = tempTaskBalance + tempInterestBalance;
    
    // Check for Activation
    const minBalanceForL1 = minRequiredBalanceForLevel(1);
    if (originalCommittedBalance < minBalanceForL1 && newCommittedBalance >= minBalanceForL1) {
      activateUserAccount(currentUser.email);
    }
    
    // Check for Deactivation
    const minBalanceForCurrentLevel = minRequiredBalanceForLevel(currentLevel);
    if (newCommittedBalance < minBalanceForCurrentLevel && currentUser.status === 'active') {
        updateUserStatus(currentUser.email, 'inactive');
    }

    addTransaction(currentUser.email, {
        type: 'Fund Movement',
        description: description,
        amount: 0,
        date: new Date().toISOString()
    })
    toast({ title: "Funds Moved", description: `${numericAmount.toFixed(2)} USDT transfer complete.` });
    setAmount("");
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

      addTransaction(userEmail, {
          type: 'Recharge',
          description: 'Recharge approved by admin',
          amount: rechargeAmount,
          date: new Date().toISOString()
      });
  };

  const addCommissionToMainBalance = useCallback((commissionAmount: number) => {
    if (!currentUser) return;
    setMainBalance(prev => prev + commissionAmount);
    addTransaction(currentUser.email, {
        type: 'Team Commission',
        description: 'Daily commission from team earnings',
        amount: commissionAmount,
        date: new Date().toISOString()
    });
    toast({ title: "Commission Received!", description: `Your daily team commission of $${commissionAmount.toFixed(2)} has been added to your main wallet.` });
  }, [toast, addTransaction, currentUser]);

  const requestWithdrawal = (withdrawalAmount: number, withdrawalAddress: string) => { 
    if (!currentUser) return;
    setMainBalance(prev => prev - withdrawalAmount); 
    // This function doesn't need to create the request itself anymore,
    // as RequestContext's `addRequest` handles it.
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

    addTransaction(userEmail, {
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

    addTransaction(userEmail, {
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

     addTransaction(userEmail, {
        type: 'Referral Bonus',
        description: `Referral bonus for ${referredUser} approved`,
        amount: amount,
        date: new Date().toISOString()
    });

    if (currentUser?.email === userEmail) {
        setMainBalance(prev => prev + amount);
        setClaimedReferralIds(prev => [...prev, referredUser]);
    }
  };
  
  const approveSalary = (userEmail: string, amount: number) => {
    const key = `${userEmail}_mainBalance`;
    const currentBalance = parseFloat(localStorage.getItem(key) || '0');
    localStorage.setItem(key, (currentBalance + amount).toString());

    addTransaction(userEmail, {
        type: 'Salary Claim',
        description: 'Salary claim approved by admin',
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

     addTransaction(userEmail, {
        type: 'Withdrawal',
        description: 'Withdrawal declined, funds refunded',
        amount: withdrawalAmount,
        date: new Date().toISOString()
    });

    if(currentUser?.email === userEmail) {
        setMainBalance(prev => prev + withdrawalAmount);
        toast({ variant: "default", title: "Withdrawal Refunded", description: `Your withdrawal request was declined. ${withdrawalAmount.toFixed(2)} USDT has been returned to your main balance.` });
    }
  }
  
  const startCounter = (type: CounterType) => {
      const now = Date.now();
      if (type === 'interest') {
          const minBalanceForLevel1 = configuredLevels.find(l => l.level === 1)?.minAmount ?? 100;
           if (interestEarningsBalance < minBalanceForLevel1) {
                toast({ variant: "destructive", title: "Insufficient Funds", description: `A minimum of $${minBalanceForLevel1} is required in the interest wallet.` });
                return;
           }
          setInterestCounter({ isRunning: true, startTime: now });
          toast({ title: "Daily Interest Started", description: "Your 24-hour earning cycle has begun." });
      }
  };
  
  const isFundMovementLocked = (type: 'task' | 'interest') => {
      if (type === 'interest') {
        return interestCounter.isRunning;
      }
      if (type === 'task') {
        // A user can always move funds to the task wallet, even if tasks are in progress.
        return false;
      }
      return false;
  }

  const claimAndRestartCounter = (type: CounterType) => {
      if(!currentUser) return;
      const dailyRate = currentRate / 100;
      if (type === 'interest') {
          const earnings = interestEarningsBalance * dailyRate;
          setInterestEarningsBalance(prev => prev + earnings);
          addTransaction(currentUser.email, {
            type: 'Interest Claim',
            description: `Claimed daily interest`,
            amount: earnings,
            date: new Date().toISOString()
          });
          setInterestCounter({ isRunning: false, startTime: null }); 
          toast({ title: "Daily Interest Claimed!", description: `You earned ${earnings.toFixed(4)} USDT. You can now move funds and restart the timer when ready.`});
      }
  };

  const completeTask = (task: GenerateTaskSuggestionOutput) => {
      if (!currentUser) return;
      if (tasksCompletedToday >= dailyTaskQuota) {
          toast({ variant: "destructive", title: "Daily Limit Reached", description: "You have already completed all your tasks for today." });
          return;
      }
      
      const taskEarningBoost = activeBoosters.find(b => b.type === 'TASK_EARNING')?.value || 0;
      const baseEarning = earningPerTask || 0;
      const finalEarning = baseEarning + (baseEarning * (taskEarningBoost / 100));

      if (finalEarning > 0) {
        setTaskRewardsBalance(prev => prev + finalEarning);
      }
      
      const newCompletedTask: CompletedTask = { id: `TASK-${Date.now()}`, title: task.taskTitle, description: task.taskDescription, earnings: finalEarning, completedAt: new Date().toISOString() };
      setCompletedTasks(prev => [newCompletedTask, ...prev]);
      
      const newTasksCompleted = tasksCompletedToday + 1;
      setTasksCompletedToday(newTasksCompleted);
      setPersistentState('lastCompletionTime', new Date().getTime());

      // Upline Commission Logic
      const uplineSettings = getGlobalSetting('upline_commission_settings', { enabled: false, rate: 0, requiredReferrals: 0 }, true);
      
      if (uplineSettings.enabled && currentUser.referredBy) {
          const upline = users.find(u => u.referralCode === currentUser.referredBy);
          if (upline && upline.status === 'active') {
              const uplineL1Count = users.filter(u => u.referredBy === upline.referralCode && u.status === 'active').length;
              if (uplineL1Count >= uplineSettings.requiredReferrals) {
                  const commissionAmount = finalEarning * (uplineSettings.rate / 100);
                  if (commissionAmount > 0) {
                      const uplineBalanceKey = `${upline.email}_mainBalance`;
                      const currentUplineBalance = parseFloat(localStorage.getItem(uplineBalanceKey) || '0');
                      localStorage.setItem(uplineBalanceKey, (currentUplineBalance + commissionAmount).toString());
                      addTransaction(upline.email, {
                          type: 'Upline Commission',
                          description: `Commission from downline: ${currentUser.email}`,
                          amount: commissionAmount,
                          date: new Date().toISOString()
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
    if (mainBalance < booster.price) {
        toast({ variant: 'destructive', title: 'Insufficient Funds', description: 'You do not have enough funds in your main wallet to purchase this booster.'});
        return false;
    }
    
    if (purchasedBoosterIds.includes(booster.id)) {
        toast({ variant: 'destructive', title: 'Booster Already Purchased', description: 'You have already purchased this booster. Wait for it to expire if it is temporary.'});
        return false;
    }

    setMainBalance(prev => prev - booster.price);
    
    if (booster.type === 'PURCHASE_REFERRAL') {
        const referralCount = booster.value;
        const newReferralCount = purchasedReferralsCount + referralCount;
        setPurchasedReferralsCount(newReferralCount);
        setPurchasedBoosterIds(prev => [...prev, booster.id]);
        addTransaction(currentUser.email, {
            type: 'Booster Purchase',
            description: `Purchased ${referralCount} referrals`,
            amount: -booster.price,
            date: new Date().toISOString()
        });
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
        addTransaction(currentUser.email, {
            type: 'Booster Purchase',
            description: `Purchased ${booster.name} booster`,
            amount: -booster.price,
            date: new Date().toISOString()
        });
        toast({ title: 'Booster Purchased!', description: `The "${booster.name}" booster is now active!`});
    }
    
    return true;
  };
  
  const claimSignUpBonus = () => {
    if (!currentUser || hasClaimedSignUpBonus || !isEligibleForSignUpBonus || hasPendingSignUpBonus) return;

    const bonus = signupBonusAmount;
    if (bonus <= 0) return;

    if (isSignupApprovalRequired) {
        // This is handled by RequestContext now.
    } else {
        setMainBalance(prev => prev + bonus);
        addTransaction(currentUser.email, {
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

    // Use the referral's level to determine the minimum deposit amount for bonus calculation
    const referralLevel = users.find(u => u.email === referralEmail)?.overrideLevel ?? defaultLevels.find(l => l.level === getInitialState('level', 0))?.level ?? 0;
    const minAmountForBonus = minRequiredBalanceForLevel(referralLevel);

    const applicableTiers = referralBonuses
        .filter(tier => minAmountForBonus >= tier.minDeposit)
        .sort((a, b) => b.bonusAmount - a.bonusAmount);

    return applicableTiers.length > 0 ? applicableTiers[0].bonusAmount : 0;
  }, [referralBonuses, users, minRequiredBalanceForLevel, getInitialState]);
  
  const claimReferralBonus = (referralEmail: string) => {
    if (!currentUser || claimedReferralIds.includes(referralEmail) || userRequests.some(req => req.type === 'Referral Bonus' && req.address === referralEmail && req.status === 'Pending')) return;

    const referral = users.find(u => u.email === referralEmail);
    if (!referral || !referral.isAccountActive) return;
    
    const bonusAmount = referralBonusFor(referralEmail);
    if (bonusAmount <= 0) return;

    if(isReferralApprovalRequired) {
        // Handled by RequestContext
    } else {
        setMainBalance(prev => prev + bonusAmount);
        addTransaction(currentUser.email, {
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
    if (!currentUser || currentUser.status !== 'active' || !dailyRewardState?.canClaim || !dailyRewardState.isEnabled) return;
    
    const rewardAmount = dailyRewardState.reward;
    setMainBalance(prev => prev + rewardAmount);
    addTransaction(currentUser.email, {
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

  return (
    <WalletContext.Provider
      value={{
        mainBalance,
        taskRewardsBalance,
        interestEarningsBalance,
        committedBalance,
        currentLevel,
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
        amount,
        setAmount,
        handleMoveFunds,
        approveRecharge,
        addCommissionToMainBalance,
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
        addTransaction,
        transactionHistory,
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
