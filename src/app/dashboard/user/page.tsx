
"use client";

import { ReferralCard } from "@/components/dashboard/referral-card";
import { ReviewForm } from "@/components/dashboard/review-form";
import { InterestRateCounter } from "@/components/dashboard/interest-rate-counter";
import { LevelTiers } from "@/components/dashboard/level-tiers";
import { WalletBalance } from "@/components/dashboard/wallet-balance";
import { HistoryPanel } from "@/components/dashboard/history-panel";
import { useWallet } from "@/contexts/WalletContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export default function UserDashboardPage() {
  const { mainBalance, taskRewardsBalance, interestEarningsBalance } = useWallet();
  const committedBalance = taskRewardsBalance + interestEarningsBalance;
  const isLocked = committedBalance < 100;

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
            <WalletBalance 
              title="Task Rewards"
              balance={taskRewardsBalance.toFixed(2)}
              description="Balance from completed tasks."
            />
             <WalletBalance 
              title="Interest Earnings"
              balance={interestEarningsBalance.toFixed(2)}
              description="Balance from interest."
            />
          </div>
          {isLocked ? (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><Lock className="mr-2 h-5 w-5" /> Features Locked</CardTitle>
                    <CardDescription>Move at least $100 to Task or Interest wallets to unlock reviews.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm mb-4">
                        Your current committed balance is ${committedBalance.toFixed(2)}. Move funds from your main wallet using the sidebar to reach Level 1 and start completing tasks.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Your main balance is ${mainBalance.toFixed(2)}.
                    </p>
                </CardContent>
            </Card>
          ) : (
            <ReviewForm />
          )}
        </div>
        <div className="space-y-8">
          <InterestRateCounter isLocked={isLocked} />
          <ReferralCard />
        </div>
      </div>
      <div>
        <HistoryPanel />
      </div>
    </div>
  );
}
