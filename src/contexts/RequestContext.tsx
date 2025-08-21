
"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';

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
  addRequest: (request: Omit<Request, 'id' | 'date' | 'status'>) => void;
  updateRequestStatus: (id: string, status: 'Approved' | 'Declined' | 'On Hold') => void;
}

const mockRequests: Request[] = [
  {
    id: "REQ-001",
    user: "user1@example.com",
    type: "Withdrawal",
    amount: 150.00,
    address: "0xAbCd...1234",
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
    address: null,
    level: 1,
    deposits: 1,
    withdrawals: 0,
    balance: 120.50,
    status: "Approved",
    date: "2024-07-30",
  },
  {
    id: "REQ-003",
    user: "user3@example.com",
    type: "Withdrawal",
    amount: 300.00,
    address: "0xEfGh...5678",
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
  const [requests, setRequests] = useState<Request[]>(mockRequests);

  const addRequest = (requestData: Omit<Request, 'id' | 'date' | 'status'>) => {
    const newRequest: Request = {
        ...requestData,
        id: `REQ-${String(requests.length + 1).padStart(3, '0')}`,
        date: new Date().toISOString().split('T')[0],
        status: 'Pending',
        user: 'currentuser@example.com' // Mock current user
    };
    setRequests(prev => [newRequest, ...prev]);
  };

  const updateRequestStatus = (id: string, status: 'Approved' | 'Declined' | 'On Hold') => {
    setRequests(prev => prev.map(req => req.id === id ? { ...req, status } : req));
  };


  return (
    <RequestContext.Provider
      value={{
        requests,
        addRequest,
        updateRequestStatus,
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
