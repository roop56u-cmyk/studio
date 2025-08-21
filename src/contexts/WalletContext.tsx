
"use client";

import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from './AuthContext';

const levels = [
  { level: 0, minAmount: 0, rate: 0, referrals: null, dailyTasks: 0 },
  { level: 1, minAmount: 100, rate: 1.8, referrals: null, dailyTasks: 15 },
  { level: 2, minAmount: 500, rate: 2.8, referrals: 8, dailyTasks: 25 },
  { level: 3, minAmount: 2000, rate: 3.8, referrals: 16, dailyTasks: 35 },
  { level: 4, minAmount: 6000, rate: 4.8, referrals: 36, dailyTasks: 45 },
  { level: 5, minAmount: 20000, rate: 5.8, referrals: 55, dailyTasks: 55 },
];


interface WalletContextType {
  mainBalance: number;
  taskRewardsBalance: number;
  interestEarningsBalance: number;
  taskRewardsEarned: number;
  interestEarned: number;
  committedBalance: number;
  currentLevel: number;
  currentRate: number;
  dailyTaskQuota: number;
  tasksCompletedToday: number;
  amount: string;
  setAmount: (amount: string) => void;
  handleMoveFunds: (destination: 'Task Rewards' | 'Interest Earnings') => void;
  addRecharge: (amount: number) => void;
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
  completeTask: () => void;
}

export type CounterType = 'task' | 'interest';

export interface CounterState {
    isRunning: boolean;
    startTime: number | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const getInitialState = (key: string, defaultValue: any) => {
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
  };

  const [mainBalance, setMainBalance] = useState(() => getInitialState('mainBalance', 0));
  const [taskRewardsBalance, setTaskRewardsBalance] = useState(() => getInitialState('taskRewardsBalance', 0));
  const [interestEarningsBalance, setInterestEarningsBalance] = useState(() => getInitialState('interestEarningsBalance', 0));
  const [taskRewardsEarned, setTaskRewardsEarned] = useState(() => getInitialState('taskRewardsEarned', 0));
  const [interestEarned, setInterestEarned] = useState(() => getInitialState('interestEarned', 0));
  const [deposits, setDeposits] = useState(() => getInitialState('deposits', 0));
  const [withdrawals, setWithdrawals] = useState(() => getInitialState('withdrawals', 0));
  
  const [interestCounter, setInterestCounter] = useState<CounterState>(() => getInitialState('interestCounter', { isRunning: false, startTime: null }));

  // New state for task tracking
  const [tasksCompletedToday, setTasksCompletedToday] = useState(() => getInitialState('tasksCompletedToday', 0));
  const [lastTaskCompletionDate, setLastTaskCompletionDate] = useState(() => getInitialState('lastTaskCompletionDate', ''));


  const committedBalance = taskRewardsBalance + interestEarningsBalance;
  const currentLevelData = levels.slice().reverse().find(level => committedBalance >= level.minAmount) ?? levels[0];
  const { level: currentLevel, rate: currentRate, dailyTasks: dailyTaskQuota } = currentLevelData;


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
    if (currentUser) {
      setIsLoading(true);
      // Reset task count if it's a new day
      const today = new Date().toISOString().split('T')[0];
      const lastCompletionDate = getInitialState('lastTaskCompletionDate', '');
      if (today !== lastCompletionDate) {
        setTasksCompletedToday(0);
        setPersistentState('tasksCompletedToday', 0);
        setLastTaskCompletionDate(today);
        setPersistentState('lastTaskCompletionDate', today);
      } else {
        setTasksCompletedToday(getInitialState('tasksCompletedToday', 0));
      }
      
      setMainBalance(getInitialState('mainBalance', 0));
      setTaskRewardsBalance(getInitialState('taskRewardsBalance', 0));
      setInterestEarningsBalance(getInitialState('interestEarningsBalance', 0));
      setTaskRewardsEarned(getInitialState('taskRewardsEarned', 0));
      setInterestEarned(getInitialState('interestEarned', 0));
      setDeposits(getInitialState('deposits', 0));
      setWithdrawals(getInitialState('withdrawals', 0));
      setInterestCounter(getInitialState('interestCounter', { isRunning: false, startTime: null }));
      setIsLoading(false);
    } else {
        // Reset to default when user logs out
        setMainBalance(0);
        setTaskRewardsBalance(0);
        setInterestEarningsBalance(0);
        setTaskRewardsEarned(0);
        setInterestEarned(0);
        setDeposits(0);
        setWithdrawals(0);
        setInterestCounter({ isRunning: false, startTime: null });
        setTasksCompletedToday(0);
        setLastTaskCompletionDate('');
    }
  }, [currentUser, setPersistentState]);


  useEffect(() => setPersistentState('mainBalance', mainBalance), [mainBalance, setPersistentState]);
  useEffect(() => setPersistentState('taskRewardsBalance', taskRewardsBalance), [taskRewardsBalance, setPersistentState]);
  useEffect(() => setPersistentState('interestEarningsBalance', interestEarningsBalance), [interestEarningsBalance, setPersistentState]);
  useEffect(() => setPersistentState('taskRewardsEarned', taskRewardsEarned), [taskRewardsEarned, setPersistentState]);
  useEffect(() => setPersistentState('interestEarned', interestEarned), [interestEarned, setPersistentState]);
  useEffect(() => setPersistentState('deposits', deposits), [deposits, setPersistentState]);
  useEffect(() => setPersistentState('withdrawals', withdrawals), [withdrawals, setPersistentState]);
  useEffect(() => setPersistentState('interestCounter', interestCounter), [interestCounter, setPersistentState]);
  useEffect(() => setPersistentState('tasksCompletedToday', tasksCompletedToday), [tasksCompletedToday, setPersistentState]);
  useEffect(() => setPersistentState('lastTaskCompletionDate', lastTaskCompletionDate), [lastTaskCompletionDate, setPersistentState]);


  const handleMoveFunds = (destination: 'Task Rewards' | 'Interest Earnings') => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
        toast({
            variant: "destructive",
            title: "Invalid Amount",
            description: "Please enter a valid positive number to move.",
        });
        return;
    }

    if (numericAmount > mainBalance) {
        toast({
            variant: "destructive",
            title: "Insufficient Funds",
            description: "You cannot move more than your main balance.",
        });
        return;
    }

    setMainBalance(prev => prev - numericAmount);

    if (destination === "Task Rewards") {
        setTaskRewardsBalance(prev => prev + numericAmount);
    } else if (destination === "Interest Earnings") {
        setInterestEarningsBalance(prev => prev + numericAmount);
    }

    toast({
      title: "Funds Moved",
      description: `${numericAmount.toFixed(2)} USDT has been notionally moved to ${destination}.`,
    });
    setAmount("");
  };

  const approveRecharge = (rechargeAmount: number) => {
    setMainBalance(prev => prev + rechargeAmount);
    setDeposits(prev => prev + 1);
     toast({
      title: "Recharge Approved",
      description: `Your balance has been updated by ${rechargeAmount.toFixed(2)} USDT.`,
    });
  };

  const addRecharge = (rechargeAmount: number) => {
      // This is now only for request creation, not balance update
  }

  const requestWithdrawal = (withdrawalAmount: number) => {
    setMainBalance(prev => prev - withdrawalAmount);
  }

  const approveWithdrawal = () => {
    setWithdrawals(prev => prev + 1);
  }

  const refundWithdrawal = (withdrawalAmount: number) => {
    setMainBalance(prev => prev + withdrawalAmount);
    toast({
        variant: "default",
        title: "Withdrawal Refunded",
        description: `Your withdrawal request was declined. ${withdrawalAmount.toFixed(2)} USDT has been returned to your main balance.`,
    });
  }
  
  const getWalletData = useCallback(() => {
    return { balance: mainBalance, level: currentLevel, deposits, withdrawals };
  }, [mainBalance, currentLevel, deposits, withdrawals]);

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
          setInterestEarned(prev => prev + earnings);
          setInterestCounter({ isRunning: true, startTime: Date.now() });
          toast({ title: "Daily Interest Claimed!", description: `You earned ${earnings.toFixed(4)} USDT. A new cycle has started.`});
      }
  };

  const completeTask = () => {
      if (tasksCompletedToday >= dailyTaskQuota) {
          toast({
              variant: "destructive",
              title: "Daily Limit Reached",
              description: "You have already completed all your tasks for today.",
          });
          return;
      }

      // Calculate earnings for this single task
      const dailyRate = currentRate / 100 / 365;
      const potentialDailyEarning = taskRewardsBalance * dailyRate;
      
      // Ensure dailyTaskQuota is not zero to avoid division by zero
      const earningPerTask = dailyTaskQuota > 0 ? potentialDailyEarning / dailyTaskQuota : 0;

      if (earningPerTask > 0) {
        setTaskRewardsEarned(prev => prev + earningPerTask);
      }
      
      setTasksCompletedToday(prev => prev + 1);

      toast({
          title: "Task Completed!",
          description: `You've earned ${earningPerTask.toFixed(4)} USDT.`,
      });
  };


  return (
    <WalletContext.Provider
      value={{
        mainBalance,
        taskRewardsBalance,
        interestEarningsBalance,
        taskRewardsEarned,
        interestEarned,
        committedBalance,
        currentLevel,
        currentRate,
        dailyTaskQuota,
        tasksCompletedToday,
        amount,
        setAmount,
        handleMoveFunds,
        addRecharge,
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
