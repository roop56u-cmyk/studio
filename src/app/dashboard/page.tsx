import { AdminProfile } from "@/components/dashboard/admin-profile";
import { ReferralCard } from "@/components/dashboard/referral-card";
import { ReviewForm } from "@/components/dashboard/review-form";
import { WalletPanel } from "@/components/dashboard/wallet-panel";

export default function DashboardPage() {
  const isAdmin = true; // Hardcoded for now

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          {isAdmin
            ? "Welcome, Admin. Manage user requests."
            : "Welcome back! Here's your space to manage reviews."}
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {isAdmin ? <AdminProfile /> : <ReviewForm />}
        </div>
        <div className="space-y-8">
          <ReferralCard />
          {!isAdmin && <WalletPanel />}
        </div>
      </div>
    </div>
  );
}
