
"use client";

import React from "react";
import { ReferralCard } from "@/components/dashboard/referral-card";
import { InterestCounterPanel } from "@/components/dashboard/interest-counter-panel";
import { LevelTiers, Level } from "@/components/dashboard/level-tiers";
import { WalletBalance } from "@/components/dashboard/wallet-balance";
import { TransactionHistoryPanel } from "@/components/dashboard/transaction-history-panel";
import { TaskHistoryPanel } from "@/components/dashboard/task-history-panel";
import { useWallet } from "@/contexts/WalletContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Lock } from "lucide-react";
import { EarningsPanel } from "@/components/dashboard/earnings-panel";
import { TaskDialog } from "@/components/dashboard/task-dialog";
import { LevelDetailDialog } from "@/components/dashboard/level-detail-dialog";


export default function UserDashboardPage() {
  const { 
    mainBalance, 
    taskRewardsBalance, 
    interestEarningsBalance, 
    taskRewardsEarned,
    interestEarned,
    committedBalance,
    isLoading 
  } = useWallet();

  const [isTaskDialogOpen, setIsTaskDialogOpen] = React.useState(false);
  const [selectedLevel, setSelectedLevel] = React.useState<Level | null>(null);

  const isTaskLocked = taskRewardsBalance < 100;
  const isInterestLocked = interestEarningsBalance < 100;

  if (isLoading) {
    return (
        <div className="grid gap-4">
            <div>
                <Skeleton className="h-9 w-1/2" />
                <Skeleton className="h-5 w-3/3 mt-2" />
            </div>
             <div className="space-y-4">
                <Skeleton className="h-48 w-full" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <Skeleton className="h-40 w-full" />
                         <Skeleton className="h-40 w-full" />
                    </div>
                     <Skeleton className="h-64 w-full" />
                </div>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <Skeleton className="h-32 w-full" />
                      <Skeleton className="h-32 w-full" />
                    </div>
                    <Skeleton className="h-40 w-full" />
                </div>
            </div>
             <div>
                <Skeleton className="h-64 w-full" />
            </div>
        </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's your space to manage reviews.
        </p>
      </div>
       <div className="space-y-4">
          <LevelTiers 
            currentBalance={committedBalance} 
            onLevelSelect={setSelectedLevel}
          />
        </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <WalletBalance 
                title="Task Rewards"
                balance={taskRewardsBalance.toFixed(2)}
                description="Balance from completed tasks."
                />
                <EarningsPanel 
                    title="Total Earned"
                    amount={taskRewardsEarned.toFixed(2)}
                />
            </div>
             <div className="space-y-2">
                <WalletBalance 
                title="Interest Earnings"
                balance={interestEarningsBalance.toFixed(2)}
                description="Balance from interest."
                />
                 <EarningsPanel 
                    title="Total Earned"
                    amount={interestEarned.toFixed(2)}
                />
            </div>
          </div>
          {(isTaskLocked && isInterestLocked) && (
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><Lock className="mr-2 h-5 w-5" /> Features Locked</CardTitle>
                    <CardDescription>Commit funds to unlock platform features.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm mb-2">
                        Move a minimum of <strong>$100 to Task Rewards</strong> to unlock the review tasks.
                    </p>
                     <p className="text-sm mb-4">
                        Move a minimum of <strong>$100 to Interest Earnings</strong> to unlock the interest rate counter.
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Your main balance is ${mainBalance.toFixed(2)}. Use the sidebar wallet to move funds.
                    </p>
                </CardContent>
            </Card>
          )}
        </div>
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
                <InterestCounterPanel
                    title="Daily Interest"
                    isLocked={isInterestLocked}
                    balance={interestEarningsBalance}
                    counterType="interest"
                />
            </div>
          <ReferralCard />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TransactionHistoryPanel />
        <TaskHistoryPanel />
      </div>
      <TaskDialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen} />

      {selectedLevel && (
        <LevelDetailDialog
          level={selectedLevel}
          open={!!selectedLevel}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setSelectedLevel(null);
            }
          }}
          isCurrentLevel={selectedLevel.level === (levels.slice().reverse().find(l => committedBalance >= l.minAmount)?.level ?? 0)}
          isTaskLocked={isTaskLocked}
          onStartTasks={() => {
              setSelectedLevel(null); // Close detail dialog
              setIsTaskDialogOpen(true); // Open task dialog
          }}
        />
      )}
    </div>
  );
}
