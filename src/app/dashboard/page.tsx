import { ReviewForm } from "@/components/dashboard/review-form";
import { ReferralCard } from "@/components/dashboard/referral-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here&apos;s your space to manage reviews.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <ReviewForm />
        </div>
        <div className="space-y-8">
            <ReferralCard />
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>A summary of your latest reviews.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">No recent activity to show.</p>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
