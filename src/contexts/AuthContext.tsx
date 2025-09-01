

"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { platformMessages } from '@/lib/platform-messages';
import { useRequests } from './RequestContext';

export type User = {
    email: string;
    fullName: string;
    password?: string; // Password is now optional for security reasons after login
    isAdmin: boolean;
    referralCode: string;
    referredBy: string | null; // Stores the referral code of the user who referred them
    status: 'active' | 'disabled' | 'inactive';
    isAccountActive: boolean; // Tracks if user has made a qualifying deposit
    overrideLevel?: number | null;
    isBonusDisabled?: boolean;
    withdrawalRestrictionUntil?: string | null; // ISO date string
    createdAt: string; // ISO date string
    activatedAt?: string | null; // ISO date string
};

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (email: string, password: string) => { success: boolean, message: string, isAdmin?: boolean };
  signup: (email: string, password: string, fullName: string, referralCode: string) => { success: boolean, message: string };
  logout: () => void;
  updateUser: (email: string, updatedData: Partial<Omit<User, 'status' | 'isAccountActive'>> & { mainBalance?: number; taskRewardsBalance?: number; interestEarningsBalance?: number; purchasedReferrals?: number; }) => void;
  deleteUser: (email: string, isSelfDelete?: boolean) => void;
  updateUserStatus: (email: string, status: User['status']) => void;
  activateUserAccount: (email: string) => void;
}

const initialAdminUser: User = {
    email: 'admin@stakinghub.com',
    fullName: 'Platform Admin',
    password: 'admin123',
    isAdmin: true,
    referralCode: "ADMINREF001",
    referredBy: null,
    status: 'active',
    isAccountActive: true,
    isBonusDisabled: true,
    withdrawalRestrictionUntil: null,
    createdAt: new Date(0).toISOString(),
    activatedAt: new Date(0).toISOString(),
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
    const requestContext = useRequests();

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
                const adminExists = parsedUsers.some((u: User) => u.email === initialAdminUser.email);
                if (!adminExists) {
                    return [initialAdminUser, ...parsedUsers];
                }
                return parsedUsers.map((u: User) => ({
                    ...u,
                    fullName: u.fullName || u.email, // Fallback for old users
                    status: u.status ?? 'active',
                    isAccountActive: u.isAccountActive ?? false,
                    isBonusDisabled: u.isBonusDisabled ?? false,
                    withdrawalRestrictionUntil: u.withdrawalRestrictionUntil ?? null,
                    createdAt: u.createdAt ?? new Date().toISOString(),
                    activatedAt: u.activatedAt ?? null,
                    ...(u.email === initialAdminUser.email ? initialAdminUser : {})
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

    const signup = (email: string, password: string, fullName: string, referralCode: string) => {
        if (!requestContext) return { success: false, message: "Initialization error." };
        const { addActivity } = requestContext;

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
            fullName,
            isAdmin: false,
            referralCode: "TRH-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
            referredBy: referralCode,
            status: 'inactive',
            isAccountActive: false,
            isBonusDisabled: false,
            createdAt: new Date().toISOString(),
            activatedAt: null,
        };
        setUsers(prev => [...prev, newUser]);
        setCurrentUser(newUser);

        // Add activity log for the referrer
        addActivity(referrer.email, {
            type: 'New Referral',
            description: `A new member, ${fullName} (${email}), joined your team.`,
            date: new Date().toISOString()
        });

        return { success: true, message: 'Account created successfully!' };
    };

    const logout = () => {
        setCurrentUser(null);
        router.push('/login');
    };

    const updateUser = (email: string, updatedData: Partial<Omit<User, 'status' | 'isAccountActive'>> & { mainBalance?: number; taskRewardsBalance?: number; interestEarningsBalance?: number; purchasedReferrals?: number; }) => {
        if (!requestContext) return;
        const { addActivity } = requestContext;
        const { mainBalance, taskRewardsBalance, interestEarningsBalance, purchasedReferrals, ...userData } = updatedData;
        
        const originalUser = users.find(u => u.email === email);
        if (!originalUser) return;

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
        if (mainBalance !== undefined) localStorage.setItem(`${targetEmail}_mainBalance`, JSON.stringify(mainBalance));
        if (taskRewardsBalance !== undefined) localStorage.setItem(`${targetEmail}_taskRewardsBalance`, JSON.stringify(taskRewardsBalance));
        if (interestEarningsBalance !== undefined) localStorage.setItem(`${targetEmail}_interestEarningsBalance`, JSON.stringify(interestEarningsBalance));
        if (purchasedReferrals !== undefined) {
             localStorage.setItem(`${targetEmail}_purchased_referrals`, JSON.stringify(purchasedReferrals));
        }

        setUsers(prevUsers => prevUsers.map(user => 
            user.email === email ? { ...user, ...userData } : user
        ));
        
        if (currentUser?.email === email) {
            setCurrentUser(prev => prev ? { ...prev, ...userData } : null);
        }
        addActivity(targetEmail, {
            type: 'Profile Update',
            description: 'Your profile details were updated by an admin.',
            date: new Date().toISOString()
        });
    };

    const deleteUser = (email: string, isSelfDelete: boolean = false) => {
        if (email === initialAdminUser.email) {
            return;
        }
        setUsers(prevUsers => prevUsers.filter(user => user.email !== email));
    };

    const updateUserStatus = (email: string, status: User['status']) => {
        if (!requestContext) return;
        const { addActivity } = requestContext;

        setUsers(prev => prev.map(u => {
            if (u.email === email) {
                const updatedUser: User = { ...u, status };
                if (status === 'inactive') {
                    updatedUser.isAccountActive = false;
                    updatedUser.activatedAt = null;
                } else if (status === 'active' && !u.isAccountActive) {
                    updatedUser.isAccountActive = true;
                    updatedUser.activatedAt = u.activatedAt || new Date().toISOString();
                }
                return updatedUser;
            }
            return u;
        }));
        if (currentUser?.email === email) {
             const userToUpdate = users.find(u => u.email === email);
             if (userToUpdate) {
                const updatedCurrentUser: User = { ...currentUser, status };
                 if (status === 'inactive') {
                    updatedCurrentUser.isAccountActive = false;
                    updatedCurrentUser.activatedAt = null;
                 } else if (status === 'active' && !currentUser.isAccountActive) {
                    updatedCurrentUser.isAccountActive = true;
                    updatedCurrentUser.activatedAt = currentUser.activatedAt || new Date().toISOString();
                 }
                setCurrentUser(updatedCurrentUser);
             }
        }
        addActivity(email, {
            type: 'Status Change',
            description: `Your account status changed to: ${status}.`,
            date: new Date().toISOString()
        });
    }
    
    const activateUserAccount = (email: string) => {
        if (!requestContext) return;
        const { addActivity } = requestContext;
        
        const newUsers = users.map(u => {
            if (u.email === email && u.status !== 'active') {
                return { ...u, status: 'active', isAccountActive: true, activatedAt: new Date().toISOString() };
            }
            return u;
        });
        setUsers(newUsers);

        if (currentUser?.email === email && currentUser.status !== 'active') {
            setCurrentUser(prev => prev ? { ...prev, status: 'active', isAccountActive: true, activatedAt: new Date().toISOString() } : null);
        }
         addActivity(email, {
            type: 'Status Change',
            description: `Your account has been activated.`,
            date: new Date().toISOString()
        });
    }


    return (
        <AuthContext.Provider value={{ currentUser, users, login, signup, logout, updateUser, deleteUser, updateUserStatus, activateUserAccount }}>
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
