

"use client";

import React from "react";
import { InterestCounterPanel } from "@/components/dashboard/interest-counter-panel";
import { LevelTiers, Level, levels } from "@/components/dashboard/level-tiers";
import { WalletBalance } from "@/components/dashboard/wallet-balance";
import { useWallet } from "@/contexts/WalletContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Lock } from "lucide-react";
import { TaskDialog } from "@/components/dashboard/task-dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";


export type PanelConfig = {
    id: string;
    name: string;
    enabled: boolean;
};

export const defaultPanelConfig: PanelConfig[] = [
    { id: "levelTiers", name: "Investment Levels", enabled: true },
    { id: "walletBalances", name: "Wallet Balances", enabled: true },
    { id: "interestCounter", name: "Interest Counter", enabled: true },
    { id: "referralCard", name: "Referral Card", enabled: false },
    { id: "transactionHistory", name: "Transaction History", enabled: true },
    { id: "taskHistory", name: "Task History", enabled: true },
    { id: "featureLock", name: "Feature Lock Notice", enabled: true },
];

export default function UserDashboardPage() {
  const { 
    mainBalance, 
    taskRewardsBalance, 
    interestEarningsBalance, 
    isLoading,
    dailyTaskQuota,
    tasksCompletedToday,
    handleMoveFunds,
    currentLevel,
    committedBalance,
    minRequiredBalanceForLevel
  } = useWallet();
  const [panelConfig, setPanelConfig] = React.useState<PanelConfig[]>(defaultPanelConfig);

  React.useEffect(() => {
    const storedConfig = localStorage.getItem("user_panel_config");
    if (storedConfig) {
      setPanelConfig(JSON.parse(storedConfig));
    }
  }, []);

  const [isTaskDialogOpen, setIsTaskDialogOpen] = React.useState(false);
  const [isBalanceWarningOpen, setIsBalanceWarningOpen] = React.useState(false);

  const minBalanceForLevel = minRequiredBalanceForLevel(currentLevel);
  const hasSufficientBalance = committedBalance >= minBalanceForLevel;

  const allTasksCompleted = tasksCompletedToday >= dailyTaskQuota;
  const isTaskLocked = currentLevel === 0 || !hasSufficientBalance;
  const isInterestLocked = currentLevel === 0 || !hasSufficientBalance;
  
  const finalIsTaskLocked = isTaskLocked || allTasksCompleted;

  const handleStartTasks = () => {
    if (isTaskLocked) {
        setIsBalanceWarningOpen(true);
    } else {
        setIsTaskDialogOpen(true);
    }
  }

  const isPanelEnabled = (id: string) => panelConfig.find(p => p.id === id)?.enabled ?? false;

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto">
        <div className="flex flex-col gap-4">
            <div>
                <Skeleton className="h-9 w-1/2" />
                <Skeleton className="h-5 w-3/4 mt-2" />
            </div>
             <div className="space-y-4">
                <Skeleton className="h-48 w-full" />
            </div>
            <div className="space-y-4">
                 <Skeleton className="h-24 w-full" />
                 <Skeleton className="h-24 w-full" />
                 <Skeleton className="h-24 w-full" />
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Home</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your space to manage reviews.
          </p>
        </div>
        {isPanelEnabled("levelTiers") && (
         <div className="space-y-4">
            <LevelTiers 
              onStartTasks={handleStartTasks}
              isTaskLocked={finalIsTaskLocked}
            />
          </div>
        )}
        <div className="space-y-4">
            {isPanelEnabled("walletBalances") && (
                <WalletBalance
                    accentColor="bg-chart-1"
                    title="Task Rewards"
                    balance={taskRewardsBalance.toFixed(2)}
                    description="Balance from completed tasks."
                    onMoveToMain={(amount) => handleMoveFunds('Main Wallet', amount, 'Task Rewards')}
                    showMoveToOther={true}
                />
            )}
            {isPanelEnabled("walletBalances") && (
                <WalletBalance
                    accentColor="bg-chart-2"
                    title="Interest Earnings"
                    balance={interestEarningsBalance.toFixed(2)}
                    description="Balance from interest."
                    onMoveToMain={(amount) => handleMoveFunds('Main Wallet', amount, 'Interest Earnings')}
                    showMoveToOther={true}
                />
            )}
            {isPanelEnabled("interestCounter") && (
                <InterestCounterPanel
                    accentColor="bg-chart-3"
                    title="Daily Interest"
                    isLocked={isInterestLocked}
                    balance={interestEarningsBalance}
                    counterType="interest"
                />
            )}
             {isPanelEnabled("featureLock") && (
                <>
                    {(isTaskLocked && isInterestLocked) ? (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center"><Lock className="mr-2 h-5 w-5" /> Features Locked</CardTitle>
                            <CardDescription>Commit funds and invite friends to unlock platform features.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm mb-2">
                                To unlock Level 1, you must commit at least <strong>$100 to Task Rewards or Interest Earnings</strong>.
                            </p>
                            <p className="text-sm mb-4">
                                Higher levels may also require inviting a certain number of friends. Check the level details above.
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
      </div>
      
      <TaskDialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
      />
       <AlertDialog open={isBalanceWarningOpen} onOpenChange={setIsBalanceWarningOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Insufficient Balance</AlertDialogTitle>
                    <AlertDialogDescription>
                        Your committed balance of ${committedBalance.toFixed(2)} is below the ${minBalanceForLevel.toLocaleString()} minimum required for Level {currentLevel}.
                        Please add more funds to your Task or Interest wallets to start tasks.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={() => setIsBalanceWarningOpen(false)}>OK</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
