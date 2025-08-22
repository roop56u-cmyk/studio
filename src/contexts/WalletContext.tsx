

"use client";

import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from './AuthContext';
import { GenerateTaskSuggestionOutput } from '@/ai/flows/generate-task-suggestions';

const levels = [
  { level: 0, minAmount: 0, rate: 0, referrals: null, dailyTasks: 0, monthlyWithdrawals: 0 },
  { level: 1, minAmount: 100, rate: 1.8, referrals: null, dailyTasks: 15, monthlyWithdrawals: 1 },
  { level: 2, minAmount: 500, rate: 2.8, referrals: 8, dailyTasks: 25, monthlyWithdrawals: 1 },
  { level: 3, minAmount: 2000, rate: 3.8, referrals: 16, dailyTasks: 35, monthlyWithdrawals: 1 },
  { level: 4, minAmount: 6000, rate: 4.8, referrals: 36, dailyTasks: 45, monthlyWithdrawals: 1 },
  { level: 5, minAmount: 20000, rate: 5.8, referrals: 55, dailyTasks: 55, monthlyWithdrawals: 2 },
];

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
  completedTasks: CompletedTask[];
  amount: string;
  setAmount: (amount: string) => void;
  handleMoveFunds: (destination: 'Task Rewards' | 'Interest Earnings' | 'Main Wallet', amountToMove: number, fromAccount?: 'Task Rewards' | 'Interest Earnings') => void;
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
  completeTask: (task: GenerateTaskSuggestionOutput) => void;
  withdrawalAddress: WithdrawalAddress | null;
  setWithdrawalAddress: (address: Omit<WithdrawalAddress, 'id'>) => void;
  clearWithdrawalAddress: () => void;
  firstDepositDate: string | null;
  isWithdrawalRestrictionEnabled: boolean;
  withdrawalRestrictionDays: number;
  withdrawalRestrictionMessage: string;
  withdrawalRestrictedLevels: number[];
  getInitialState: (key: string, defaultValue: any) => any;
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
  const [taskRewardsEarned, setTaskRewardsEarned] = useState(() => getInitialState('taskRewardsEarned', 0));
  const [interestEarned, setInterestEarned] = useState(() => getInitialState('interestEarned', 0));
  const [deposits, setDeposits] = useState(() => getInitialState('deposits', 0));
  const [withdrawals, setWithdrawals] = useState(() => getInitialState('withdrawals', 0));
  const [firstDepositDate, setFirstDepositDate] = useState<string | null>(() => getInitialState('firstDepositDate', null));
  
  const [interestCounter, setInterestCounter] = useState<CounterState>(() => getInitialState('interestCounter', { isRunning: false, startTime: null }));

  const [tasksCompletedToday, setTasksCompletedToday] = useState(() => getInitialState('tasksCompletedToday', 0));
  const [lastTaskCompletionDate, setLastTaskCompletionDate] = useState(() => getInitialState('lastTaskCompletionDate', ''));
  const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>(() => getInitialState('completedTasks', []));
  const [withdrawalAddress, setWithdrawalAddressState] = useState<WithdrawalAddress | null>(() => getInitialState('withdrawalAddress', null));


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
    setIsLoading(true);
    // Load global settings
    setIsWithdrawalRestrictionEnabled(getGlobalSetting('system_withdrawal_restriction_enabled', true, true));
    setWithdrawalRestrictionDays(parseInt(getGlobalSetting('system_withdrawal_restriction_days', '45'), 10));
    setWithdrawalRestrictionMessage(getGlobalSetting('system_withdrawal_restriction_message', "Please wait for 45 days to initiate withdrawal request."));
    setWithdrawalRestrictedLevels(getGlobalSetting('system_withdrawal_restricted_levels', [1], true));


    if (currentUser) {
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
      setCompletedTasks(getInitialState('completedTasks', []));
      setWithdrawalAddressState(getInitialState('withdrawalAddress', null));
      setFirstDepositDate(getInitialState('firstDepositDate', null));
    } else {
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
        setCompletedTasks([]);
        setWithdrawalAddressState(null);
        setFirstDepositDate(null);
    }
    setIsLoading(false);
  }, [currentUser, setPersistentState, getInitialState]);


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
  useEffect(() => setPersistentState('completedTasks', completedTasks), [completedTasks, setPersistentState]);
  useEffect(() => setPersistentState('withdrawalAddress', withdrawalAddress), [withdrawalAddress, setPersistentState]);
  useEffect(() => setPersistentState('firstDepositDate', firstDepositDate), [firstDepositDate, setPersistentState]);


 const handleMoveFunds = (destination: 'Task Rewards' | 'Interest Earnings' | 'Main Wallet', amountToMove: number, fromAccount?: 'Task Rewards' | 'Interest Earnings') => {
    const numericAmount = fromAccount ? amountToMove : parseFloat(amount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Amount',
        description: 'Please enter a valid positive number to move.',
      });
      return;
    }

    if (fromAccount) { // Moving from sub-account
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
    } else { // Moving from main wallet to sub-account
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
          description: `${numericAmount.toFixed(2)} USDT has been moved from Main Wallet to ${destination}.`,
        });
        setAmount("");
    }
  };

  const approveRecharge = (rechargeAmount: number) => {
    setMainBalance(prev => prev + rechargeAmount);
    setDeposits(prev => {
        const newDeposits = prev + 1;
        if (newDeposits === 1 && !firstDepositDate) { // First deposit only
            setFirstDepositDate(new Date().toISOString());
        }
        return newDeposits;
    });
     toast({
      title: "Recharge Approved",
      description: `Your balance has been updated by ${rechargeAmount.toFixed(2)} USDT.`,
    });
  };

  const addRecharge = (rechargeAmount: number) => {
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

  const completeTask = (task: GenerateTaskSuggestionOutput) => {
      if (tasksCompletedToday >= dailyTaskQuota) {
          toast({
              variant: "destructive",
              title: "Daily Limit Reached",
              description: "You have already completed all your tasks for today.",
          });
          return;
      }

      const dailyRate = currentRate / 100 / 365;
      const potentialDailyEarning = taskRewardsBalance * dailyRate;
      
      const earningPerTask = dailyTaskQuota > 0 ? potentialDailyEarning / dailyTaskQuota : 0;

      if (earningPerTask > 0) {
        setTaskRewardsEarned(prev => prev + earningPerTask);
      }
      
      const newCompletedTask: CompletedTask = {
          id: `TASK-${Date.now()}`,
          title: task.taskTitle,
          description: task.taskDescription,
          earnings: earningPerTask,
          completedAt: new Date().toISOString(),
      };
      setCompletedTasks(prev => [newCompletedTask, ...prev]);
      
      setTasksCompletedToday(prev => prev + 1);

      toast({
          title: "Task Completed!",
          description: `You've earned ${earningPerTask.toFixed(4)} USDT.`,
      });
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
        completedTasks,
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
        withdrawalAddress,
        setWithdrawalAddress,
        clearWithdrawalAddress,
        firstDepositDate,
        isWithdrawalRestrictionEnabled,
        withdrawalRestrictionDays,
        withdrawalRestrictionMessage,
        withdrawalRestrictedLevels,
        getInitialState,
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
