
"use client";

import { RequestPanel } from "@/components/dashboard/request-panel";
import { AdminFeeCalculator } from "@/components/dashboard/admin-fee-calculator";
import { PlatformStats } from "@/components/dashboard/platform-stats";

export default function AdminDashboardPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-3">
            <PlatformStats />
        </div>
        <div className="lg:col-span-2">
            <RequestPanel />
        </div>
        <div>
            <AdminFeeCalculator />
        </div>
    </div>
  );
}
