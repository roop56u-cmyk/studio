
"use client";

import { ReferralCard } from "@/components/dashboard/referral-card";
import { ReviewForm } from "@/components/dashboard/review-form";
import { InterestRateCounter } from "@/components/dashboard/interest-rate-counter";
import { LevelTiers } from "@/components/dashboard/level-tiers";
import { WalletBalance } from "@/components/dashboard/wallet-balance";

// This interface defines the props that are passed down from the layout.
interface UserDashboardPageProps {
    taskRewardsBalance?: number;
    interestEarningsBalance?: number;
}

export default function UserDashboardPage({ taskRewardsBalance = 0, interestEarningsBalance = 0 }: UserDashboardPageProps) {
  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's your space to manage reviews.
        </p>
      </div>
       <div className="space-y-8">
          <LevelTiers />
        </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <WalletBalance 
            title="Task Rewards"
            balance={taskRewardsBalance.toFixed(2)}
            description="Balance from completed tasks."
          />
          <ReviewForm />
        </div>
        <div className="space-y-8">
           <WalletBalance 
            title="Interest Earnings"
            balance={interestEarningsBalance.toFixed(2)}
            description="Balance from interest."
          />
          <InterestRateCounter />
          <ReferralCard />
        </div>
      </div>
    </div>
  );
}
