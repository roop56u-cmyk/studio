

"use client";

import { useEffect } from "react";
import { useTeam } from "@/contexts/TeamContext";
import { useWallet } from "@/contexts/WalletContext";
import { useAuth } from "@/contexts/AuthContext";

// This hook is now disabled as the new "top-down" commission logic is handled
// directly within the `completeTask` function in WalletContext.
export function useTeamCommission() {
  
  useEffect(() => {
    // The entire logic is commented out to prevent it from running.
    /*
    if (!teamData || !currentUser || currentUser.status !== 'active') return;
    
    const now = new Date();
    const istTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    
    const creditHourIST = 9;
    const creditMinuteIST = 30;

    const lastCreditKey = `${currentUser.email}_lastTeamCommissionCredit`;
    const lastCreditDateStr = localStorage.getItem(lastCreditKey);
    const lastCreditDate = lastCreditDateStr ? new Date(lastCreditDateStr) : new Date(0);

    const todayCreditTime = new Date(istTime);
    todayCreditTime.setHours(creditHourIST, creditMinuteIST, 0, 0);

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
    */
  }, []); // Empty dependency array ensures this runs once and does nothing.
}

    
