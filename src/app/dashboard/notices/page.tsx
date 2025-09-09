
"use client";

import { NoticesPanel } from "@/components/dashboard/notices-panel";

export default function NoticesPage() {
    // This page remains for direct navigation if needed,
    // but the primary user access is now through the popup panel.
    return (
        <NoticesPanel />
    )
}
