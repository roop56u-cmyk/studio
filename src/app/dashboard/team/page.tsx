
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, DollarSign, ChevronRight, UserPlus } from "lucide-react";

// Mock data for demonstration
const teamData = {
    level1: { count: 5, commission: 125.50 },
    level2: { count: 12, commission: 250.75 },
    level3: { count: 28, commission: 480.20 },
};

const commissionRates = {
    level1: "10%",
    level2: "5%",
    level3: "2%",
};

export default function TeamPage() {
  const totalCommission = teamData.level1.commission + teamData.level2.commission + teamData.level3.commission;

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
                    <p className="text-xs text-muted-foreground">Total from 3 Layers</p>
                </div>
            </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Level 1</CardTitle>
                    <span className="text-sm font-bold text-primary">{commissionRates.level1}</span>
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
                    <span className="text-sm font-bold text-primary">{commissionRates.level2}</span>
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
                    <span className="text-sm font-bold text-primary">{commissionRates.level3}</span>
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
