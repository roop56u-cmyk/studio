
"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { Button } from "@/components/ui/button";
import { Flame, CheckCheck, User, Calendar, Tag, Star } from "lucide-react";
import { levels as defaultLevels, Level } from "@/components/dashboard/level-tiers";
import type { User as AuthUser } from "@/contexts/AuthContext";
import { useTeam } from "@/contexts/TeamContext";

const ITEMS_PER_PAGE = 10;

export default function PurchaseHistoryPage() {
  const { users } = useAuth();
  const { getLevelForUser } = useTeam();
  const [purchaseHistory, setPurchaseHistory] = useState<Activity[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

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
    }
  }, []);

  const historyWithLevels = useMemo(() => {
      return purchaseHistory.map(item => {
          const user = users.find(u => u.email === (item as any).user);
          return {
              ...item,
              level: user ? getLevelForUser(user, users) : 0
          };
      });
  }, [purchaseHistory, users, getLevelForUser]);

  const totalPages = Math.ceil(historyWithLevels.length / ITEMS_PER_PAGE);
  const paginatedHistory = historyWithLevels.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

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
                    {paginatedHistory.length > 0 ? (
                        paginatedHistory.map((item) => (
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
         {totalPages > 1 && (
            <CardFooter className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </CardFooter>
          )}
      </Card>
    </div>
  );
}
