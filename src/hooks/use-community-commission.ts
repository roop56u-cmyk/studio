
"use client";

import { useEffect, useCallback } from "react";
import { useTeam } from "@/contexts/TeamContext";
import { useWallet } from "@/contexts/WalletContext";
import { useAuth } from "@/contexts/AuthContext";
import type { User } from "@/contexts/AuthContext";

export function useCommunityCommission() {
  const { communityData, communityCommissionRules, activeL1Referrals, teamData, getLevelForUser } = useTeam();
  const { addCommunityCommissionToMainBalance } = useWallet();
  const { currentUser, users } = useAuth();
  
  const calculatePayout = useCallback(() => {
    if (!teamData || !currentUser || currentUser.status !== 'active') return;

    const applicableRule = [...communityCommissionRules]
        .sort((a, b) => b.requiredLevel - a.requiredLevel)
        .find(rule => rule.requiredLevel === 0 || getLevelForUser(currentUser, users) >= rule.requiredLevel);
    
    if (!applicableRule) return;

    const l1to3size = teamData.level1.count + teamData.level2.count + teamData.level3.count;
    const referralsMet = activeL1Referrals >= applicableRule.requiredDirectReferrals;
    const teamSizeMet = l1to3size >= applicableRule.requiredTeamSize;

    if (!referralsMet || !teamSizeMet) {
        // If conditions aren't met, we still need to mark this cycle as "processed"
        // to prevent re-triggering until the next reset.
        const lastCreditKey = `${currentUser.email}_lastCommunityCommissionCredit`;
        localStorage.setItem(lastCreditKey, new Date().toISOString());
        return;
    }

    // --- Start of new, isolated calculation logic ---
    const processedEmails = new Set<string>([currentUser.email]);
    const l1 = users.filter(u => u.referredBy === currentUser.referralCode);
    l1.forEach(u => processedEmails.add(u.email));
    const l2 = l1.flatMap(l1User => users.filter(u => u.referredBy === l1User.referralCode));
    l2.forEach(u => processedEmails.add(u.email));
    const l3 = l2.flatMap(l2User => users.filter(u => u.referredBy === l2User.referralCode));
    l3.forEach(u => processedEmails.add(u.email));

    const L4PlusMembers: User[] = [];
    let parentLayer = l3;
    while (parentLayer.length > 0) {
        const currentLayer = parentLayer.flatMap(parent => users.filter(u => u.referredBy === parent.referralCode && !processedEmails.has(u.email)));
        if (currentLayer.length === 0) break;
        L4PlusMembers.push(...currentLayer);
        currentLayer.forEach(u => processedEmails.add(u.email));
        parentLayer = currentLayer;
    }
    const activeL4PlusMembers = L4PlusMembers.filter(m => users.find(u => u.email === m.email)?.status === 'active');

    const lastCreditKey = `${currentUser.email}_lastCommunityCommissionCredit`;
    const lastCreditDateStr = localStorage.getItem(lastCreditKey);
    const lastCreditTime = lastCreditDateStr ? new Date(lastCreditDateStr).getTime() : 0;

    const totalEarningsForPayout = activeL4PlusMembers.reduce((sum, m) => {
        const completedTasksForCycle = JSON.parse(localStorage.getItem(`${m.email}_completedTasks`) || '[]')
            .filter((task: { completedAt: string }) => {
                const completedAt = new Date(task.completedAt).getTime();
                // Payout includes tasks completed since the last payout time.
                return completedAt >= lastCreditTime;
            });
        return sum + completedTasksForCycle.reduce((taskSum: number, task: { earnings: number }) => taskSum + task.earnings, 0);
    }, 0);
    // --- End of new, isolated calculation logic ---

    const commissionAmount = totalEarningsForPayout * (applicableRule.commissionRate / 100);

    if (commissionAmount > 0) {
      addCommunityCommissionToMainBalance(commissionAmount);
    }
    
    // Mark this payout cycle as complete *after* calculation and crediting.
    localStorage.setItem(lastCreditKey, new Date().toISOString());

  }, [teamData, communityCommissionRules, currentUser, users, activeL1Referrals, addCommunityCommissionToMainBalance, getLevelForUser]);
  
  const handlePayoutCheck = useCallback(() => {
    if (!currentUser?.email) return;

    const lastCreditKey = `${currentUser.email}_lastCommunityCommissionCredit`;
    const lastCreditDateStr = localStorage.getItem(lastCreditKey);
    const lastCreditTime = lastCreditDateStr ? new Date(lastCreditDateStr).getTime() : 0;
    
    const timeSource = localStorage.getItem('platform_time_source') || 'live';
    const resetTimeStr = localStorage.getItem('platform_task_reset_time') || '00:00';
    const [resetHours, resetMinutes] = resetTimeStr.split(':').map(Number);
    
    let now = timeSource === 'manual' ? new Date(localStorage.getItem('platform_manual_time') || new Date()) : new Date();

    const istOffset = -330; 
    const localOffset = now.getTimezoneOffset();
    const totalOffset = localOffset - istOffset;

    let resetTimeToday = new Date(now);
    resetTimeToday.setUTCHours(resetHours, resetMinutes, 0, 0);
    resetTimeToday.setMinutes(resetTimeToday.getMinutes() + totalOffset);
    
    if (now.getTime() < resetTimeToday.getTime()) {
      resetTimeToday.setDate(resetTimeToday.getDate() - 1);
    }
    
    if (lastCreditTime < resetTimeToday.getTime()) {
      calculatePayout();
    }
  }, [currentUser?.email, calculatePayout]);

  useEffect(() => {
    const interval = setInterval(() => {
        handlePayoutCheck();
    }, 30 * 1000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [handlePayoutCheck]);
}
