
"use client";

import React from "react";
import { WithdrawalPanel } from "@/components/dashboard/withdrawal-panel";
import { useRequests } from "@/contexts/RequestContext";
import { useWallet } from "@/contexts/WalletContext";
import { Skeleton } from "@/components/ui/skeleton";


export default function WithdrawalPage() {
    const { addRequest } = useRequests();
    const [isClient, setIsClient] = React.useState(false);

    React.useEffect(() => {
        setIsClient(true);
    }, []);

    const handleAddRequest = (requestData: Omit<any, 'id' | 'date' | 'user' | 'status'>) => {
        addRequest({
            ...requestData,
            type: "Withdrawal",
        });
    }

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Request Withdrawal</h1>
        <p className="text-muted-foreground">
          Withdraw USDT (BEP20) from your account.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {isClient ? (
            <WithdrawalPanel onAddRequest={handleAddRequest} />
        ) : (
            <Skeleton className="h-[400px] w-full" />
        )}
      </div>
    </div>
  );
