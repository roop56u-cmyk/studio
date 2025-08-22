
"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useWallet } from './WalletContext';
import { useToast } from '@/hooks/use-toast';

export type Request = {
    id: string;
    user: string;
    type: 'Recharge' | 'Withdrawal';
    amount: number;
    address: string | null;
    level: number;
    deposits: number;
    withdrawals: number;
    balance: number;
    status: 'Pending' | 'Approved' | 'Declined' | 'On Hold';
    date: string;
};

interface RequestContextType {
  requests: Request[];
  addRequest: (request: Partial<Omit<Request, 'id' | 'date' | 'status' | 'user'>>) => void;
  updateRequestStatus: (id: string, status: 'Approved' | 'Declined' | 'On Hold', userEmail: string, type: 'Recharge' | 'Withdrawal', amount: number) => void;
  userRequests: Request[];
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
    balance: 2100.00,
    status: "Declined",
    date: "2024-07-29",
  },
];

const RequestContext = createContext<RequestContextType | undefined>(undefined);

export const RequestProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser, users } = useAuth();
  const { getWalletData, approveRecharge, refundWithdrawal, approveWithdrawal } = useWallet();
  const { toast } = useToast();

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
        setUserRequests(requests.filter(req => req.user === currentUser.email));
    } else {
        setUserRequests([]);
    }
  }, [currentUser, requests]);


  const addRequest = (requestData: Partial<Omit<Request, 'id' | 'date' | 'status' | 'user'>>) => {
    if (!currentUser) {
        console.error("Cannot add request: no user logged in.");
        return;
    }
    
    const newRequest: Request = {
        ...getWalletData(), // Gets balance, level, deposits, withdrawals
        id: `REQ-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        status: 'Pending',
        user: currentUser.email,
        type: requestData.type!,
        amount: requestData.amount!,
        address: requestData.address,
    };

    setRequests(prev => [newRequest, ...prev]);
  };

  const handleReferralBonus = (userEmail: string, amount: number) => {
    // 1. Check if this is the user's first approved recharge
    const userDepositsKey = `${userEmail}_deposits`;
    const depositCount = parseInt(localStorage.getItem(userDepositsKey) || '0');
    
    // The check is for > 1 because approveRecharge increments it *before* this function is called.
    // So if it's 1, it was 0 before.
    if (depositCount > 1) return;

    // 2. Check if the deposit is >= $100
    const minDepositForBonus = parseInt(localStorage.getItem('system_min_deposit_for_bonus') || '100');
    if (amount < minDepositForBonus) return;

    // 3. Find who referred this user
    const referredUser = users.find(u => u.email === userEmail);
    if (!referredUser || !referredUser.referredBy) return;

    // 4. Find the referrer
    const referrer = users.find(u => u.referralCode === referredUser.referredBy);
    if (!referrer) return;

    // 5. Credit bonus to referrer's main balance
    const referralBonus = parseInt(localStorage.getItem('system_referral_bonus') || '5');
    const referrerMainBalanceKey = `${referrer.email}_mainBalance`;
    const referrerCurrentBalance = parseFloat(localStorage.getItem(referrerMainBalanceKey) || '0');
    localStorage.setItem(referrerMainBalanceKey, (referrerCurrentBalance + referralBonus).toString());

    // If the referrer is the currently logged-in user, we can show a toast.
    if (currentUser?.email === referrer.email) {
      toast({
        title: "Referral Bonus!",
        description: `You've received a $${referralBonus} bonus because your referral ${userEmail} made their first qualifying deposit!`,
      });
    }
  }

  const updateRequestStatus = (id: string, status: 'Approved' | 'Declined' | 'On Hold', userEmail: string, type: 'Recharge' | 'Withdrawal', amount: number) => {
    setRequests(prev => prev.map(req => req.id === id ? { ...req, status } : req));
    
    // This logic handles updates for both current and non-current (admin-edited) users by directly manipulating localStorage.
    if (status === 'Approved') {
      if (type === 'Recharge') {
        const userMainBalanceKey = `${userEmail}_mainBalance`;
        const currentBalance = parseFloat(localStorage.getItem(userMainBalanceKey) || '0');
        localStorage.setItem(userMainBalanceKey, (currentBalance + amount).toString());

        const userDepositsKey = `${userEmail}_deposits`;
        const currentDeposits = parseInt(localStorage.getItem(userDepositsKey) || '0');
        localStorage.setItem(userDepositsKey, (currentDeposits + 1).toString());
        
        const firstDepositDateKey = `${userEmail}_firstDepositDate`;
        if (!localStorage.getItem(firstDepositDateKey)) {
             localStorage.setItem(firstDepositDateKey, new Date().toISOString());
        }

        handleReferralBonus(userEmail, amount);
        
        // If the action is for the current user, trigger a context refresh via approveRecharge
        if (currentUser?.email === userEmail) {
            approveRecharge(amount);
        }

      } else { // Withdrawal
        const userWithdrawalsKey = `${userEmail}_withdrawals`;
        const currentWithdrawals = parseInt(localStorage.getItem(userWithdrawalsKey) || '0');
        localStorage.setItem(userWithdrawalsKey, (currentWithdrawals + 1).toString());

         if (currentUser?.email === userEmail) {
            approveWithdrawal();
        }
      }
    } else if (status === 'Declined' && type === 'Withdrawal') {
       const userMainBalanceKey = `${userEmail}_mainBalance`;
       const currentBalance = parseFloat(localStorage.getItem(userMainBalanceKey) || '0');
       localStorage.setItem(userMainBalanceKey, (currentBalance + amount).toString());

       if (currentUser?.email === userEmail) {
        refundWithdrawal(amount);
      }
    }
  };


  return (
    <RequestContext.Provider
      value={{
        requests,
        addRequest,
        updateRequestStatus,
        userRequests,
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

    
