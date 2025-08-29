

"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from './WalletContext';

export type Request = {
    id: string;
    user: string;
    type: 'Recharge' | 'Withdrawal' | 'Team Reward' | 'Team Size Reward' | 'Sign-up Bonus' | 'Referral Bonus';
    amount: number;
    address: string | null;
    level: number;
    deposits: number;
    withdrawals: number;
    referrals: number;
    balance: number;
    status: 'Pending' | 'Approved' | 'Declined' | 'On Hold';
    date: string;
};

interface RequestContextType {
  requests: Request[];
  addRequest: (requestData: Partial<Omit<Request, 'id' | 'date' | 'status' | 'user'>>) => void;
  userRequests: Request[];
  setRequests: React.Dispatch<React.SetStateAction<Request[]>>;
}

const mockRequests: Request[] = [
  {
    id: "REQ-001",
    user: "user1@example.com",
    type: "Withdrawal",
    amount: 150.00,
    address: "0xAbCdE123456789012345678901234567890AbCdE",
    level: 2,
    deposits: 5,
    withdrawals: 2,
    referrals: 3,
    balance: 750.00,
    status: "Pending",
    date: "2024-07-31",
  },
  {
    id: "REQ-002",
    user: "user2@example.com",
    type: "Recharge",
    amount: 500.00,
    address: "0x1234567890AbCdEAbCdE12345678901234567890",
    level: 1,
    deposits: 1,
    withdrawals: 0,
    referrals: 0,
    balance: 120.50,
    status: "Approved",
    date: "2024-07-30",
  },
   {
    id: "REQ-003",
    user: "admin@stakinghub.com",
    type: "Withdrawal",
    amount: 300.00,
    address: "0xEfGhI987654321098765432109876543210EfGhI",
    level: 3,
    deposits: 10,
    withdrawals: 5,
    referrals: 10,
    balance: 2100.00,
    status: "Declined",
    date: "2024-07-29",
  },
];

const RequestContext = createContext<RequestContextType | undefined>(undefined);

export const RequestProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useAuth();
  
  const [requests, setRequests] = useState<Request[]>(() => {
    if (typeof window === 'undefined') {
        return mockRequests;
    }
    try {
        const storedRequests = localStorage.getItem('requests');
        if (storedRequests) {
            return JSON.parse(storedRequests);
        }
    } catch (error) {
        console.error("Failed to parse requests from localStorage", error);
    }
    return mockRequests;
  });

  const [userRequests, setUserRequests] = useState<Request[]>([]);
  
  useEffect(() => {
    try {
        localStorage.setItem('requests', JSON.stringify(requests));
    } catch (error) {
        console.error("Failed to save requests to localStorage", error);
    }
  }, [requests]);

  useEffect(() => {
    if (currentUser) {
        const sortedUserRequests = requests
            .filter(req => req.user === currentUser.email)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setUserRequests(sortedUserRequests);
    } else {
        setUserRequests([]);
    }
  }, [currentUser, requests]);


  const addRequest = (requestData: Partial<Omit<Request, 'id' | 'date' | 'status' | 'user'>>) => {
    if (!currentUser) {
        console.error("Cannot add request: no user logged in.");
        return;
    }
    
    // We get wallet data from localStorage directly to avoid context dependency issues
    const mainBalance = parseFloat(localStorage.getItem(`${currentUser.email}_mainBalance`) || '0');
    const currentLevel = JSON.parse(localStorage.getItem(`${currentUser.email}_level`) || '0');
    const deposits = parseInt(localStorage.getItem(`${currentUser.email}_deposits`) || '0');
    const withdrawals = parseInt(localStorage.getItem(`${currentUser.email}_withdrawals`) || '0');
    const purchasedReferrals = parseInt(localStorage.getItem(`${currentUser.email}_purchased_referrals`) || '0');
    
    const directReferralsCount = purchasedReferrals; // Simplified for this context

    const newRequest: Request = {
        id: `REQ-${Date.now()}`,
        date: new Date().toISOString(),
        status: 'Pending',
        user: currentUser.email,
        type: requestData.type!,
        amount: requestData.amount!,
        address: requestData.address ?? null,
        balance: mainBalance,
        level: currentLevel,
        deposits: deposits,
        withdrawals: withdrawals,
        referrals: directReferralsCount
    };

    setRequests(prev => [newRequest, ...prev]);
  };


  return (
    <RequestContext.Provider
      value={{
        requests,
        addRequest,
        userRequests,
        setRequests
      }}
    >
      {children}
    </RequestContext.Provider>
  );
};

export const useRequests = () => {
  const context = useContext(RequestContext);
  if (context === undefined) {
    throw new Error('useRequests must be used within a RequestProvider');
  }
  return context;
};

export type Transaction = {
    id: string,
    type: string,
    description: string,
    amount: number,
    date: string,
}
