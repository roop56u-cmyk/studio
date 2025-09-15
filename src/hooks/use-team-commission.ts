

"use client";

import { useEffect, useCallback } from "react";
import { useTeam } from "@/contexts/TeamContext";
import { useWallet } from "@/contexts/WalletContext";
import { useAuth } from "@/contexts/AuthContext";

export function useTeamCommission() {
  const { teamData, commissionRates, commissionEnabled } = useTeam();
  const { addCommissionToMainBalance, getReferralCommissionBoost } = useWallet();
  const { currentUser } = useAuth();
  
  const creditCommission = useCallback(() => {
    if (!teamData || !currentUser || currentUser.status !== 'active') return;

    const lastCreditKey = `${currentUser.email}_lastTeamCommissionCredit`;
    const lastCreditDateStr = localStorage.getItem(lastCreditKey);
    
    // Get admin-defined reset time settings
    const timeSource = localStorage.getItem('platform_time_source') || 'live';
    const resetTimeStr = localStorage.getItem('platform_task_reset_time') || '00:00';
    const [resetHours, resetMinutes] = resetTimeStr.split(':').map(Number);
    
    let now;
    if (timeSource === 'manual') {
        const manualTime = localStorage.getItem('platform_manual_time') || new Date().toISOString();
        now = new Date(manualTime);
    } else {
        now = new Date();
    }

    const istOffset = -330; 
    const localOffset = now.getTimezoneOffset();
    const totalOffset = localOffset - istOffset;

    let resetTimeToday = new Date(now);
    resetTimeToday.setHours(resetHours, resetMinutes, 0, 0);
    resetTimeToday.setMinutes(resetTimeToday.getMinutes() + totalOffset);

    let resetTimeYesterday = new Date(resetTimeToday);
    resetTimeYesterday.setDate(resetTimeToday.getDate() - 1);
    
    const lastEffectiveReset = now >= resetTimeToday ? resetTimeToday : resetTimeYesterday;

    if (lastCreditDateStr) {
        const lastCreditDate = new Date(lastCreditDateStr);
        if (lastCreditDate.getTime() >= lastEffectiveReset.getTime()) {
            return;
        }
    }
    
    // Calculate commission based on the data available.
    // teamData.levelX.commission should represent the earnings of the just-ended cycle.
    let totalCommission = 0;
    const activeL1Referrals = teamData.level1.activeCount;

    if (commissionEnabled.level1 && activeL1Referrals >= 1) {
        totalCommission += teamData.level1.commission * (commissionRates.level1 / 100);
    }
    if (commissionEnabled.level2 && activeL1Referrals >= 2) {
        totalCommission += teamData.level2.commission * (commissionRates.level2 / 100);
    }
    if (commissionEnabled.level3 && activeL1Referrals >= 3) {
        totalCommission += teamData.level3.commission * (commissionRates.level3 / 100);
    }

    const commissionBoostPercent = getReferralCommissionBoost();
    const boostAmount = totalCommission * (commissionBoostPercent / 100);
    const finalCommission = totalCommission + boostAmount;

    if (finalCommission > 0) {
        addCommissionToMainBalance(finalCommission);
    }
    
    localStorage.setItem(lastCreditKey, now.toISOString());

  }, [teamData, commissionRates, commissionEnabled, currentUser, addCommissionToMainBalance, getReferralCommissionBoost]);
  
  useEffect(() => {
    // Run once on load
    if (currentUser?.email) {
      creditCommission();
    }
    
    // Re-check every minute to catch the reset time
    const interval = setInterval(() => {
        if (currentUser?.email) {
            creditCommission();
        }
    }, 60 * 1000); 
    
    return () => clearInterval(interval);
  }, [creditCommission, currentUser?.email]);
}
