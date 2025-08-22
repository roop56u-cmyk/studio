

"use client";

import React from "react";
import { ReferralCard } from "@/components/dashboard/referral-card";
import { InterestCounterPanel } from "@/components/dashboard/interest-counter-panel";
import { LevelTiers, Level, levels } from "@/components/dashboard/level-tiers";
import { WalletBalance } from "@/components/dashboard/wallet-balance";
import { useWallet } from "@/contexts/WalletContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Lock } from "lucide-react";
import { TaskDialog } from "@/components/dashboard/task-dialog";


export type PanelConfig = {
    id: string;
    name: string;
    enabled: boolean;
};

export const defaultPanelConfig: PanelConfig[] = [
    { id: "levelTiers", name: "Investment Levels", enabled: true },
    { id: "walletBalances", name: "Wallet Balances", enabled: true },
    { id: "interestCounter", name: "Interest Counter", enabled: true },
    { id: "referralCard", name: "Referral Card", enabled: true },
    { id: "transactionHistory", name: "Transaction History", enabled: true },
    { id: "taskHistory", name: "Task History", enabled: true },
    { id: "featureLock", name: "Feature Lock Notice", enabled: true },
];

export default function UserDashboardPage() {
  const { 
    mainBalance, 
    taskRewardsBalance, 
    interestEarningsBalance, 
    committedBalance,
    isLoading,
    dailyTaskQuota,
    tasksCompletedToday,
    handleMoveFunds
  } = useWallet();
  const [panelConfig, setPanelConfig] = React.useState<PanelConfig[]>(defaultPanelConfig);

  React.useEffect(() => {
    const storedConfig = localStorage.getItem("user_panel_config");
    if (storedConfig) {
      setPanelConfig(JSON.parse(storedConfig));
    }
  }, []);

  const [isTaskDialogOpen, setIsTaskDialogOpen] = React.useState(false);

  const isTaskLocked = taskRewardsBalance < 100;
  const isInterestLocked = interestEarningsBalance < 100;
  
  const allTasksCompleted = tasksCompletedToday >= dailyTaskQuota;
  const finalIsTaskLocked = isTaskLocked || allTasksCompleted;

  const isPanelEnabled = (id: string) => panelConfig.find(p => p.id === id)?.enabled ?? false;

  if (isLoading) {
    return (
        <div className="grid gap-4">
            <div>
                <Skeleton className="h-9 w-1/2" />
                <Skeleton className="h-5 w-3/3 mt-2" />
            </div>
             <div className="space-y-4">
                <Skeleton className="h-48 w-full" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <Skeleton className="h-24 w-full" />
                         <Skeleton className="h-24 w-full" />
                    </div>
                     <Skeleton className="h-40 w-full" />
                </div>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <Skeleton className="h-32 w-full" />
                      <Skeleton className="h-32 w-full" />
                    </div>
                    <Skeleton className="h-24 w-full" />
                </div>
            </div>
             <div>
                <Skeleton className="h-64 w-full" />
            </div>
        </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's your space to manage reviews.
        </p>
      </div>
      {isPanelEnabled("levelTiers") && (
       <div className="space-y-4">
          <LevelTiers 
            currentBalance={committedBalance} 
            onStartTasks={() => setIsTaskDialogOpen(true)}
            isTaskLocked={finalIsTaskLocked}
          />
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {isPanelEnabled("walletBalances") && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <WalletBalance 
                    title="Task Rewards"
                    balance={taskRewardsBalance.toFixed(2)}
                    description="Balance from completed tasks."
                    onMoveToMain={(amount) => handleMoveFunds('Main Wallet', amount, 'Task Rewards')}
                    showMoveToOther={true}
                />
                <WalletBalance 
                    title="Interest Earnings"
                    balance={interestEarningsBalance.toFixed(2)}
                    description="Balance from interest."
                    onMoveToMain={(amount) => handleMoveFunds('Main Wallet', amount, 'Interest Earnings')}
                    showMoveToOther={true}
                />
            </div>
          )}
          {isPanelEnabled("featureLock") && (
            <>
                {(isTaskLocked && isInterestLocked) ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center"><Lock className="mr-2 h-5 w-5" /> Features Locked</CardTitle>
                        <CardDescription>Commit funds to unlock platform features.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm mb-2">
                            Move a minimum of <strong>$100 to Task Rewards</strong> to unlock the review tasks.
                        </p>
                        <p className="text-sm mb-4">
                            Move a minimum of <strong>$100 to Interest Earnings</strong> to unlock the interest rate counter.
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Your main balance is ${mainBalance.toFixed(2)}. Use the sidebar wallet to move funds.
                        </p>
                    </CardContent>
                </Card>
                ) : allTasksCompleted ? (
                <Card>
                    <CardHeader>
                        <CardTitle>All Tasks Completed!</CardTitle>
                        <CardDescription>You have reached your daily limit.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm">Please come back tomorrow for more tasks.</p>
                    </CardContent>
                </Card>
                ) : null}
            </>
          )}
        </div>
        <div className="space-y-4">
            {isPanelEnabled("interestCounter") && (
                <div className="grid grid-cols-1 gap-4">
                    <InterestCounterPanel
                        title="Daily Interest"
                        isLocked={isInterestLocked}
                        balance={interestEarningsBalance}
                        counterType="interest"
                    />
                </div>
            )}
        </div>
      </div>

      <TaskDialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
      />
    </div>
  );
}
