

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

    // Calculate IST-based reset time
    const istOffset = -330; // UTC+5:30 is -330 minutes from UTC
    const localOffset = now.getTimezoneOffset();
    const totalOffset = localOffset - istOffset;

    let resetTimeToday = new Date(now);
    resetTimeToday.setHours(resetHours, resetMinutes, 0, 0);
    resetTimeToday.setMinutes(resetTimeToday.getMinutes() + totalOffset);

    let resetTimeYesterday = new Date(resetTimeToday);
    resetTimeYesterday.setDate(resetTimeToday.getDate() - 1);
    
    // Determine the last effective reset time that has passed
    const lastEffectiveReset = now >= resetTimeToday ? resetTimeToday : resetTimeYesterday;

    // Check if commission has already been credited FOR THIS SPECIFIC reset cycle
    if (lastCreditDateStr) {
        const lastCreditDate = new Date(lastCreditDateStr);
        if (lastCreditDate.getTime() >= lastEffectiveReset.getTime()) {
            // Already credited for this cycle, so we do nothing.
            return;
        }
    }
    
    // If we reach here, it means we haven't credited for the current cycle yet.
    // Calculate and credit the commission.
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
    
    // ALWAYS update the last credit time to now, to mark this cycle as processed.
    localStorage.setItem(lastCreditKey, new Date().toISOString());

  }, [teamData, commissionRates, commissionEnabled, currentUser, addCommissionToMainBalance, getReferralCommissionBoost]);
  
  useEffect(() => {
    // Run once on load
    creditCommission();
    
    // Re-check every hour to catch the reset time if the user keeps the app open
    const interval = setInterval(creditCommission, 60 * 60 * 1000); 
    
    return () => clearInterval(interval);
  }, [creditCommission]);
}

