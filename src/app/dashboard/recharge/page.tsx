
"use client";

import { RechargePanel } from "@/components/dashboard/recharge-panel";
import { useWallet } from "@/contexts/WalletContext";
import { useRequests } from "@/contexts/RequestContext";

export default function RechargePage() {
    const { addRecharge } = useWallet();
    const { addRequest } = useRequests();

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Recharge Wallet</h1>
        <p className="text-muted-foreground">
          Add USDT (BEP20) to your account by submitting a recharge request.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <RechargePanel onRecharge={addRecharge} onAddRequest={addRequest} />
      </div>
    </div>
  );
}
