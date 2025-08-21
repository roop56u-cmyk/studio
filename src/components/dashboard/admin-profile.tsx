
"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { MoreHorizontal, User, Calendar, Hash, DollarSign, Wallet, ArrowRightLeft, Star, BarChart2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRequests } from "@/contexts/RequestContext";
import { Skeleton } from "../ui/skeleton";

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
                <Skeleton className="h-48 w-full" />
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
            
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
              <Card key={request.id} className="flex flex-col">
                <CardHeader className="flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-base flex items-center gap-2">
                           <Badge variant={request.type === 'Withdrawal' ? 'destructive' : 'secondary'}>{request.type}</Badge>
                            <span className="font-bold text-lg">${request.amount.toFixed(2)}</span>
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 text-xs pt-1"><User className="h-3 w-3"/>{request.user}</CardDescription>
                    </div>
                     <Badge
                        variant={
                        request.status === "Pending"
                            ? "secondary"
                            : request.status === "Approved"
                            ? "default"
                            : "destructive"
                        }
                        className={request.status === 'Approved' ? 'bg-green-500/20 text-green-700 border-green-500/20' : ''}
                      >
                        {request.status}
                      </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm flex-grow">
                    <div className="flex items-center text-muted-foreground"><Hash className="h-4 w-4 mr-2" /><span className="font-mono text-xs">{request.id}</span></div>
                    <div className="flex items-center text-muted-foreground"><Calendar className="h-4 w-4 mr-2" /><span>{request.date}</span></div>
                    {request.address && <div className="flex items-center text-muted-foreground"><Wallet className="h-4 w-4 mr-2" /><span className="font-mono text-xs">{request.address}</span></div>}
                    <div className="flex justify-between text-xs border-t pt-2">
                        <div className="flex items-center gap-1" title="User Level"><Star className="h-3 w-3" /> Lvl {request.level}</div>
                        <div className="flex items-center gap-1" title="User Balance"><DollarSign className="h-3 w-3" />{request.balance.toFixed(2)}</div>
                        <div className="flex items-center gap-1" title="Deposits / Withdrawals"><ArrowRightLeft className="h-3 w-3" />{request.deposits}/{request.withdrawals}</div>
                    </div>
                </CardContent>
                <CardFooter>
                  {request.status === 'Pending' && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="sm" variant="outline" className="w-full">
                                <MoreHorizontal className="h-4 w-4 mr-2" />
                                Actions
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleAction(request.id, 'Approved')}>Approve</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleAction(request.id, 'Declined')}>Decline</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleAction(request.id, 'On Hold')}>On Hold</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </CardFooter>
              </Card>
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
