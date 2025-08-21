import { RechargePanel } from "@/components/dashboard/recharge-panel";

export default function RechargePage() {
  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Recharge Wallet</h1>
        <p className="text-muted-foreground">
          Add USDT (BEP20) to your account.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <RechargePanel />
      </div>
    </div>
  );
}
