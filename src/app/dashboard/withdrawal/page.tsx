import { WithdrawalPanel } from "@/components/dashboard/withdrawal-panel";

export default function WithdrawalPage() {
  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Request Withdrawal</h1>
        <p className="text-muted-foreground">
          Withdraw USDT (BEP20) from your account.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <WithdrawalPanel />
      </div>
    </div>
  );
}
