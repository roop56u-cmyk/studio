
"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MoreHorizontal, User, Calendar, Hash, DollarSign, Wallet, ArrowUpCircle, TrendingUp, UserCheck, ShieldCheck, ArrowDownCircle, Users as UsersIcon, Link } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRequests } from "@/contexts/RequestContext";
import { Skeleton } from "../ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type RequestStatus = 'Pending' | 'Approved' | 'Declined' | 'On Hold';

export function AdminProfile() {
    const { toast } = useToast();
    const { requests, updateRequestStatus } = useRequests();
    const [isClient, setIsClient] = React.useState(false);
    const [activeTab, setActiveTab] = useState<RequestStatus | 'All'>('Pending');

    React.useEffect(() => {
        setIsClient(true);
    }, []);

    const handleAction = (requestId: string, action: RequestStatus) => {
        const request = requests.find(r => r.id === requestId);
        if (!request) return;

        updateRequestStatus(requestId, action, request.user, request.type, request.amount);
        toast({
            title: `Request ${action}`,
            description: `Request ID ${requestId} has been marked as ${action.toLowerCase()}.`,
        });
    };

    const filteredRequests = useMemo(() => {
        if (activeTab === 'All') return requests;
        return requests.filter(req => req.status === activeTab);
    }, [requests, activeTab]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Panel</CardTitle>
        <CardDescription>
          Manage all user recharge and withdrawal requests from this panel.
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
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as RequestStatus | 'All')}>
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 mb-4">
            <TabsTrigger value="Pending">Pending</TabsTrigger>
            <TabsTrigger value="Approved">Approved</TabsTrigger>
            <TabsTrigger value="Declined">Declined</TabsTrigger>
            <TabsTrigger value="On Hold">On Hold</TabsTrigger>
            <TabsTrigger value="All">All</TabsTrigger>
          </TabsList>
            
          <div className="space-y-4">
             {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 space-y-4 bg-card">
                    {/* Header */}
                    <div>
                        <div className="flex items-center gap-2">
                            <div className={cn(
                                "flex h-6 w-6 items-center justify-center rounded-full",
                                request.type === 'Recharge' ? 'bg-green-100' : 'bg-red-100'
                            )}>
                                {request.type === 'Recharge' ? (
                                    <ArrowUpCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                    <ArrowDownCircle className="h-4 w-4 text-red-600" />
                                )}
                            </div>
                            <h3 className={cn(
                                "text-lg font-bold",
                                request.type === 'Recharge' ? 'text-green-600' : 'text-red-600'
                            )}>
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
                            <span>{new Date(request.date).toLocaleDateString()}</span>
                        </div>
                    </div>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm border-t border-b py-4">
                        <div>
                            <p className="text-muted-foreground">Amount</p>
                            <p className="font-bold text-base text-foreground">${request.amount.toFixed(2)}</p>
                        </div>
                         <div>
                            <p className="text-muted-foreground">User Level</p>
                            <p className="font-bold text-base text-foreground">Level {request.level}</p>
                        </div>
                         <div>
                            <p className="text-muted-foreground">User Deposits</p>
                            <p className="font-bold text-base text-foreground">{request.deposits}</p>
                        </div>
                         <div>
                            <p className="text-muted-foreground">User Withdrawals</p>
                            <p className="font-bold text-base text-foreground">{request.withdrawals}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">User Referrals</p>
                            <p className="font-bold text-base text-foreground">0</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">User Main Balance</p>
                            <p className="font-bold text-base text-foreground">${request.balance.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Actions */}
                     {request.status === 'Pending' ? (
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
                ))
            ) : (
                 <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground">No requests found for this status.</p>
                </div>
            )}
          </div>
        </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
