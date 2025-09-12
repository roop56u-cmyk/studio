
"use client";

import React from "react";
import { InterestCounterPanel } from "@/components/dashboard/interest-counter-panel";
import { LevelTiers, Level, levels } from "@/components/dashboard/level-tiers";
import { WalletBalance } from "@/components/dashboard/wallet-balance";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Lock, CalendarCheck, PieChart, Trophy, CheckCircle } from "lucide-react";
import { TaskDialog } from "@/components/dashboard/task-dialog";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useWallet } from "@/contexts/WalletContext";
import { useAuth } from "@/contexts/AuthContext";



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
    { id: "dailyCheckIn", name: "Daily Check-in", enabled: true },
    { id: "nftCollection", name: "NFT Collection", enabled: true },
];

export default function UserDashboardPage() {
  const { currentUser } = useAuth();
  const { 
    mainBalance, 
    taskRewardsBalance, 
    interestEarningsBalance, 
    isLoading,
    dailyTaskQuota,
    tasksCompletedToday,
    handleMoveFunds,
    currentLevel,
    taskLevel,
    committedBalance,
    minRequiredBalanceForLevel,
    dailyRewardState,
    claimDailyReward,
    setIsInactiveWarningOpen,
    isInterestFeatureEnabled
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
  const [isCompletionDialogOpen, setIsCompletionDialogOpen] = React.useState(false);
  const [warningMessage, setWarningMessage] = React.useState("");

  const minBalanceForCurrentLevel = minRequiredBalanceForLevel(currentLevel);
  const minBalanceForTaskLevel = minRequiredBalanceForLevel(taskLevel);
  const hasSufficientTotalBalance = committedBalance >= minBalanceForCurrentLevel;
  const hasSufficientTaskBalance = taskRewardsBalance >= minBalanceForTaskLevel;
  
  const allTasksCompleted = tasksCompletedToday >= dailyTaskQuota;
  const isTaskLockedByLevel = taskLevel === 0;
  const isTaskLockedByBalance = !hasSufficientTaskBalance && taskLevel > 0;
  
  const finalIsTaskLocked = isTaskLockedByLevel || isTaskLockedByBalance || allTasksCompleted;
  const isInterestLocked = currentLevel === 0 || !hasSufficientTotalBalance;

  const handleStartTasks = () => {
    if (allTasksCompleted) {
        setIsCompletionDialogOpen(true);
        return;
    }
    if (isTaskLockedByLevel) {
        setWarningMessage(`Your Task Rewards balance is $${taskRewardsBalance.toFixed(2)}. You must have at least $${minRequiredBalanceForLevel(1).toLocaleString()} to start tasks.`);
        setIsBalanceWarningOpen(true);
    } else if (isTaskLockedByBalance) {
         setWarningMessage(`Your Task Rewards balance is $${taskRewardsBalance.toFixed(2)}. You need at least $${minBalanceForTaskLevel.toLocaleString()} in your Task Rewards wallet to start tasks for Level ${taskLevel}.`);
        setIsBalanceWarningOpen(true);
    } else {
        setIsTaskDialogOpen(true);
    }
  }

  const handleClaimDailyReward = () => {
    if (currentUser?.status !== 'active') {
        setIsInactiveWarningOpen(true);
        return;
    }
    claimDailyReward();
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
          <p className="text-foreground">
            Welcome back! Here's your space to manage reviews.
          </p>
        </div>
        {isPanelEnabled("dailyCheckIn") && dailyRewardState && dailyRewardState.isEnabled && (
            <Card className="bg-gradient-purple text-primary-foreground">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CalendarCheck className="h-5 w-5" />
                        Daily Check-in
                    </CardTitle>
                    <CardDescription className="text-primary-foreground/80">Claim your daily reward for logging in.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm">You are on a <strong className="font-bold">{dailyRewardState.streak} day</strong> streak. Keep it up!</p>
                </CardContent>
                <CardFooter>
                    <Button className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90" disabled={!dailyRewardState.canClaim} onClick={handleClaimDailyReward}>
                        {dailyRewardState.canClaim ? `Claim Today's Reward ($${dailyRewardState.reward.toFixed(2)})` : "Claimed Today"}
                    </Button>
                </CardFooter>
            </Card>
        )}
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
                    gradientClass="bg-gradient-orange"
                    title="Task Rewards"
                    balance={taskRewardsBalance.toFixed(2)}
                    description="Balance from completed tasks."
                    onMoveToMain={(amount) => handleMoveFunds('Main Wallet', amount, 'Task Rewards')}
                    showMoveToOther={true}
                />
            )}
            {isPanelEnabled("walletBalances") && isInterestFeatureEnabled && (
                <WalletBalance
                    gradientClass="bg-gradient-teal"
                    title="Interest Earnings"
                    balance={interestEarningsBalance.toFixed(2)}
                    description="Balance from interest."
                    onMoveToMain={(amount) => handleMoveFunds('Main Wallet', amount, 'Interest Earnings')}
                    showMoveToOther={true}
                />
            )}
            {isPanelEnabled("interestCounter") && isInterestFeatureEnabled &&(
                <InterestCounterPanel
                    gradientClass="bg-gradient-sky"
                    title="Daily Interest"
                    isLocked={isInterestLocked}
                    balance={interestEarningsBalance}
                    counterType="interest"
                />
            )}
             {allTasksCompleted && (
                 <Card className="bg-gradient-green text-primary-foreground">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-primary-foreground">
                            <CheckCircle className="h-5 w-5" />
                            All Tasks Completed!
                        </CardTitle>
                        <CardDescription className="text-primary-foreground/80">You have reached your daily limit.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-primary-foreground/90">Please come back tomorrow for more tasks.</p>
                    </CardContent>
                </Card>
            )}
             {isPanelEnabled("featureLock") && (
                <>
                    {(isTaskLockedByLevel && (isInterestLocked || !isInterestFeatureEnabled)) && !allTasksCompleted ? (
                    <Card className="bg-gradient-slate text-slate-100">
                        <CardHeader>
                            <CardTitle className="flex items-center"><Lock className="mr-2 h-5 w-5" /> Features Locked</CardTitle>
                            <CardDescription className="text-slate-300">Commit funds and invite friends to unlock platform features.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm mb-2">
                                To unlock Level 1, you must commit at least <strong>${minRequiredBalanceForLevel(1).toLocaleString()} to Task Rewards or Interest Earnings</strong>.
                            </p>
                            <p className="text-sm mb-4">
                                Higher levels may also require inviting a certain number of friends. Check the level details above.
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Your main balance is ${mainBalance.toFixed(2)}. Use the sidebar wallet to move funds.
                            </p>
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
                    <AlertDialogTitle>Action Required</AlertDialogTitle>
                    <AlertDialogDescription>
                       {warningMessage}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={() => setIsBalanceWarningOpen(false)}>OK</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        <AlertDialog open={isCompletionDialogOpen} onOpenChange={setIsCompletionDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>All Tasks Completed!</AlertDialogTitle>
                    <AlertDialogDescription>
                       You have reached your daily task limit. Please come back tomorrow for more tasks.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={() => setIsCompletionDialogOpen(false)}>OK</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
