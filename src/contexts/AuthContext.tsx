
"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { platformMessages } from '@/lib/platform-messages';

export type User = {
    email: string;
    password?: string; // Password is now optional for security reasons after login
    isAdmin: boolean;
    referralCode: string;
    referredBy: string | null; // Stores the referral code of the user who referred them
    status: 'active' | 'disabled' | 'inactive';
    overrideLevel?: number | null;
    isBonusDisabled?: boolean;
    withdrawalRestrictionUntil?: string | null; // ISO date string
    createdAt: string; // ISO date string
};

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (email: string, password: string) => { success: boolean, message: string, isAdmin?: boolean };
  signup: (email: string, password: string, referralCode: string) => { success: boolean, message: string };
  logout: () => void;
  updateUser: (email: string, updatedData: Partial<Omit<User, 'status'>> & { mainBalance?: number; taskRewardsBalance?: number; interestEarningsBalance?: number; purchasedReferrals?: number; }) => void;
  deleteUser: (email: string, isSelfDelete?: boolean) => void;
  updateUserStatus: (email: string, status: User['status']) => void;
  // checkAndDeactivateUser: (email: string) => void;
}

const initialAdminUser: User = {
    email: 'admin@stakinghub.com',
    password: 'admin123',
    isAdmin: true,
    referralCode: "ADMINREF001",
    referredBy: null,
    status: 'active',
    isBonusDisabled: true,
    withdrawalRestrictionUntil: null,
    createdAt: new Date(0).toISOString(),
};

const getGlobalSetting = (key: string, defaultValue: any, isJson: boolean = false) => {
    if (typeof window === 'undefined') {
    return defaultValue;
    }
    try {
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
        if (isJson) {
            return JSON.parse(storedValue);
        }
        return storedValue;
    }
    } catch (error) {
    console.error(`Failed to parse global setting ${key} from localStorage`, error);
    }
    return defaultValue;
};


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [messages, setMessages] = useState<any>({});

    useEffect(() => {
        const storedMessages = getGlobalSetting("platform_custom_messages", {}, true);
        const defaults: any = {};
        Object.entries(platformMessages).forEach(([catKey, category]) => {
            defaults[catKey] = {};
            Object.entries(category.messages).forEach(([msgKey, msgItem]) => {
                defaults[catKey][msgKey] = msgItem.defaultValue;
            });
        });
        const mergedMessages = { ...defaults, ...storedMessages };
        setMessages(mergedMessages);
    }, []);

    const [users, setUsers] = useState<User[]>(() => {
        if (typeof window === 'undefined') {
            return [initialAdminUser];
        }
        try {
            const storedUsers = localStorage.getItem('users');
            if (storedUsers) {
                const parsedUsers = JSON.parse(storedUsers);
                // Ensure admin user always exists and has the correct properties
                const adminExists = parsedUsers.some((u: User) => u.email === initialAdminUser.email);
                if (!adminExists) {
                    return [initialAdminUser, ...parsedUsers];
                }
                // Ensure all users have a status
                return parsedUsers.map((u: User) => ({
                    ...u,
                    status: u.status ?? 'active', // Set default status if missing
                    isBonusDisabled: u.isBonusDisabled ?? false,
                    withdrawalRestrictionUntil: u.withdrawalRestrictionUntil ?? null,
                    createdAt: u.createdAt ?? new Date().toISOString(),
                    ...(u.email === initialAdminUser.email ? initialAdminUser : {}) // Ensure admin data is current
                }));
            }
        } catch (error) {
            console.error("Failed to parse users from localStorage", error);
        }
        return [initialAdminUser];
    });

    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        if (typeof window === 'undefined') {
            return null;
        }
        try {
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
                return JSON.parse(storedUser);
            }
        } catch (error) {
            console.error("Failed to parse currentUser from localStorage", error);
        }
        return null;
    });

    const router = useRouter();

    useEffect(() => {
        try {
            localStorage.setItem('users', JSON.stringify(users));
        } catch (error) {
            console.error("Failed to save users to localStorage", error);
        }
    }, [users]);

    useEffect(() => {
        try {
            if (currentUser) {
                const userWithPassword = users.find(u => u.email === currentUser.email);
                const userToStore = { ...currentUser, password: userWithPassword?.password };
                localStorage.setItem('currentUser', JSON.stringify(userToStore));
            } else {
                localStorage.removeItem('currentUser');
            }
        } catch (error) {
            console.error("Failed to save currentUser to localStorage", error);
        }
    }, [currentUser, users]);

    const login = (email: string, password: string) => {
        const user = users.find(u => u.email === email);

        if (!user) {
            return { success: false, message: messages.auth?.noAccountFound };
        }
        if (user.password !== password) {
            return { success: false, message: messages.auth?.incorrectPassword };
        }
         if (user.status === 'disabled') {
            return { success: false, message: messages.auth?.accountDisabled };
        }

        setCurrentUser(user);
        return { success: true, message: 'Logged in successfully!', isAdmin: user.isAdmin };
    };

    const signup = (email: string, password: string, referralCode: string) => {
        const referrer = users.find(u => u.referralCode === referralCode);

        if (!referrer) {
            return { success: false, message: messages.auth?.invalidReferralCode };
        }
        if (users.find(u => u.email === email)) {
            return { success: false, message: messages.auth?.emailExists };
        }

        const newUser: User = { 
            email, 
            password, 
            isAdmin: false,
            referralCode: "TRH-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
            referredBy: referralCode,
            status: 'inactive',
            isBonusDisabled: false,
            createdAt: new Date().toISOString(),
        };
        setUsers(prev => [...prev, newUser]);
        
        setCurrentUser(newUser);

        return { success: true, message: 'Account created successfully!' };
    };

    const logout = () => {
        setCurrentUser(null);
        router.push('/login');
    };

    const updateUser = (email: string, updatedData: Partial<Omit<User, 'status'>> & { mainBalance?: number; taskRewardsBalance?: number; interestEarningsBalance?: number; purchasedReferrals?: number; }) => {
        const { mainBalance, taskRewardsBalance, interestEarningsBalance, purchasedReferrals, ...userData } = updatedData;
        
        const originalUser = users.find(u => u.email === email);
        if (!originalUser) return;

        // If email is being changed, we need to update all localStorage keys
        if (userData.email && userData.email !== email) {
            const keysToMigrate = [
                'mainBalance', 'taskRewardsBalance', 'interestEarningsBalance',
                'taskRewardsEarned', 'interestEarned', 'deposits', 'withdrawals',
                'interestCounter', 'tasksCompletedToday', 'lastTaskCompletionDate',
                'completedTasks', 'withdrawalAddress', 'monthlyWithdrawalsCount',
                'lastWithdrawalMonth', 'lastTeamCommissionCredit', 'firstDepositDate', 'purchased_referrals'
            ];
            keysToMigrate.forEach(key => {
                const oldKey = `${email}_${key}`;
                const newKey = `${userData.email}_${key}`;
                const value = localStorage.getItem(oldKey);
                if (value) {
                    localStorage.setItem(newKey, value);
                    localStorage.removeItem(oldKey);
                }
            });
        }
        
        const targetEmail = userData.email || email;
        // Update balances in localStorage
        if (mainBalance !== undefined) localStorage.setItem(`${targetEmail}_mainBalance`, JSON.stringify(mainBalance));
        if (taskRewardsBalance !== undefined) localStorage.setItem(`${targetEmail}_taskRewardsBalance`, JSON.stringify(taskRewardsBalance));
        if (interestEarningsBalance !== undefined) localStorage.setItem(`${targetEmail}_interestEarningsBalance`, JSON.stringify(interestEarningsBalance));
        if (purchasedReferrals !== undefined) localStorage.setItem(`${targetEmail}_purchased_referrals`, JSON.stringify(purchasedReferrals));


        setUsers(prevUsers => prevUsers.map(user => 
            user.email === email ? { ...user, ...userData } : user
        ));
        
        // If the currently logged-in user is being updated, update their session data too
        if (currentUser?.email === email) {
            setCurrentUser(prev => prev ? { ...prev, ...userData } : null);
        }
    };

    const deleteUser = (email: string, isSelfDelete: boolean = false) => {
        // Prevent deleting the main admin account
        if (email === initialAdminUser.email) {
            return;
        }
        // If it's a self-delete, the password has already been verified in the component.
        setUsers(prevUsers => prevUsers.filter(user => user.email !== email));
    };

    const updateUserStatus = (email: string, status: User['status']) => {
        setUsers(prev => prev.map(u => u.email === email ? { ...u, status } : u));
         if (currentUser?.email === email) {
            setCurrentUser(prev => prev ? { ...prev, status } : null);
        }
    }


    return (
        <AuthContext.Provider value={{ currentUser, users, login, signup, logout, updateUser, deleteUser, updateUserStatus }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
