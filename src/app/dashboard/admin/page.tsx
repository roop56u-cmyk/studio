
"use client";

import { AdminProfile } from "@/components/dashboard/admin-profile";
import { AdminFeeCalculator } from "@/components/dashboard/admin-fee-calculator";

export default function AdminDashboardPage() {
  return (
    <div className="grid gap-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">
            Welcome, Admin. Manage user requests and platform settings.
            </p>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2">
                <AdminProfile />
            </div>
            <div>
                <AdminFeeCalculator />
            </div>
        </div>
    </div>
  );
}
