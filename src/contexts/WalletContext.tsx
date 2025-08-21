
"use client";

import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";

interface WalletContextType {
  mainBalance: number;
  taskRewardsBalance: number;
  interestEarningsBalance: number;
  amount: string;
  setAmount: (amount: string) => void;
  handleMoveFunds: (destination: 'Task Rewards' | 'Interest Earnings') => void;
  addRecharge: (amount: number) => void;
  getWalletData: () => {
    balance: number;
    level: number;
    deposits: number;
    withdrawals: number;
  }
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [mainBalance, setMainBalance] = useState(0);
  const [taskRewardsBalance, setTaskRewardsBalance] = useState(0);
  const [interestEarningsBalance, setInterestEarningsBalance] = useState(0);

  // Mock deposit/withdrawal counts
  const [deposits, setDeposits] = useState(0);
  const [withdrawals, setWithdrawals] = useState(0);


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

  const addRecharge = (rechargeAmount: number) => {
    setMainBalance(prev => prev + rechargeAmount);
    setDeposits(prev => prev + 1);
  };
  
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
