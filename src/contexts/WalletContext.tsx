

"use client";

import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from './AuthContext';
import { GenerateTaskSuggestionOutput } from '@/app/actions';
import { levels as defaultLevels } from '@/components/dashboard/level-tiers';


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
  monthlyWithdrawalsCount: number;
  tasksCompletedToday: number;
  completedTasks: CompletedTask[];
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
  approveRecharge: (amount: number) => void;
  refundWithdrawal: (amount: number) => void;
  approveWithdrawal: () => void;
  isLoading: boolean;
  interestCounter: CounterState;
  startCounter: (type: 'task' | 'interest') => void;
  claimAndRestartCounter: (type: 'task' | 'interest') => void;
  completeTask: (task: GenerateTaskSuggestionOutput) => void;
  withdrawalAddress: WithdrawalAddress | null;
  setWithdrawalAddress: (address: Omit<WithdrawalAddress, 'id'>) => void;
  clearWithdrawalAddress: () => void;
  isWithdrawalRestrictionEnabled: boolean;
  withdrawalRestrictionDays: number;
  withdrawalRestrictionMessage: string;
  withdrawalRestrictedLevels: number[];
  purchaseBooster: (booster: Booster) => boolean;
  activeBoosters: ActiveBooster[];
  getReferralCommissionBoost: () => number;
}

export type CounterType = 'task' | 'interest';

export interface CounterState {
    isRunning: boolean;
    startTime: number | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const { currentUser, updateUser } = useAuth();
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Global system settings
  const [isWithdrawalRestrictionEnabled, setIsWithdrawalRestrictionEnabled] = useState(true);
  const [withdrawalRestrictionDays, setWithdrawalRestrictionDays] = useState(45);
  const [withdrawalRestrictionMessage, setWithdrawalRestrictionMessage] = useState("Please wait for 45 days to initiate withdrawal request.");
  const [withdrawalRestrictedLevels, setWithdrawalRestrictedLevels] = useState<number[]>([1]);

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
  
  const [interestCounter, setInterestCounter] = useState<CounterState>(() => getInitialState('interestCounter', { isRunning: false, startTime: null }));

  const [tasksCompletedToday, setTasksCompletedToday] = useState(() => getInitialState('tasksCompletedToday', 0));
  const [lastTaskCompletionDate, setLastTaskCompletionDate] = useState(() => getInitialState('lastTaskCompletionDate', ''));
  const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>(() => getInitialState('completedTasks', []));
  const [withdrawalAddress, setWithdrawalAddressState] = useState<WithdrawalAddress | null>(() => getInitialState('withdrawalAddress', null));
  const [monthlyWithdrawalsCount, setMonthlyWithdrawalsCount] = useState(() => getInitialState('monthlyWithdrawalsCount', 0));
  const [lastWithdrawalMonth, setLastWithdrawalMonth] = useState(() => getInitialState('lastWithdrawalMonth', -1));
  const [activeBoosters, setActiveBoosters] = useState<ActiveBooster[]>(() => getInitialState('activeBoosters', []));
  
  const taskQuotaBoost = activeBoosters.find(b => b.type === 'TASK_QUOTA')?.value || 0;
  const interestRateBoost = activeBoosters.find(b => b.type === 'INTEREST_RATE')?.value || 0;

  const committedBalance = taskRewardsBalance + interestEarningsBalance;
  const currentLevelData = defaultLevels.slice().reverse().find(level => committedBalance >= level.minAmount) ?? defaultLevels[0];
  const { level: currentLevel, rate: baseRate, dailyTasks: baseDailyTaskQuota, monthlyWithdrawals: monthlyWithdrawalLimit, minWithdrawal: minWithdrawalAmount, earningPerTask } = currentLevelData;

  const currentRate = baseRate + (baseRate * (interestRateBoost / 100));
  const dailyTaskQuota = baseDailyTaskQuota + taskQuotaBoost;


  const setPersistentState = useCallback((key: string, value: any) => {
     if (typeof window !== 'undefined' && currentUser) {
        try {
            localStorage.setItem(`${currentUser.email}_${key}`, JSON.stringify(value));
        } catch (error) {
            console.error(`Failed to save ${key} to localStorage`, error);
        }
     }
  }, [currentUser]);

  // Effect to clean up expired boosters
  useEffect(() => {
    const now = Date.now();
    const unexpiredBoosters = activeBoosters.filter(b => b.expiresAt > now);
    if (unexpiredBoosters.length !== activeBoosters.length) {
        setActiveBoosters(unexpiredBoosters);
    }
  }, []); // Runs once on mount

  useEffect(() => {
    setIsLoading(true);
    // Load global settings
    setIsWithdrawalRestrictionEnabled(getGlobalSetting('system_withdrawal_restriction_enabled', true, true));
    setWithdrawalRestrictionDays(parseInt(getGlobalSetting('system_withdrawal_restriction_days', '45'), 10));
    setWithdrawalRestrictionMessage(getGlobalSetting('system_withdrawal_restriction_message', "Please wait for 45 days to initiate withdrawal request."));
    setWithdrawalRestrictedLevels(getGlobalSetting('system_withdrawal_restricted_levels', [1], true));

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
      setInterestCounter(getInitialState('interestCounter', { isRunning: false, startTime: null }));
      setCompletedTasks(getInitialState('completedTasks', []));
      setWithdrawalAddressState(getInitialState('withdrawalAddress', null));
      setActiveBoosters(getInitialState('activeBoosters', []));
    } else {
        setMainBalance(0);
        setTaskRewardsBalance(0);
        setInterestEarningsBalance(0);
        setDeposits(0);
        setWithdrawals(0);
        setInterestCounter({ isRunning: false, startTime: null });
        setTasksCompletedToday(0);
        setCompletedTasks([]);
        setWithdrawalAddressState(null);
        setMonthlyWithdrawalsCount(0);
        setLastWithdrawalMonth(-1);
        setActiveBoosters([]);
    }
    setIsLoading(false);
  }, [currentUser, setPersistentState, getInitialState]);


  useEffect(() => setPersistentState('mainBalance', mainBalance), [mainBalance, setPersistentState]);
  useEffect(() => setPersistentState('taskRewardsBalance', taskRewardsBalance), [taskRewardsBalance, setPersistentState]);
  useEffect(() => setPersistentState('interestEarningsBalance', interestEarningsBalance), [interestEarningsBalance, setPersistentState]);
  useEffect(() => setPersistentState('deposits', deposits), [deposits, setPersistentState]);
  useEffect(() => setPersistentState('withdrawals', withdrawals), [withdrawals, setPersistentState]);
  useEffect(() => setPersistentState('interestCounter', interestCounter), [interestCounter, setPersistentState]);
  useEffect(() => setPersistentState('tasksCompletedToday', tasksCompletedToday), [tasksCompletedToday, setPersistentState]);
  useEffect(() => setPersistentState('completedTasks', completedTasks), [completedTasks, setPersistentState]);
  useEffect(() => setPersistentState('withdrawalAddress', withdrawalAddress), [withdrawalAddress, setPersistentState]);
  useEffect(() => setPersistentState('monthlyWithdrawalsCount', monthlyWithdrawalsCount), [monthlyWithdrawalsCount, setPersistentState]);
  useEffect(() => setPersistentState('lastWithdrawalMonth', lastWithdrawalMonth), [lastWithdrawalMonth, setPersistentState]);
  useEffect(() => setPersistentState('activeBoosters', activeBoosters), [activeBoosters, setPersistentState]);


 const handleMoveFunds = (destination: 'Task Rewards' | 'Interest Earnings' | 'Main Wallet', amountToMove: number, fromAccount?: 'Task Rewards' | 'Interest Earnings') => {
    const numericAmount = fromAccount ? amountToMove : parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({ variant: 'destructive', title: 'Invalid Amount', description: 'Please enter a valid positive number to move.' });
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
        setSourceBalance(prev => prev - numericAmount);
        if (destination === 'Main Wallet') {
            setMainBalance(prev => prev + numericAmount);
        } else if (destination === 'Interest Earnings') {
            setInterestEarningsBalance(prev => prev + numericAmount);
        } else if (destination === 'Task Rewards') {
            setTaskRewardsBalance(prev => prev + numericAmount);
        }
        toast({ title: "Funds Moved", description: `${numericAmount.toFixed(2)} USDT has been moved from ${fromAccount} to ${destination}.` });
    } else {
        if (numericAmount > mainBalance) {
            toast({ variant: "destructive", title: "Insufficient Funds", description: "You cannot move more than your main balance." });
            return;
        }
        setMainBalance(prev => prev - numericAmount);
        if (destination === "Task Rewards") {
            setTaskRewardsBalance(prev => prev + numericAmount);
        } else if (destination === "Interest Earnings") {
            setInterestEarningsBalance(prev => prev + numericAmount);
        }
        toast({ title: "Funds Moved", description: `${numericAmount.toFixed(2)} USDT has been moved from Main Wallet to ${destination}.` });
        setAmount("");
    }
  };

  const approveRecharge = (rechargeAmount: number) => {
    setMainBalance(prev => prev + rechargeAmount);
    setDeposits(prev => {
        const newDeposits = prev + 1;
        const firstDepositDateKey = `${currentUser?.email}_firstDepositDate`;
        if (newDeposits === 1 && !localStorage.getItem(firstDepositDateKey)) {
             localStorage.setItem(firstDepositDateKey, new Date().toISOString());
        }
        return newDeposits;
    });
     toast({ title: "Recharge Approved", description: `Your balance has been updated by ${rechargeAmount.toFixed(2)} USDT.` });
  };
  const addRecharge = (rechargeAmount: number) => {
    setMainBalance(prev => prev + rechargeAmount);
  };
  const addCommissionToMainBalance = useCallback((commissionAmount: number) => {
    setMainBalance(prev => prev + commissionAmount);
    toast({ title: "Commission Received!", description: `Your daily team commission of $${commissionAmount.toFixed(2)} has been added to your main wallet.` });
  }, [toast]);
  const requestWithdrawal = (withdrawalAmount: number) => { setMainBalance(prev => prev - withdrawalAmount); }
  const approveWithdrawal = () => {
    setWithdrawals(prev => prev + 1);
    setMonthlyWithdrawalsCount(prev => prev + 1);
    const currentMonth = new Date().getMonth();
    setLastWithdrawalMonth(currentMonth);
  }
  const refundWithdrawal = (withdrawalAmount: number) => {
    setMainBalance(prev => prev + withdrawalAmount);
    toast({ variant: "default", title: "Withdrawal Refunded", description: `Your withdrawal request was declined. ${withdrawalAmount.toFixed(2)} USDT has been returned to your main balance.` });
  }
  const getWalletData = useCallback(() => { return { balance: mainBalance, level: currentLevel, deposits, withdrawals }; }, [mainBalance, currentLevel, deposits, withdrawals]);

  const startCounter = (type: CounterType) => {
      const now = Date.now();
      if (type === 'interest') {
          setInterestCounter({ isRunning: true, startTime: now });
           toast({ title: "Daily Interest Started", description: "Your 24-hour earning cycle has begun." });
      }
  };

  const claimAndRestartCounter = (type: CounterType) => {
      const dailyRate = currentRate / 100 / 365;
      if (type === 'interest') {
          const earnings = interestEarningsBalance * dailyRate;
          setInterestEarningsBalance(prev => prev + earnings);
          setInterestCounter({ isRunning: true, startTime: Date.now() });
          toast({ title: "Daily Interest Claimed!", description: `You earned ${earnings.toFixed(4)} USDT. A new cycle has started.`});
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

  const setWithdrawalAddress = (address: Omit<WithdrawalAddress, 'id'>) => {
    const newAddress = { ...address, id: `ADDR-${Date.now()}` };
    setWithdrawalAddressState(newAddress);
    toast({ title: "Address Saved", description: `Withdrawal address "${address.name}" has been set.` });
  };

  const clearWithdrawalAddress = () => {
    setWithdrawalAddressState(null);
    toast({ title: "Address Removed", description: "Your withdrawal address has been removed." });
  };

  const purchaseBooster = (booster: Booster): boolean => {
    if (!currentUser) return false;
    if (mainBalance < booster.price) {
        toast({ variant: 'destructive', title: 'Insufficient Funds', description: 'You do not have enough funds in your main wallet to purchase this booster.'});
        return false;
    }

    setMainBalance(prev => prev - booster.price);
    
    if (booster.type === 'PURCHASE_REFERRAL') {
        const referralCount = booster.value;
        const referralsKey = `${currentUser.email}_purchased_referrals`;
        const currentReferrals = getInitialState('purchased_referrals', 0);
        setPersistentState('purchased_referrals', currentReferrals + referralCount);
        toast({ title: 'Referrals Purchased!', description: `You have successfully purchased ${referralCount} referrals.`});
    } else {
        const newActiveBooster: ActiveBooster = {
            boosterId: booster.id,
            type: booster.type,
            value: booster.value,
            expiresAt: Date.now() + booster.duration * 60 * 60 * 1000,
        };
        setActiveBoosters(prev => [...prev, newActiveBooster]);
        toast({ title: 'Booster Purchased!', description: `The "${booster.name}" booster is now active!`});
    }
    
    return true;
  };
  
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
        monthlyWithdrawalsCount,
        tasksCompletedToday,
        completedTasks,
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
        withdrawalAddress,
        setWithdrawalAddress,
        clearWithdrawalAddress,
        isWithdrawalRestrictionEnabled,
        withdrawalRestrictionDays,
        withdrawalRestrictionMessage,
        withdrawalRestrictedLevels,
        purchaseBooster,
        activeBoosters,
        getReferralCommissionBoost,
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
