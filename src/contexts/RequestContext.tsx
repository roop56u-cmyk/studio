

"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from './WalletContext';

export type Request = {
    id: string;
    user: string;
    type: 'Recharge' | 'Withdrawal' | 'Team Reward' | 'Team Size Reward' | 'Sign-up Bonus' | 'Referral Bonus' | 'Salary Claim';
    amount: number;
    address: string | null;
    status: 'Pending' | 'Approved' | 'Declined' | 'On Hold';
    date: string;
    // The following fields are now deprecated from the request object
    // and will be looked up live in the admin panel.
    level?: number;
    deposits?: number;
    withdrawals?: number;
    referrals?: number;
    balance?: number;
    upline?: string | null;
};

interface RequestContextType {
  requests: Request[];
  addRequest: (requestData: Partial<Omit<Request, 'id' | 'date' | 'status' | 'user'>>) => void;
  updateRequestStatus: (id: string, status: 'Approved' | 'Declined' | 'On Hold') => void;
  userRequests: Request[];
}

const mockRequests: Request[] = [
  {
    id: "REQ-001",
    user: "user1@example.com",
    type: "Withdrawal",
    amount: 150.00,
    address: "0xAbCdE123456789012345678901234567890AbCdE",
    status: "Pending",
    date: "2024-07-31",
  },
  {
    id: "REQ-002",
    user: "user2@example.com",
    type: "Recharge",
    amount: 500.00,
    address: "0x1234567890AbCdEAbCdE12345678901234567890",
    status: "Approved",
    date: "2024-07-30",
  },
   {
    id: "REQ-003",
    user: "admin@stakinghub.com",
    type: "Withdrawal",
    amount: 300.00,
    address: "0xEfGhI987654321098765432109876543210EfGhI",
    status: "Declined",
    date: "2024-07-29",
  },
];

const RequestContext = createContext<RequestContextType | undefined>(undefined);

export const RequestProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser, users } = useAuth();
  const { toast } = useToast();
  const { 
      approveRecharge, 
      approveWithdrawal,
      approveSignUpBonus,
      approveReferralBonus,
      approveSalary,
      refundWithdrawal 
  } = useWallet();
  
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
    
    const newRequest: Request = {
        id: `REQ-${Date.now()}`,
        date: new Date().toISOString(),
        status: 'Pending',
        user: currentUser.email,
        type: requestData.type!,
        amount: requestData.amount!,
        address: requestData.address ?? null,
    };

    setRequests(prev => [newRequest, ...prev]);
  };

  const updateRequestStatus = (id: string, status: 'Approved' | 'Declined' | 'On Hold') => {
        const requestToUpdate = requests.find(r => r.id === id);
        if (!requestToUpdate) return;
        const { user: userEmail, type, amount, address } = requestToUpdate;

        if (status === 'Approved') {
            if (type === 'Recharge') {
                approveRecharge(userEmail, amount);
            } else if (type === 'Withdrawal') {
                approveWithdrawal(userEmail, amount);
            } else if (type === 'Sign-up Bonus') {
                approveSignUpBonus(userEmail, amount);
            } else if (type === 'Referral Bonus' && address) {
                approveReferralBonus(userEmail, address, amount);
            } else if (type === 'Salary Claim') {
                approveSalary(userEmail, amount);
            }
        } else if (status === 'Declined') {
            if (type === 'Withdrawal') {
                refundWithdrawal(userEmail, amount);
            }
        }
        
        const updatedRequests = requests.map((req) => 
            req.id === id ? { ...req, status } : req
        );
        
        setRequests(updatedRequests);
        
        toast({
            title: `Request ${status}`,
            description: `Request ID ${id} has been marked as ${status.toLowerCase()}.`,
        });
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

export type Transaction = {
    id: string,
    type: string,
    description: string,
    amount: number,
    date: string,
}
