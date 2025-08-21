
"use client";

import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from './AuthContext';

interface WalletContextType {
  mainBalance: number;
  taskRewardsBalance: number;
  interestEarningsBalance: number;
  amount: string;
  setAmount: (amount: string) => void;
  handleMoveFunds: (destination: 'Task Rewards' | 'Interest Earnings') => void;
  addRecharge: (amount: number) => void; // Kept for direct calls if needed elsewhere
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
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [amount, setAmount] = useState("");

  const getInitialState = (key: string, defaultValue: number) => {
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
  const [deposits, setDeposits] = useState(() => getInitialState('deposits', 0));
  const [withdrawals, setWithdrawals] = useState(() => getInitialState('withdrawals', 0));

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
      setMainBalance(getInitialState('mainBalance', 0));
      setTaskRewardsBalance(getInitialState('taskRewardsBalance', 0));
      setInterestEarningsBalance(getInitialState('interestEarningsBalance', 0));
      setDeposits(getInitialState('deposits', 0));
      setWithdrawals(getInitialState('withdrawals', 0));
    } else {
        // Reset to default when user logs out
        setMainBalance(0);
        setTaskRewardsBalance(0);
        setInterestEarningsBalance(0);
        setDeposits(0);
        setWithdrawals(0);
    }
  }, [currentUser]);


  useEffect(() => setPersistentState('mainBalance', mainBalance), [mainBalance, setPersistentState]);
  useEffect(() => setPersistentState('taskRewardsBalance', taskRewardsBalance), [taskRewardsBalance, setPersistentState]);
  useEffect(() => setPersistentState('interestEarningsBalance', interestEarningsBalance), [interestEarningsBalance, setPersistentState]);
  useEffect(() => setPersistentState('deposits', deposits), [deposits, setPersistentState]);
  useEffect(() => setPersistentState('withdrawals', withdrawals), [withdrawals, setPersistentState]);


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

  // Called by admin action
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
    const balance = mainBalance + taskRewardsBalance + interestEarningsBalance;
    const levels = [
        { minAmount: 20000, level: 5 },
        { minAmount: 6000, level: 4 },
        { minAmount: 2000, level: 3 },
        { minAmount: 500, level: 2 },
        { minAmount: 100, level: 1 },
    ];
    const level = levels.find(l => balance >= l.minAmount)?.level ?? 0;

    return { balance, level, deposits, withdrawals };
  }, [mainBalance, taskRewardsBalance, interestEarningsBalance, deposits, withdrawals]);

  return (
    <WalletContext.Provider
      value={{
        mainBalance,
        taskRewardsBalance,
        interestEarningsBalance,
        amount,
        setAmount,
        handleMoveFunds,
        addRecharge,
        getWalletData,
        requestWithdrawal,
        approveRecharge,
        refundWithdrawal,
        approveWithdrawal
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
