
"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';
import { useToast } from "@/hooks/use-toast";

interface WalletContextType {
  mainBalance: number;
  taskRewardsBalance: number;
  interestEarningsBalance: number;
  amount: string;
  setAmount: (amount: string) => void;
  handleMoveFunds: (destination: 'Task Rewards' | 'Interest Earnings') => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [mainBalance, setMainBalance] = useState(0);
  const [taskRewardsBalance, setTaskRewardsBalance] = useState(0);
  const [interestEarningsBalance, setInterestEarningsBalance] = useState(0);

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

  return (
    <WalletContext.Provider
      value={{
        mainBalance,
        taskRewardsBalance,
        interestEarningsBalance,
        amount,
        setAmount,
        handleMoveFunds,
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
