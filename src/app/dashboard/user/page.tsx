
"use client";

import { ReferralCard } from "@/components/dashboard/referral-card";
import { ReviewForm } from "@/components/dashboard/review-form";
import { InterestCounterPanel } from "@/components/dashboard/interest-counter-panel";
import { LevelTiers } from "@/components/dashboard/level-tiers";
import { WalletBalance } from "@/components/dashboard/wallet-balance";
import { HistoryPanel } from "@/components/dashboard/history-panel";
import { useWallet } from "@/contexts/WalletContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Lock } from "lucide-react";
import { EarningsPanel } from "@/components/dashboard/earnings-panel";

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

  const isTaskLocked = taskRewardsBalance < 100;
  const isInterestLocked = interestEarningsBalance < 100;
  const areBothLocked = isTaskLocked && isInterestLocked;


  if (isLoading) {
    return (
        <div className="grid gap-8">
            <div>
                <Skeleton className="h-9 w-1/2" />
                <Skeleton className="h-5 w-1/3 mt-2" />
            </div>
             <div className="space-y-8">
                <Skeleton className="h-48 w-full" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <Skeleton className="h-40 w-full" />
                         <Skeleton className="h-40 w-full" />
                    </div>
                     <Skeleton className="h-64 w-full" />
                </div>
                <div className="space-y-8">
                    <div className="grid grid-cols-1 gap-8">
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
    <div className="grid gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's your space to manage reviews.
        </p>
      </div>
       <div className="space-y-8">
          <LevelTiers currentBalance={committedBalance} />
        </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
          {areBothLocked ? (
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
          ) : (
            <>
              {isTaskLocked ? (
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center"><Lock className="mr-2 h-5 w-5" /> Review Tasks Locked</CardTitle>
                        <CardDescription>Move at least $100 to the Task Rewards wallet to unlock reviews.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <p className="text-sm text-muted-foreground">Your current Task Rewards balance is ${taskRewardsBalance.toFixed(2)}.</p>
                    </CardContent>
                </Card>
              ) : (
                <ReviewForm />
              )}
            </>
          )}
        </div>
        <div className="space-y-8">
            <div className="grid grid-cols-1 gap-8">
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
      <div>
        <HistoryPanel />
      </div>
    </div>
  );
}
