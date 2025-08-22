
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
import { MoreHorizontal, User, Calendar, Hash, DollarSign, Wallet, ArrowUpCircle, TrendingUp, UserCheck, ShieldCheck } from "lucide-react";
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
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
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
            
          <div className="space-y-2">
             {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                        {/* Column 1 */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Badge variant={request.type === 'Withdrawal' ? 'destructive' : 'default'}>{request.type}</Badge>
                                <span className="font-bold text-lg">${request.amount.toFixed(2)}</span>
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2 truncate">
                                <User className="h-4 w-4 shrink-0" /> <span className="truncate">{request.user}</span>
                            </div>
                             <div className="text-sm text-muted-foreground flex items-center gap-2">
                                <Wallet className="h-4 w-4 shrink-0" />
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                             <span className="font-mono text-xs truncate cursor-pointer">{request.address ?? 'N/A'}</span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{request.address ?? 'N/A'}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>

                        {/* Column 2 */}
                        <div className="space-y-2 flex flex-col items-start sm:items-end">
                            <div className="flex items-center gap-2">
                                <Badge
                                    variant={
                                    request.status === "Pending"
                                        ? "secondary"
                                        : request.status === "Approved"
                                        ? "default"
                                        : "destructive"
                                    }
                                    className={cn("w-20 justify-center", request.status === 'Approved' ? 'bg-green-500/20 text-green-700 border-green-500/20' : '')}
                                >
                                    {request.status}
                                </Badge>
                                 {request.status === 'Pending' && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button size="xs" variant="outline" className="h-7">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleAction(request.id, 'Approved')}>Approve</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleAction(request.id, 'Declined')}>Decline</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleAction(request.id, 'On Hold')}>On Hold</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                             <div className="text-xs text-muted-foreground flex items-center gap-2"><Calendar className="h-3 w-3" /> {new Date(request.date).toLocaleDateString()}</div>
                             <div className="text-xs text-muted-foreground flex items-center gap-2"><Hash className="h-3 w-3" /> {request.id}</div>
                        </div>

                        {/* User stats - full width */}
                        <div className="sm:col-span-2 pt-2 mt-2 border-t border-dashed w-full flex items-center justify-around text-xs text-muted-foreground">
                            <div className="flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-primary"/> Lvl: <span className="font-semibold text-foreground">{request.level}</span></div>
                            <div className="flex items-center gap-1"><ArrowUpCircle className="h-3 w-3 text-green-500"/> Deps: <span className="font-semibold text-foreground">{request.deposits}</span></div>
                            <div className="flex items-center gap-1"><TrendingUp className="h-3 w-3 text-red-500"/> WDs: <span className="font-semibold text-foreground">{request.withdrawals}</span></div>
                             <div className="flex items-center gap-1"><DollarSign className="h-3 w-3 text-yellow-500"/> Bal: <span className="font-semibold text-foreground">${request.balance.toFixed(2)}</span></div>
                        </div>
                    </div>
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
