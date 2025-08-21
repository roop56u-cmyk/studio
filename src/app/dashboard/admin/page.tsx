
"use client";

import { AdminProfile } from "@/components/dashboard/admin-profile";
import { RateDisplayPanel } from "@/components/dashboard/interest-rate-counter";

export default function AdminDashboardPage() {
  return (
    <div className="grid gap-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">
            Welcome, Admin. Manage user requests.
            </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-3">
                <AdminProfile />
            </div>
            <div className="space-y-8">
                <RateDisplayPanel title="Platform Interest Rate" isLocked={false} rate={1.8} />
            </div>
        </div>
    </div>
  );
}
