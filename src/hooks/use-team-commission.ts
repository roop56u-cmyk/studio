
"use client";

import { useEffect } from "react";
import { useTeam } from "@/contexts/TeamContext";
import { useWallet } from "@/contexts/WalletContext";
import { useAuth } from "@/contexts/AuthContext";

// This hook is responsible for calculating and crediting team commission daily.
export function useTeamCommission() {
  const { teamData, commissionRates, commissionEnabled } = useTeam();
  const { addCommissionToMainBalance, getReferralCommissionBoost } = useWallet();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!teamData || !currentUser || currentUser.status !== 'active') return;
    
    const now = new Date();
    const istTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    
    // Define the time for the daily credit (e.g., 9:30 AM IST)
    const creditHourIST = 9;
    const creditMinuteIST = 30;

    const lastCreditKey = `${currentUser.email}_lastTeamCommissionCredit`;
    const lastCreditDateStr = localStorage.getItem(lastCreditKey);
    const lastCreditDate = lastCreditDateStr ? new Date(lastCreditDateStr) : new Date(0);

    const todayCreditTime = new Date(istTime);
    todayCreditTime.setHours(creditHourIST, creditMinuteIST, 0, 0);

    // If current time is past today's credit time and the last credit was before today's credit time
    if (istTime >= todayCreditTime && lastCreditDate < todayCreditTime) {
        let totalCommission = 0;
        if (commissionEnabled.level1) totalCommission += teamData.level1.commission * (commissionRates.level1 / 100);
        if (commissionEnabled.level2) totalCommission += teamData.level2.commission * (commissionRates.level2 / 100);
        if (commissionEnabled.level3) totalCommission += teamData.level3.commission * (commissionRates.level3 / 100);

        const commissionBoostPercent = getReferralCommissionBoost();
        const boostAmount = totalCommission * (commissionBoostPercent / 100);
        const finalCommission = totalCommission + boostAmount;

        if (finalCommission > 0) {
            addCommissionToMainBalance(finalCommission);
            localStorage.setItem(lastCreditKey, new Date().toISOString());
        }
    }
  }, [teamData, commissionRates, commissionEnabled, addCommissionToMainBalance, currentUser, getReferralCommissionBoost]);
}

    