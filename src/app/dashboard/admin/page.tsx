
"use client";

import { AdminProfile } from "@/components/dashboard/admin-profile";

export default function AdminDashboardPage() {
  return (
    <div className="grid gap-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">
            Welcome, Admin. Manage user requests.
            </p>
        </div>
        <div className="grid grid-cols-1">
            <AdminProfile />
        </div>
    </div>
  );
}
