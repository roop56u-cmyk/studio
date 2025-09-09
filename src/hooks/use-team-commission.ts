

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
    const lastCreditDate = lastCreditDateStr ? new Date(lastCreditDateStr).getTime() : 0;

    const now = new Date();
    // Check if 24 hours have passed since last credit
    if (now.getTime() - lastCreditDate > 24 * 60 * 60 * 1000) {
      let totalCommission = 0;
      const activeL1Referrals = teamData.level1.activeCount;

      // Check L1 commission eligibility
      if (commissionEnabled.level1 && activeL1Referrals >= 1) {
          totalCommission += teamData.level1.commission * (commissionRates.level1 / 100);
      }
      // Check L2 commission eligibility
      if (commissionEnabled.level2 && activeL1Referrals >= 2) {
          totalCommission += teamData.level2.commission * (commissionRates.level2 / 100);
      }
      // Check L3 commission eligibility
      if (commissionEnabled.level3 && activeL1Referrals >= 3) {
          totalCommission += teamData.level3.commission * (commissionRates.level3 / 100);
      }

      const commissionBoostPercent = getReferralCommissionBoost();
      const boostAmount = totalCommission * (commissionBoostPercent / 100);
      const finalCommission = totalCommission + boostAmount;

      if (finalCommission > 0) {
          addCommissionToMainBalance(finalCommission);
          localStorage.setItem(lastCreditKey, now.toISOString());
      }
    }
  }, [teamData, commissionRates, commissionEnabled, currentUser, addCommissionToMainBalance, getReferralCommissionBoost]);
  
  useEffect(() => {
    creditCommission();
    const interval = setInterval(creditCommission, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [creditCommission]);
}
