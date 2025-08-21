
"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, DollarSign, UserPlus } from "lucide-react";
import { useTeam } from "@/contexts/TeamContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function TeamPage() {
  const { teamData, commissionRates, isLoading } = useTeam();

  const totalCommission = (teamData?.level1?.commission ?? 0) + (teamData?.level2?.commission ?? 0) + (teamData?.level3?.commission ?? 0);
  const totalMembers = (teamData?.level1?.count ?? 0) + (teamData?.level2?.count ?? 0) + (teamData?.level3?.count ?? 0);

  if (isLoading || !teamData) {
      return (
           <div className="grid gap-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Team</h1>
                    <p className="text-muted-foreground">
                    View your team's structure, commissions, and performance.
                    </p>
                </div>
                 <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-4 w-1/3" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-12 w-3/4" />
                    </CardContent>
                </Card>
                 <div className="grid md:grid-cols-3 gap-4">
                    <Card><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
                    <Card><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
                    <Card><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
                </div>
            </div>
      )
  }

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Team</h1>
        <p className="text-muted-foreground">
          View your team's structure, commissions, and performance.
        </p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Total Team Commission</CardTitle>
            <CardDescription>The total earnings from all your team layers.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-500 mr-4" />
                <div>
                    <p className="text-3xl font-bold">${totalCommission.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Total from {totalMembers} members across 3 Layers</p>
                </div>
            </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Level 1</CardTitle>
                    <span className="text-sm font-bold text-primary">{commissionRates.level1}%</span>
                </div>
                <CardDescription>Direct Referrals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                 <div className="flex items-center">
                    <UserPlus className="h-5 w-5 text-muted-foreground mr-3" />
                    <p className="font-semibold">{teamData.level1.count} Members</p>
                 </div>
                 <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-muted-foreground mr-3" />
                    <p className="font-semibold">${teamData.level1.commission.toFixed(2)}</p>
                 </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                 <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Level 2</CardTitle>
                    <span className="text-sm font-bold text-primary">{commissionRates.level2}%</span>
                </div>
                <CardDescription>Indirect Referrals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                 <div className="flex items-center">
                    <UserPlus className="h-5 w-5 text-muted-foreground mr-3" />
                    <p className="font-semibold">{teamData.level2.count} Members</p>
                 </div>
                 <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-muted-foreground mr-3" />
                    <p className="font-semibold">${teamData.level2.commission.toFixed(2)}</p>
                 </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                 <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Level 3</CardTitle>
                    <span className="text-sm font-bold text-primary">{commissionRates.level3}%</span>
                </div>
                <CardDescription>Indirect Referrals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                 <div className="flex items-center">
                    <UserPlus className="h-5 w-5 text-muted-foreground mr-3" />
                    <p className="font-semibold">{teamData.level3.count} Members</p>
                 </div>
                 <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-muted-foreground mr-3" />
                    <p className="font-semibold">${teamData.level3.commission.toFixed(2)}</p>
                 </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
