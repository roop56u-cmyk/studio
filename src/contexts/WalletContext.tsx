

"use client";

import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from './AuthContext';
import { GenerateTaskSuggestionOutput } from '@/app/actions';
import { levels as defaultLevels, Level } from '@/components/dashboard/level-tiers';
import { platformMessages } from '@/lib/platform-messages';


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
  addRecharge: (amount: number) => void;
  addCommissionToMainBalance: (commissionAmount: number) => void;
  getWalletData: () => {
    balance: number;
    level: number;
    deposits: number;
    withdrawals: number;
  };
  requestWithdrawal: (amount: number) => void;
  approveRecharge: (userEmail: string, amount: number) => void;
  refundWithdrawal: (userEmail: string, amount: number) => void;
  approveWithdrawal: (userEmail: string) => void;
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
  const { currentUser, users, checkAndDeactivateUser, updateUserStatus } = useAuth();
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Global system settings
  const [isWithdrawalRestrictionEnabled, setIsWithdrawalRestrictionEnabled] = useState(true);
  const [withdrawalRestrictionDays, setWithdrawalRestrictionDays] = useState(45);
  const [configuredLevels, setConfiguredLevels] = useState<Level[]>(defaultLevels);
  const [earningModel, setEarningModel] = useState("dynamic");
  const [multipleAddressesEnabled, setMultipleAddressesEnabled] = useState(true);


  const getInitialState = useCallback((key: string, defaultValue: any) => {
    if (typeof window === 'undefined' || !currentUser) {
      return defaultValue;
    }
    try {
      const storedValue = localStorage.getItem(`${currentUser.email}_${key}`);
      if (storedValue) {
        return JSON.parse(storedValue);
      }
    } catch (error) {
      console.error(`Failed to parse ${key} from localStorage`, error);
    }
    return defaultValue;
  }, [currentUser]);
  
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

  const [mainBalance, setMainBalance] = useState(() => getInitialState('mainBalance', 0));
  const [taskRewardsBalance, setTaskRewardsBalance] = useState(() => getInitialState('taskRewardsBalance', 0));
  const [interestEarningsBalance, setInterestEarningsBalance] = useState(() => getInitialState('interestEarningsBalance', 0));
  const [deposits, setDeposits] = useState(() => getInitialState('deposits', 0));
  const [withdrawals, setWithdrawals] = useState(() => getInitialState('withdrawals', 0));
  const [transactionHistory, setTransactionHistory] = useState<Transaction[]>(() => getInitialState('transactionHistory', []));
  
  const [interestCounter, setInterestCounter] = useState<CounterState>(() => getInitialState('interestCounter', { isRunning: false, startTime: null }));

  const [tasksCompletedToday, setTasksCompletedToday] = useState(() => getInitialState('tasksCompletedToday', 0));
  const [lastTaskCompletionDate, setLastTaskCompletionDate] = useState(() => getInitialState('lastTaskCompletionDate', ''));
  const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>(() => getInitialState('completedTasks', []));
  const [withdrawalAddresses, setWithdrawalAddresses] = useState<WithdrawalAddress[]>(() => getInitialState('withdrawalAddresses', []));
  const [monthlyWithdrawalsCount, setMonthlyWithdrawalsCount] = useState(() => getInitialState('monthlyWithdrawalsCount', 0));
  const [lastWithdrawalMonth, setLastWithdrawalMonth] = useState(() => getInitialState('lastWithdrawalMonth', -1));
  const [activeBoosters, setActiveBoosters] = useState<ActiveBooster[]>(() => getInitialState('activeBoosters', []));
  const [purchasedBoosterIds, setPurchasedBoosterIds] = useState<string[]>(() => getInitialState('purchasedBoosterIds', []));
  const [purchasedReferralsCount, setPurchasedReferralsCount] = useState<number>(() => getInitialState('purchased_referrals', 0));
  
  const taskQuotaBoost = activeBoosters.find(b => b.type === 'TASK_QUOTA')?.value || 0;
  const interestRateBoost = activeBoosters.find(b => b.type === 'INTEREST_RATE')?.value || 0;

  const committedBalance = taskRewardsBalance + interestEarningsBalance;
  
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
    
    // Iterate from highest to lowest to find the best qualifying level
    configuredLevels.slice().reverse().forEach(level => {
        if (level.level === 0) return;

        const balanceMet = committedBalance >= level.minAmount;
        const referralsMet = directReferralsCount >= level.referrals;
        const isUnlocked = balanceMet && referralsMet;

        if (isUnlocked && finalLevel === 0) {
            finalLevel = level.level;
        }
    });

    // Now, build the progress object for UI display
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


  const currentLevelData = configuredLevels.find(level => level.level === currentLevel) ?? configuredLevels[0];
  const { rate: baseRate, dailyTasks: baseDailyTaskQuota, monthlyWithdrawals: monthlyWithdrawalLimit, minWithdrawal: minWithdrawalAmount, maxWithdrawal: maxWithdrawalAmount, withdrawalFee } = currentLevelData;

  const currentRate = baseRate + (baseRate * (interestRateBoost / 100));
  const dailyTaskQuota = baseDailyTaskQuota + taskQuotaBoost;
  
  const earningPerTask = useMemo(() => {
    if (earningModel === 'fixed') {
        return currentLevelData.earningPerTask;
    }
    if (dailyTaskQuota === 0) return 0;
    const dailyEarningPotential = committedBalance * (currentRate / 100);
    return dailyEarningPotential / dailyTaskQuota;
  }, [committedBalance, currentRate, dailyTaskQuota, earningModel, currentLevelData]);


  const setPersistentState = useCallback((key: string, value: any) => {
     if (typeof window !== 'undefined' && currentUser) {
        try {
            localStorage.setItem(`${currentUser.email}_${key}`, JSON.stringify(value));
        } catch (error) {
            console.error(`Failed to save ${key} to localStorage`, error);
        }
     }
  }, [currentUser]);

  useEffect(() => {
    const checkBoosters = () => {
      const now = Date.now();
      const unexpiredBoosters = activeBoosters.filter(b => b.expiresAt > now);
      if (unexpiredBoosters.length !== activeBoosters.length) {
        setActiveBoosters(unexpiredBoosters);
      }
    };
    
    checkBoosters();
    const intervalId = setInterval(checkBoosters, 60000); 
    return () => clearInterval(intervalId);
  }, [activeBoosters]);

  useEffect(() => {
    if (currentUser) {
      const updatedPurchasedReferrals = getInitialState('purchased_referrals', 0);
      if (updatedPurchasedReferrals !== purchasedReferralsCount) {
        setPurchasedReferralsCount(updatedPurchasedReferrals);
      }
    }
  }, [users, currentUser, getInitialState]);


  useEffect(() => {
    setIsLoading(true);
    setIsWithdrawalRestrictionEnabled(getGlobalSetting('system_withdrawal_restriction_enabled', true, true));
    setWithdrawalRestrictionDays(parseInt(getGlobalSetting('system_withdrawal_restriction_days', '45'), 10));
    setConfiguredLevels(getGlobalSetting('platform_levels', defaultLevels, true));
    setEarningModel(getGlobalSetting('system_earning_model', 'dynamic'));
    setMultipleAddressesEnabled(getGlobalSetting('system_multiple_addresses_enabled', true, true));


    if (currentUser) {
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
        if (lastCompletionTime < lastReset.getTime()) {
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

      setMainBalance(getInitialState('mainBalance', 0));
      setTaskRewardsBalance(getInitialState('taskRewardsBalance', 0));
      setInterestEarningsBalance(getInitialState('interestEarningsBalance', 0));
      setDeposits(getInitialState('deposits', 0));
      setWithdrawals(getInitialState('withdrawals', 0));
      setTransactionHistory(getInitialState('transactionHistory', []));
      setInterestCounter(getInitialState('interestCounter', { isRunning: false, startTime: null }));
      setCompletedTasks(getInitialState('completedTasks', []));
      setWithdrawalAddresses(getInitialState('withdrawalAddresses', []));
      setActiveBoosters(getInitialState('activeBoosters', []));
      setPurchasedBoosterIds(getInitialState('purchasedBoosterIds', []));
      setPurchasedReferralsCount(getInitialState('purchased_referrals', 0));
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
    }
    setIsLoading(false);
  }, [currentUser, setPersistentState, getInitialState]);


  useEffect(() => setPersistentState('mainBalance', mainBalance), [mainBalance, setPersistentState]);
  useEffect(() => setPersistentState('taskRewardsBalance', taskRewardsBalance), [taskRewardsBalance, setPersistentState]);
  useEffect(() => setPersistentState('interestEarningsBalance', interestEarningsBalance), [interestEarningsBalance, setPersistentState]);
  useEffect(() => setPersistentState('deposits', deposits), [deposits, setPersistentState]);
  useEffect(() => setPersistentState('withdrawals', withdrawals), [withdrawals, setPersistentState]);
  useEffect(() => setPersistentState('transactionHistory', transactionHistory), [transactionHistory, setPersistentState]);
  useEffect(() => setPersistentState('interestCounter', interestCounter), [interestCounter, setPersistentState]);
  useEffect(() => setPersistentState('tasksCompletedToday', tasksCompletedToday), [tasksCompletedToday, setPersistentState]);
  useEffect(() => setPersistentState('completedTasks', completedTasks), [completedTasks, setPersistentState]);
  useEffect(() => setPersistentState('withdrawalAddresses', withdrawalAddresses), [withdrawalAddresses, setPersistentState]);
  useEffect(() => setPersistentState('monthlyWithdrawalsCount', monthlyWithdrawalsCount), [monthlyWithdrawalsCount, setPersistentState]);
  useEffect(() => setPersistentState('lastWithdrawalMonth', lastWithdrawalMonth), [lastWithdrawalMonth, setPersistentState]);
  useEffect(() => setPersistentState('activeBoosters', activeBoosters), [activeBoosters, setPersistentState]);
  useEffect(() => setPersistentState('purchasedBoosterIds', purchasedBoosterIds), [purchasedBoosterIds, setPersistentState]);
  useEffect(() => setPersistentState('purchased_referrals', purchasedReferralsCount), [purchasedReferralsCount, setPersistentState]);

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

 const handleSignUpBonus = useCallback((userEmail: string) => {
    const bonusIsEnabled = getGlobalSetting('system_referral_bonus_enabled', true, true);
    if (!bonusIsEnabled) return;

    const bonusGivenKey = `${userEmail}_signup_bonus_given`;
    if (localStorage.getItem(bonusGivenKey)) return;

    const signUpBonus = parseInt(getGlobalSetting('system_referral_bonus', '8'), 10);
    
    setTimeout(() => {
        const mainBalanceKey = `${userEmail}_mainBalance`;
        const currentBalance = parseFloat(localStorage.getItem(mainBalanceKey) || '0');
        localStorage.setItem(mainBalanceKey, (currentBalance + signUpBonus).toString());

        if(currentUser?.email === userEmail) {
            setMainBalance(prev => prev + signUpBonus);
        }

        addTransaction(userEmail, {
            type: 'Sign-up Bonus',
            description: 'Bonus for activating your account',
            amount: signUpBonus,
            date: new Date().toISOString(),
        });
        
        localStorage.setItem(bonusGivenKey, 'true');

        if(currentUser?.email === userEmail) {
            toast({
                title: "Sign-up Bonus Received!",
                description: `You've received a $${signUpBonus} bonus for activating your account!`,
            });
        }
    }, 1500); 

  }, [addTransaction, toast, currentUser]);

 const handleMoveFunds = (destination: 'Task Rewards' | 'Interest Earnings' | 'Main Wallet', amountToMove: number, fromAccount?: 'Task Rewards' | 'Interest Earnings') => {
    if(!currentUser) return;
    const numericAmount = fromAccount ? amountToMove : parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({ variant: 'destructive', title: 'Invalid Amount', description: 'Please enter a valid positive number to move.' });
      return;
    }
    
    if ((fromAccount === 'Interest Earnings' || destination === 'Interest Earnings') && isFundMovementLocked('interest')) {
        toast({ variant: 'destructive', title: 'Action Locked', description: 'Cannot move funds to or from Interest Earnings while the timer is running. Please claim your earnings first.' });
        return;
    }
     if ((fromAccount === 'Task Rewards' || destination === 'Task Rewards') && isFundMovementLocked('task')) {
        toast({ variant: 'destructive', title: 'Action Locked', description: 'Cannot move funds to or from Task Rewards while you have incomplete tasks for the day.' });
        return;
    }

    if (fromAccount) {
        let sourceBalance;
        let setSourceBalance;
        if (fromAccount === 'Task Rewards') {
            sourceBalance = taskRewardsBalance;
            setSourceBalance = setTaskRewardsBalance;
        } else {
            sourceBalance = interestEarningsBalance;
            setSourceBalance = setInterestEarningsBalance;
        }
        if (numericAmount > sourceBalance) {
          toast({ variant: "destructive", title: "Insufficient Funds", description: `Cannot move more than available in ${fromAccount}.` });
          return;
        }
        
        const newCommittedBalance = committedBalance - numericAmount;
        const minAmountForCurrentLevel = currentLevelData.minAmount;
        
        if (currentLevel > 0 && newCommittedBalance < minAmountForCurrentLevel) {
            toast({
                variant: "destructive",
                title: "Warning: Earning Level Affected",
                description: `Moving these funds will drop your committed balance below the $${minAmountForCurrentLevel.toLocaleString()} required for Level ${currentLevel}. Your earnings will be affected.`,
                duration: 6000
            });
        }


        setSourceBalance(prev => prev - numericAmount);

        addTransaction(currentUser.email, {
            type: 'Fund Movement (Out)',
            description: `Moved from ${fromAccount}`,
            amount: -numericAmount,
            date: new Date().toISOString()
        });

        if (destination === 'Main Wallet') {
            setMainBalance(prev => prev + numericAmount);
             addTransaction(currentUser.email, {
                type: 'Fund Movement (In)',
                description: `Moved to Main Wallet`,
                amount: numericAmount,
                date: new Date().toISOString()
            });
        } else if (destination === 'Interest Earnings') {
            setInterestEarningsBalance(prev => prev + numericAmount);
             addTransaction(currentUser.email, {
                type: 'Fund Movement (In)',
                description: `Moved to Interest Earnings`,
                amount: numericAmount,
                date: new Date().toISOString()
            });
        } else if (destination === 'Task Rewards') {
            setTaskRewardsBalance(prev => prev + numericAmount);
             addTransaction(currentUser.email, {
                type: 'Fund Movement (In)',
                description: `Moved to Task Rewards`,
                amount: numericAmount,
                date: new Date().toISOString()
            });
        }
        toast({ title: "Funds Moved", description: `${numericAmount.toFixed(2)} USDT has been moved from ${fromAccount} to ${destination}.` });
    } else { // Moving from Main Wallet
        if (numericAmount > mainBalance) {
            toast({ variant: "destructive", title: "Insufficient Funds", description: "You cannot move more than your main balance." });
            return;
        }
        // Perform the state updates immediately
        setMainBalance(prev => prev - numericAmount);
        
        if (destination === "Task Rewards") {
            setTaskRewardsBalance(prev => prev + numericAmount);
        } else if (destination === "Interest Earnings") {
            setInterestEarningsBalance(prev => prev + numericAmount);
        }
        
        // Record the transactions
        addTransaction(currentUser.email, {
            type: 'Fund Movement (Out)',
            description: `Moved from Main Wallet`,
            amount: -numericAmount,
            date: new Date().toISOString()
        });
        addTransaction(currentUser.email, {
            type: 'Fund Movement (In)',
            description: `Moved to ${destination}`,
            amount: numericAmount,
            date: new Date().toISOString()
        });

        toast({ title: "Funds Moved", description: `${numericAmount.toFixed(2)} USDT has been moved from Main Wallet to ${destination}.` });
        setAmount("");

        // Check for activation and bonus *after* the funds have been moved
        if (currentUser.status === 'inactive') {
            const newCommittedBalance = committedBalance + numericAmount;
            const minAmountForLevel1 = configuredLevels.find(l => l.level === 1)?.minAmount || 100;
            
            if (newCommittedBalance >= minAmountForLevel1) {
                updateUserStatus(currentUser.email, 'active');
                handleSignUpBonus(currentUser.email);
            }
        }
    }
  };

  const approveRecharge = (userEmail: string, rechargeAmount: number) => {
    const key = `${userEmail}_mainBalance`;
    const currentBalance = parseFloat(localStorage.getItem(key) || '0');
    localStorage.setItem(key, (currentBalance + rechargeAmount).toString());

    const depositsKey = `${userEmail}_deposits`;
    const depositCount = parseInt(localStorage.getItem(depositsKey) || '0');
    localStorage.setItem(depositsKey, (depositCount + 1).toString());
    
    if (depositCount === 0) { 
        localStorage.setItem(`${userEmail}_firstDepositDate`, new Date().toISOString());
    }

    addTransaction(userEmail, {
        type: 'Recharge',
        description: 'Recharge approved by admin',
        amount: rechargeAmount,
        date: new Date().toISOString()
    });

    if(currentUser?.email === userEmail) {
        setMainBalance(prev => prev + rechargeAmount);
        setDeposits(prev => prev + 1);
        toast({ title: "Recharge Approved", description: `Your balance has been updated by ${rechargeAmount.toFixed(2)} USDT.` });
    }
  };

  const addRecharge = (rechargeAmount: number) => {
    setMainBalance(prev => prev + rechargeAmount);
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

  const requestWithdrawal = (withdrawalAmount: number) => { 
    setMainBalance(prev => prev - withdrawalAmount); 
    addTransaction(currentUser!.email, {
        type: 'Withdrawal',
        description: 'Withdrawal request submitted',
        amount: -withdrawalAmount,
        date: new Date().toISOString()
    });
  }

  const approveWithdrawal = (userEmail: string) => {
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
        description: 'Withdrawal approved by admin',
        amount: 0,
        date: new Date().toISOString()
    });

    checkAndDeactivateUser(userEmail);

    if(currentUser?.email === userEmail) {
      setWithdrawals(prev => prev + 1);
      setMonthlyWithdrawalsCount(prev => prev + 1);
      const currentMonth = new Date().getMonth();
      setLastWithdrawalMonth(currentMonth);
    }
  }

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
  const getWalletData = useCallback(() => { return { balance: mainBalance, level: currentLevel, deposits, withdrawals }; }, [mainBalance, currentLevel, deposits, withdrawals]);

  const startCounter = (type: CounterType) => {
      const now = Date.now();
      if (type === 'interest') {
          setInterestCounter({ isRunning: true, startTime: now });
           toast({ title: "Daily Interest Started", description: "Your 24-hour earning cycle has begun." });
      }
  };
  
  const isFundMovementLocked = (type: 'task' | 'interest') => {
      if (type === 'interest') {
        return interestCounter.isRunning;
      }
      if (type === 'task') {
        return tasksCompletedToday > 0 && tasksCompletedToday < dailyTaskQuota;
      }
      return false;
  }

  const claimAndRestartCounter = (type: CounterType) => {
      if(!currentUser) return;
      const dailyRate = currentRate / 100;
      if (type === 'interest') {
          const earnings = committedBalance * dailyRate;
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
        setPersistentState('purchased_referrals', newReferralCount);
        
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
  
  const getReferralCommissionBoost = () => {
      const boost = activeBoosters.find(b => b.type === 'REFERRAL_COMMISSION');
      return boost ? boost.value : 0;
  }
  
  const minRequiredBalanceForLevel = (level: number) => {
    return configuredLevels.find(l => l.level === level)?.minAmount ?? 0;
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
        addRecharge,
        addCommissionToMainBalance,
        getWalletData,
        requestWithdrawal,
        approveRecharge,
        refundWithdrawal,
        approveWithdrawal,
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
        multipleAddressesEnabled
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

