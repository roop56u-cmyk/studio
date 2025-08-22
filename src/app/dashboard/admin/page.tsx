
"use client";

import { AdminProfile } from "@/components/dashboard/admin-profile";
import { AdminFeeCalculator } from "@/components/dashboard/admin-fee-calculator";

export default function AdminDashboardPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <AdminProfile />
        </div>
        <div>
            <AdminFeeCalculator />
        </div>
    </div>
  );
}
