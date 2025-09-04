
"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Calendar, Wallet, ArrowUpCircle, ArrowDownCircle, Users as UsersIcon, Gift, UserCheck, Briefcase, HandCoins } from "lucide-react";
import { useRequests } from "@/contexts/RequestContext";
import { Skeleton } from "../ui/skeleton";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { levels as defaultLevels, Level } from "./level-tiers";
import { useTeam } from "@/contexts/TeamContext";

type RequestStatus = 'Pending' | 'Approved' | 'Declined' | 'On Hold';
type RequestType = 'Finance' | 'Rewards';

const getDepositsForUser = (userEmail: string): number => {
    if (typeof window === 'undefined') return 0;
    const mainBalance = parseFloat(localStorage.getItem(`${userEmail}_mainBalance`) || '0');
    const taskBalance = parseFloat(localStorage.getItem(`${userEmail}_taskRewardsBalance`) || '0');
    const interestBalance = parseFloat(localStorage.getItem(`${userEmail}_interestEarningsBalance`) || '0');
    return mainBalance + taskBalance + interestBalance;
};

export function AdminProfile() {
    const { requests, updateRequestStatus } = useRequests();
    const { users } = useAuth();
    const { getLevelForUser } = useTeam();
    const [isClient, setIsClient] = React.useState(false);
    const [activeTab, setActiveTab] = useState<RequestType>('Finance');
    const [activeStatus, setActiveStatus] = useState<RequestStatus | 'All'>('Pending');

    React.useEffect(() => {
        setIsClient(true);
    }, []);

    const handleAction = (requestId: string, action: RequestStatus) => {
        updateRequestStatus(requestId, action);
    };

    const getLiveUserData = useCallback((userEmail: string) => {
        const user = users.find(u => u.email === userEmail);
        if (!user) return null;

        const mainBalance = parseFloat(localStorage.getItem(`${userEmail}_mainBalance`) || '0');
        const level = getLevelForUser(user, users);

        const deposits = parseInt(localStorage.getItem(`${userEmail}_deposits`) || '0');
        const withdrawals = parseInt(localStorage.getItem(`${userEmail}_withdrawals`) || '0');

        const level1 = users.filter(u => u.referredBy === user.referralCode);
        const level2 = level1.flatMap(l1 => users.filter(u => u.referredBy === l1.referralCode));
        const level3 = level2.flatMap(l2 => users.filter(u => u.referredBy === l2.referralCode));
        const teamSize = level1.length + level2.length + level3.length;
        const upline = users.find(u => u.referralCode === user.referredBy);
        
        const totalTeamBusiness = 
            level1.reduce((sum, u) => sum + getDepositsForUser(u.email), 0) +
            level2.reduce((sum, u) => sum + getDepositsForUser(u.email), 0) +
            level3.reduce((sum, u) => sum + getDepositsForUser(u.email), 0);

        return {
            balance: mainBalance,
            level: level,
            deposits,
            withdrawals,
            referrals: level1.length,
            teamSize,
            upline: upline?.email || null,
            activatedAt: user.activatedAt ? new Date(user.activatedAt).toLocaleDateString() : 'N/A',
            totalTeamBusiness,
        };
    }, [users, getLevelForUser]);
    
    const getSavedWithdrawalAddress = useCallback((userEmail: string) => {
        if (!isClient) return null;
        const storedAddresses = localStorage.getItem(`${userEmail}_withdrawalAddresses`);
        if (!storedAddresses) return null;
        
        try {
            const addresses = JSON.parse(storedAddresses);
            if (Array.isArray(addresses) && addresses.length > 0) {
                 return addresses.map(a => a.address).join(", ");
            }
        } catch(e) {
            return null;
        }
        return null;
    }, [isClient]);

    const filteredRequests = useMemo(() => {
        const financeTypes = ['Recharge', 'Withdrawal'];
        const rewardTypes = ['Team Reward', 'Team Size Reward', 'Sign-up Bonus', 'Referral Bonus', 'Salary Claim', 'Reimbursement'];
        const typeFilter = activeTab === 'Finance' ? financeTypes : rewardTypes;
        
        return requests.filter(req => {
            const isTypeMatch = typeFilter.includes(req.type);
            const isStatusMatch = activeStatus === 'All' || req.status === activeStatus;
            return isTypeMatch && isStatusMatch;
        });
    }, [requests, activeTab, activeStatus]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Panel</CardTitle>
        <CardDescription>
          Manage all user requests from this panel.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isClient ? (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <div className="space-y-2 border rounded-md p-2">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            </div>
        ) : (
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as RequestType)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="Finance">Finance Requests</TabsTrigger>
            <TabsTrigger value="Rewards">Reward Requests</TabsTrigger>
          </TabsList>
            
          <TabsList className="grid w-full grid-cols-5 mt-4">
            <TabsTrigger value="Pending" onClick={() => setActiveStatus('Pending')}>Pending</TabsTrigger>
            <TabsTrigger value="Approved" onClick={() => setActiveStatus('Approved')}>Approved</TabsTrigger>
            <TabsTrigger value="Declined" onClick={() => setActiveStatus('Declined')}>Declined</TabsTrigger>
            <TabsTrigger value="On Hold" onClick={() => setActiveStatus('On Hold')}>On Hold</TabsTrigger>
            <TabsTrigger value="All" onClick={() => setActiveStatus('All')}>All</TabsTrigger>
          </TabsList>

          <div className="space-y-4 mt-4">
             {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => {
                  const liveData = getLiveUserData(request.user);
                  if (!liveData) return null; // Skip if user data can't be found
                  
                  const userWithdrawalAddress = getSavedWithdrawalAddress(request.user);
                  const isFinanceRequest = activeTab === 'Finance';

                  const getIcon = () => {
                      switch (request.type) {
                        case 'Recharge': return <ArrowUpCircle className="h-4 w-4 text-green-600" />;
                        case 'Withdrawal': return <ArrowDownCircle className="h-4 w-4 text-red-600" />;
                        case 'Reimbursement': return <HandCoins className="h-4 w-4 text-blue-600" />;
                        default: return <Gift className="h-4 w-4 text-yellow-600" />;
                      }
                  }

                  const getIconBg = () => {
                      switch (request.type) {
                        case 'Recharge': return 'bg-green-100';
                        case 'Withdrawal': return 'bg-red-100';
                         case 'Reimbursement': return 'bg-blue-100';
                        default: return 'bg-yellow-100';
                      }
                  }
                  
                  return (
                  <div key={request.id} className="border rounded-lg p-4 space-y-4 bg-card">
                    {/* Header */}
                    <div>
                        <div className="flex items-center gap-2">
                            <div className={cn("flex h-6 w-6 items-center justify-center rounded-full", getIconBg())}>
                                {getIcon()}
                            </div>
                            <h3 className="text-lg font-bold text-foreground">
                                {request.type} Request
                            </h3>
                        </div>
                        <p className="text-sm text-muted-foreground font-mono mt-1">{request.id}</p>
                    </div>
                    
                    {/* User Info */}
                    <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-foreground">
                            <User className="h-4 w-4 text-muted-foreground"/>
                            <span>{request.user}</span>
                        </div>
                         <div className="flex items-center gap-2 text-foreground">
                            <Calendar className="h-4 w-4 text-muted-foreground"/>
                            <span>Activated: {liveData.activatedAt}</span>
                        </div>
                        {liveData.upline && (
                           <div className="flex items-center gap-2 text-foreground">
                               <UserCheck className="h-4 w-4 text-muted-foreground"/>
                               <span>Sponsor: {liveData.upline}</span>
                           </div>
                        )}
                        {userWithdrawalAddress && isFinanceRequest && (
                             <div className="flex items-center gap-2 text-foreground">
                                <Wallet className="h-4 w-4 text-muted-foreground"/>
                                <span className="font-mono text-xs">{userWithdrawalAddress}</span>
                            </div>
                        )}
                         {(request.type !== 'Recharge' && request.type !== 'Withdrawal') && request.address && (
                             <div className="flex items-center gap-2 text-foreground">
                                <UsersIcon className="h-4 w-4 text-muted-foreground"/>
                                <span className="font-mono text-xs">{request.address}</span>
                            </div>
                        )}
                    </div>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm border-t border-b py-4">
                        <div>
                            <p className="text-muted-foreground">Amount</p>
                            <p className="font-bold text-base text-foreground">${request.amount.toFixed(2)}</p>
                        </div>
                         <div>
                            <p className="text-muted-foreground">User Level</p>
                            <p className="font-bold text-base text-foreground">Level {liveData.level}</p>
                        </div>
                         <div>
                            <p className="text-muted-foreground">User Deposits</p>
                            <p className="font-bold text-base text-foreground">{liveData.deposits}</p>
                        </div>
                         <div>
                            <p className="text-muted-foreground">User Withdrawals</p>
                            <p className="font-bold text-base text-foreground">{liveData.withdrawals}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Direct Referrals</p>
                            <p className="font-bold text-base text-foreground">{liveData.referrals}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Team Size</p>
                            <p className="font-bold text-base text-foreground">{liveData.teamSize}</p>
                        </div>
                         <div>
                            <p className="text-muted-foreground">User Main Balance</p>
                            <p className="font-bold text-base text-foreground">${(liveData.balance ?? 0).toFixed(2)}</p>
                        </div>
                         <div>
                            <p className="text-muted-foreground">Team Business</p>
                            <p className="font-bold text-base text-foreground">${(liveData.totalTeamBusiness ?? 0).toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Actions */}
                     {request.status === 'Pending' || request.status === 'On Hold' ? (
                        <div className="grid grid-cols-3 gap-2">
                           <Button onClick={() => handleAction(request.id, 'Approved')} className="bg-green-500 hover:bg-green-600 text-white">Approve</Button>
                           <Button onClick={() => handleAction(request.id, 'Declined')} className="bg-red-500 hover:bg-red-600 text-white">Decline</Button>
                           <Button onClick={() => handleAction(request.id, 'On Hold')} variant="outline">On Hold</Button>
                        </div>
                    ) : (
                         <div className="flex justify-end">
                             <Badge
                                variant={
                                request.status === "Pending"
                                    ? "secondary"
                                    : request.status === "Approved"
                                    ? "default"
                                    : "destructive"
                                }
                                className={cn("w-24 justify-center py-1 text-sm", request.status === 'Approved' ? 'bg-green-500/20 text-green-700 border-green-500/20' : '')}
                            >
                                {request.status}
                            </Badge>
                         </div>
                    )}
                  </div>
                )
                })
            ) : (
                 <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground">No {activeStatus.toLowerCase()} {activeTab.toLowerCase()} requests found.</p>
                </div>
            )}
          </div>
        </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
