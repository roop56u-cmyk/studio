
"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Check, CheckCircle, Gift } from "lucide-react";
import type { Quest } from "@/app/dashboard/admin/quests/page";
import { useWallet } from "@/contexts/WalletContext";
import { ScrollArea } from "../ui/scroll-area";

export function QuestPanel() {
    const { toast } = useToast();
    const { addRecharge, currentLevel } = useWallet();
    const [quests, setQuests] = useState<Quest[]>([]);
    const [completedQuests, setCompletedQuests] = useState<string[]>([]);
    
    useEffect(() => {
        const storedQuests = localStorage.getItem("platform_quests");
        if (storedQuests) {
            setQuests(JSON.parse(storedQuests));
        }

        const storedCompleted = localStorage.getItem("completed_quests_today");
        if (storedCompleted) {
            const completedData = JSON.parse(storedCompleted);
            const today = new Date().toISOString().split('T')[0];
            if(completedData.date === today) {
                setCompletedQuests(completedData.quests);
            } else {
                localStorage.removeItem("completed_quests_today");
            }
        }
    }, []);

    const handleClaim = (questId: string, reward: number) => {
        const newCompleted = [...completedQuests, questId];
        setCompletedQuests(newCompleted);

        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem("completed_quests_today", JSON.stringify({ date: today, quests: newCompleted }));
        
        addRecharge(reward);

        toast({
            title: "Quest Reward Claimed!",
            description: `You have received $${reward.toFixed(2)} in your main wallet.`
        });
    }

    const isQuestCompleted = (questId: string) => {
        return completedQuests.includes(questId);
    }
    
    const availableQuests = quests.filter(q => q.level === 0 || q.level === currentLevel);

  return (
    <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="grid gap-4 pr-6">
            {availableQuests.length > 0 ? (
            availableQuests.map((quest) => (
                <Card key={quest.id} className="flex flex-col">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Gift className="h-5 w-5 text-primary" />
                                    {quest.title}
                                </CardTitle>
                                <CardDescription className="mt-2">{quest.description}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardFooter className="flex justify-between items-center mt-auto bg-muted/50 py-3 px-4">
                        <div className="text-lg font-bold text-primary">${quest.reward.toFixed(2)}</div>
                        <Button 
                            disabled={isQuestCompleted(quest.id)}
                            onClick={() => handleClaim(quest.id, quest.reward)}
                        >
                            {isQuestCompleted(quest.id) ? (
                                <>
                                 <CheckCircle className="mr-2 h-4 w-4" /> Claimed
                                </>
                            ) : "Claim Reward"}
                        </Button>
                    </CardFooter>
                </Card>
            ))
            ) : (
            <p className="text-muted-foreground col-span-full text-center py-12">No daily quests are available for your level at the moment. Please check back later.</p>
            )}
        </div>
    </ScrollArea>
  );
}
