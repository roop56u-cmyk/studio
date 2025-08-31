
"use client";

import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, AlertTriangle, DollarSign, ArrowUpCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRequests } from '@/contexts/RequestContext';

export function PlatformStats() {
    const { users } = useAuth();
    const { requests } = useRequests();

    const stats = useMemo(() => {
        const today = new Date().toISOString().slice(0, 10);
        
        const totalUsers = users.length;
        const pendingRequests = requests.filter(r => r.status === 'Pending').length;
        const totalRechargedToday = requests
            .filter(r => r.type === 'Recharge' && r.status === 'Approved' && r.date.startsWith(today))
            .reduce((acc, r) => acc + r.amount, 0);

        const totalWithdrawnToday = requests
            .filter(r => r.type === 'Withdrawal' && r.status === 'Approved' && r.date.startsWith(today))
            .reduce((acc, r) => acc + r.amount, 0);

        return {
            totalUsers,
            pendingRequests,
            totalRechargedToday,
            totalWithdrawnToday,
        };
    }, [users, requests]);

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalUsers}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.pendingRequests}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Recharged Today</CardTitle>
                    <ArrowUpCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${stats.totalRechargedToday.toFixed(2)}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Withdrawn Today</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${stats.totalWithdrawnToday.toFixed(2)}</div>
                </CardContent>
            </Card>
        </div>
    );
}
