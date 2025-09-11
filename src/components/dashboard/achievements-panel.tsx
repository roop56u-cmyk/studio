
"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/contexts/WalletContext";
import { CheckCircle, Lock, Users, ListChecks, CalendarDays, BarChart4, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isUnlocked: boolean;
};

export function AchievementsPanel() {
  const { currentUser, users } = useAuth();
  const { completedTasks, currentLevel, mintNft } = useWallet();
  const [isMinting, setIsMinting] = useState<string | null>(null);
  const [isNftFeatureEnabled, setIsNftFeatureEnabled] = useState(false);

  useEffect(() => {
    const settings = localStorage.getItem("nft_market_settings");
    if (settings) {
        setIsNftFeatureEnabled(JSON.parse(settings).isNftEnabled ?? false);
    }
  }, []);

  const achievements = useMemo((): Achievement[] => {
    if (!currentUser) return [];

    const totalReferrals = users.filter(u => u.referredBy === currentUser.referralCode).length;

    return [
      {
        id: "task-10",
        title: "Task Novice",
        description: "Complete 10 tasks.",
        icon: <ListChecks className="h-6 w-6 text-blue-500" />,
        isUnlocked: completedTasks.length >= 10,
      },
      {
        id: "task-100",
        title: "Task Apprentice",
        description: "Complete 100 tasks.",
        icon: <ListChecks className="h-6 w-6 text-blue-500" />,
        isUnlocked: completedTasks.length >= 100,
      },
      {
        id: "task-500",
        title: "Task Master",
        description: "Complete 500 tasks.",
        icon: <ListChecks className="h-6 w-6 text-blue-500" />,
        isUnlocked: completedTasks.length >= 500,
      },
      {
        id: "referral-1",
        title: "Team Builder",
        description: "Recruit your first team member.",
        icon: <Users className="h-6 w-6 text-green-500" />,
        isUnlocked: totalReferrals >= 1,
      },
      {
        id: "referral-10",
        title: "Team Leader",
        description: "Recruit 10 team members.",
        icon: <Users className="h-6 w-6 text-green-500" />,
        isUnlocked: totalReferrals >= 10,
      },
      {
        id: "level-3",
        title: "Gold Tier",
        description: "Reach Investment Level 3.",
        icon: <BarChart4 className="h-6 w-6 text-yellow-500" />,
        isUnlocked: currentLevel >= 3,
      },
      {
        id: "level-5",
        title: "Diamond Tier",
        description: "Reach Investment Level 5.",
        icon: <BarChart4 className="h-6 w-6 text-yellow-500" />,
        isUnlocked: currentLevel >= 5,
      },
    ];
  }, [currentUser, completedTasks, currentLevel, users]);

  const handleMint = async (achievement: Achievement) => {
    setIsMinting(achievement.id);
    await mintNft(achievement.title);
    setIsMinting(null);
  };

  return (
    <ScrollArea className="h-[calc(100vh-8rem)]">
      <div className="grid gap-4 pr-6">
        {achievements.map((achievement) => (
          <Card key={achievement.id} className={cn("transition-all", achievement.isUnlocked ? "bg-card" : "bg-muted")}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className={cn("p-3 rounded-full", achievement.isUnlocked ? "bg-primary/10" : "bg-foreground/10")}>
                {achievement.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{achievement.title}</h3>
                <p className="text-sm text-muted-foreground">{achievement.description}</p>
              </div>
              {achievement.isUnlocked ? (
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
              ) : (
                <Lock className="h-6 w-6 text-muted-foreground flex-shrink-0" />
              )}
            </CardContent>
            {isNftFeatureEnabled && achievement.isUnlocked && (
              <CardFooter className="p-2 pt-0">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleMint(achievement)}
                    disabled={isMinting === achievement.id}
                   >
                     {isMinting === achievement.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                      )}
                    Mint NFT
                  </Button>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
