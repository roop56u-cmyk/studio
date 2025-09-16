

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
    
    const lastCreditTime = lastCreditDateStr ? new Date(lastCreditDateStr).getTime() : 0;
    
    // Check if the current time has passed today's reset time, and if we haven't credited for this cycle yet
    if (now.getTime() >= resetTimeToday.getTime() && lastCreditTime < resetTimeToday.getTime()) {
      // It's time to pay out. The `teamData` already contains the calculations for the cycle that just ended.
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
      
      // IMPORTANT: Record that we have credited for this cycle immediately after calculation.
      localStorage.setItem(lastCreditKey, new Date().toISOString());
    }

  }, [teamData, commissionRates, commissionEnabled, currentUser, addCommissionToMainBalance, getReferralCommissionBoost]);
  
  useEffect(() => {
    // Re-check every minute to catch the reset time
    const interval = setInterval(() => {
        if (currentUser?.email) {
            creditCommission();
        }
    }, 60 * 1000); 
    
    return () => clearInterval(interval);
  }, [creditCommission, currentUser?.email]);
}
