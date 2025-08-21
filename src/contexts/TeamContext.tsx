
"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import type { User } from './AuthContext';

type TeamLevelData = {
    count: number;
    commission: number;
    members: User[];
};

type TeamData = {
    level1: TeamLevelData;
    level2: TeamLevelData;
    level3: TeamLevelData;
};

interface TeamContextType {
  teamData: TeamData | null;
  commissionRates: { level1: number; level2: number; level3: number; };
  isLoading: boolean;
}

// Mock commission rates, can be moved to admin settings later
const MOCK_COMMISSION_RATES = { level1: 10, level2: 5, level3: 2 };
// Mock earnings per user, in a real app this would come from a database
const MOCK_USER_EARNINGS = 5.25;


const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider = ({ children }: { children: ReactNode }) => {
    const { currentUser, users } = useAuth();
    const [teamData, setTeamData] = useState<TeamData | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (currentUser && users.length > 1) {
            setIsLoading(true);

            const calculateTeam = (currentUser: User, allUsers: User[]): TeamData => {
                const level1: User[] = allUsers.filter(u => u.referredBy === currentUser.referralCode);
                const level2: User[] = level1.flatMap(l1User => allUsers.filter(u => u.referredBy === l1User.referralCode));
                const level3: User[] = level2.flatMap(l2User => allUsers.filter(u => u.referredBy === l2User.referralCode));

                return {
                    level1: {
                        count: level1.length,
                        commission: level1.length * MOCK_USER_EARNINGS * (MOCK_COMMISSION_RATES.level1 / 100),
                        members: level1,
                    },
                    level2: {
                        count: level2.length,
                        commission: level2.length * MOCK_USER_EARNINGS * (MOCK_COMMISSION_RATES.level2 / 100),
                        members: level2,
                    },
                    level3: {
                        count: level3.length,
                        commission: level3.length * MOCK_USER_EARNINGS * (MOCK_COMMISSION_RATES.level3 / 100),
                        members: level3,
                    },
                };
            };
            
            const data = calculateTeam(currentUser, users);
            setTeamData(data);
            setIsLoading(false);
        }
    }, [currentUser, users]);

    const value = {
        teamData,
        commissionRates: MOCK_COMMISSION_RATES,
        isLoading
    };

    return (
        <TeamContext.Provider value={value}>
            {children}
        </TeamContext.Provider>
    );
};

export const useTeam = () => {
    const context = useContext(TeamContext);
    if (context === undefined) {
        throw new Error('useTeam must be used within a TeamProvider');
    }
    return context;
};
