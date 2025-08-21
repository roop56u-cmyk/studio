import { ReferralCard } from "@/components/dashboard/referral-card";
import { ReviewForm } from "@/components/dashboard/review-form";
import { InterestRateCounter } from "@/components/dashboard/interest-rate-counter";
import { LevelTiers } from "@/components/dashboard/level-tiers";
import { WalletBalance } from "@/components/dashboard/wallet-balance";

export default function UserDashboardPage() {
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
          <div className="space-y-2">
            <h2 className="text-xl font-semibold tracking-tight">Task Rewards</h2>
            <WalletBalance />
          </div>
          <ReviewForm />
        </div>
        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold tracking-tight">Interest Earnings</h2>
            <WalletBalance />
          </div>
          <InterestRateCounter />
          <ReferralCard />
        </div>
      </div>
    </div>
  );
}
