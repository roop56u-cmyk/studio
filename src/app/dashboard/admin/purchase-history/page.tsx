
"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { Activity } from "@/contexts/RequestContext";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Flame, CheckCheck, User, Calendar, Tag, Star } from "lucide-react";
import { levels as defaultLevels, Level } from "@/components/dashboard/level-tiers";

const getLevelForUser = (userEmail: string, users: any[], platformLevels: Level[]): number => {
    const user = users.find(u => u.email === userEmail);
    if (!user) return 0;
    if (user.overrideLevel !== null && user.overrideLevel !== undefined) {
        return user.overrideLevel;
    }
    const taskBalance = parseFloat(localStorage.getItem(`${user.email}_taskRewardsBalance`) || '0');
    const interestBalance = parseFloat(localStorage.getItem(`${user.email}_interestEarningsBalance`) || '0');
    const committedBalance = taskBalance + interestBalance;
    const purchasedReferrals = parseInt(localStorage.getItem(`${user.email}_purchased_referrals`) || '0');
    const directReferralsCount = users.filter(u => u.referredBy === user.referralCode).length + purchasedReferrals;

    return platformLevels.slice().reverse().find((l: Level) => {
        if (l.level === 0) return false;
        return committedBalance >= l.minAmount && directReferralsCount >= l.referrals;
    })?.level ?? 0;
};

export default function PurchaseHistoryPage() {
  const { users } = useAuth();
  const [purchaseHistory, setPurchaseHistory] = useState<Activity[]>([]);
  const [platformLevels, setPlatformLevels] = useState<Level[]>(defaultLevels);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        let allHistory: Activity[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.endsWith('_activityHistory')) {
                const userHistory = JSON.parse(localStorage.getItem(key) || '[]');
                const userEmail = key.replace('_activityHistory', '');
                const purchases = userHistory
                    .filter((item: Activity) => item.type === 'Booster Purchase' || item.type === 'Quest Reward')
                    .map((item: Activity) => ({ ...item, user: userEmail }));
                allHistory = [...allHistory, ...purchases];
            }
        }
        allHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setPurchaseHistory(allHistory);

        const storedLevels = localStorage.getItem("platform_levels");
        if (storedLevels) {
            setPlatformLevels(JSON.parse(storedLevels));
        }
    }
  }, []);

  const historyWithLevels = useMemo(() => {
      return purchaseHistory.map(item => ({
          ...item,
          level: getLevelForUser((item as any).user, users, platformLevels)
      }));
  }, [purchaseHistory, users, platformLevels]);

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Purchase History</h1>
        <p className="text-muted-foreground">
          A log of all booster packs and quests purchased or claimed by users.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>History Log</CardTitle>
          <CardDescription>
            Chronological record of user purchases and reward claims.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {historyWithLevels.length > 0 ? (
                        historyWithLevels.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{(item as any).user}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary">Lvl {(item as any).level}</Badge>
                                </TableCell>
                                <TableCell>{item.description}</TableCell>
                                <TableCell>
                                    <Badge variant={item.type === 'Booster Purchase' ? 'default' : 'outline'}>
                                        {item.type === 'Booster Purchase' ? 
                                            <Flame className="mr-1 h-3 w-3"/> : 
                                            <CheckCheck className="mr-1 h-3 w-3"/>
                                        }
                                        {item.type}
                                    </Badge>
                                </TableCell>
                                <TableCell>{format(new Date(item.date), "PPpp")}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center">No purchase history found.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
