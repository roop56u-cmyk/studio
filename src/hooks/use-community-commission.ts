

"use client";

import { useEffect, useCallback } from "react";
import { useTeam } from "@/contexts/TeamContext";
import { useWallet } from "@/contexts/WalletContext";
import { useAuth } from "@/contexts/AuthContext";

export function useCommunityCommission() {
  const { communityData, communityCommissionRules, activeL1Referrals } = useTeam();
  const { addCommunityCommissionToMainBalance } = useWallet();
  const { currentUser } = useAuth();
  
  const creditCommission = useCallback(() => {
    if (!communityData || !currentUser || currentUser.status !== 'active') return;

    const applicableRule = [...communityCommissionRules]
        .sort((a, b) => b.requiredLevel - a.requiredLevel)
        .find(rule => rule.requiredLevel === 0 || (currentUser as any).level >= rule.requiredLevel);
    
    if (!applicableRule) return;

    const l1to3size = communityData.l1To3Size;
    const referralsMet = activeL1Referrals >= applicableRule.requiredDirectReferrals;
    const teamSizeMet = l1to3size >= applicableRule.requiredTeamSize;
    
    if (!referralsMet || !teamSizeMet) return;

    const lastCreditKey = `${currentUser.email}_lastCommunityCommissionCredit`;
    const lastCreditDateStr = localStorage.getItem(lastCreditKey);
    
    const timeSource = localStorage.getItem('platform_time_source') || 'live';
    const resetTimeStr = localStorage.getItem('platform_task_reset_time') || '00:00';
    const [resetHours, resetMinutes] = resetTimeStr.split(':').map(Number);
    
    let now = timeSource === 'manual' ? new Date(localStorage.getItem('platform_manual_time') || new Date()) : new Date();

    const istOffset = -330; 
    const localOffset = now.getTimezoneOffset();
    const totalOffset = localOffset - istOffset;

    let resetTimeToday = new Date(now);
    resetTimeToday.setHours(resetHours, resetMinutes, 0, 0);
    resetTimeToday.setMinutes(resetTimeToday.getMinutes() + totalOffset);
    
    const lastCreditTime = lastCreditDateStr ? new Date(lastCreditDateStr).getTime() : 0;
    
    if (now.getTime() >= resetTimeToday.getTime() && lastCreditTime < resetTimeToday.getTime()) {
      const commissionAmount = communityData.totalEarnings * (applicableRule.commissionRate / 100);

      if (commissionAmount > 0) {
        addCommunityCommissionToMainBalance(commissionAmount);
      }
      
      localStorage.setItem(lastCreditKey, new Date().toISOString());
    }

  }, [communityData, communityCommissionRules, currentUser, activeL1Referrals, addCommunityCommissionToMainBalance]);
  
  useEffect(() => {
    const interval = setInterval(() => {
        if (currentUser?.email) {
            creditCommission();
        }
    }, 60 * 1000); 
    
    return () => clearInterval(interval);
  }, [creditCommission, currentUser?.email]);
}
