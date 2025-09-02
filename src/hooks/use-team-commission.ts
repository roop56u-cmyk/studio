

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
    // Using a simple 24-hour check for crediting to avoid timezone issues.
    // A more robust solution would use a server-side cron job.
    if (now.getTime() - lastCreditDate > 24 * 60 * 60 * 1000) {
      let totalCommission = 0;
      if (commissionEnabled.level1) totalCommission += teamData.level1.commission * (commissionRates.level1 / 100);
      if (commissionEnabled.level2) totalCommission += teamData.level2.commission * (commissionRates.level2 / 100);
      if (commissionEnabled.level3) totalCommission += teamData.level3.commission * (commissionRates.level3 / 100);

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
    // Run the check when the component mounts and data is available
    creditCommission();

    // Also run it periodically in case the user leaves the page open
    const interval = setInterval(creditCommission, 60 * 60 * 1000); // Check every hour
    
    return () => clearInterval(interval);
  }, [creditCommission]);
}
