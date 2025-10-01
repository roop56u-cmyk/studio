
"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { platformMessages } from '@/lib/platform-messages';
import { useLocalStorageWatcher } from '@/hooks/use-local-storage-watcher';
import { createClient } from '@/lib/supabase/client';
import type { AuthError } from '@supabase/supabase-js';

export type User = {
    id: string; // From Supabase auth
    email: string;
    fullName: string;
    // Password is no longer stored in the app state
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
  login: (email: string, password: string) => Promise<{ success: boolean; message: string; isAdmin?: boolean }>;
  signup: (email: string, password: string, fullName: string, invitationCode: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateUser: (userId: string, updatedData: Partial<Omit<User, 'status' | 'isAccountActive'>> & { mainBalance?: number; taskRewardsBalance?: number; interestEarningsBalance?: number; purchasedReferrals?: number; }) => void;
  deleteUser: (userId: string, isSelfDelete?: boolean) => void;
  updateUserStatus: (userId: string, status: User['status']) => void;
  activateUserAccount: (userId: string) => void;
}

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
    const supabase = createClient();
    const router = useRouter();

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

    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    const fetchAllUsers = useCallback(async () => {
        const { data, error } = await supabase.from('users').select('*');
        if (error) {
            console.error('Error fetching users:', error);
            return;
        }
        setUsers(data as User[]);
    }, [supabase]);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                const { data: userData, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (error) {
                    console.error('Error fetching user profile:', error);
                    setCurrentUser(null);
                } else {
                    setCurrentUser(userData as User);
                }
            } else {
                setCurrentUser(null);
            }
             fetchAllUsers();
        });
        
        fetchAllUsers(); // Initial fetch

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase, fetchAllUsers]);


    const login = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error || !data.user) {
            return { success: false, message: error?.message || "An unknown error occurred." };
        }

        const { data: userData, error: userError } = await supabase.from('users').select('*').eq('id', data.user.id).single();
        if (userError || !userData) {
            await supabase.auth.signOut(); // Log out if profile doesn't exist
            return { success: false, message: 'Could not retrieve user profile.' };
        }

        if (userData.status === 'disabled') {
            await supabase.auth.signOut();
            return { success: false, message: messages.auth?.accountDisabled || 'Your account is disabled.' };
        }
        
        // The onAuthStateChange listener will handle setting the user state.
        return { success: true, message: 'Logged in successfully!', isAdmin: userData.isAdmin };
    };

    const signup = async (email: string, password: string, fullName: string, invitationCode: string) => {
        const { data: referrer, error: referrerError } = await supabase
            .from('users')
            .select('email')
            .eq('referralCode', invitationCode)
            .single();

        if (referrerError || !referrer) {
            return { success: false, message: messages.auth?.invalidReferralCode || "Invalid invitation code." };
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
                data: {
                    full_name: fullName,
                },
            },
        });

        if (error) {
            // Check for specific Supabase error codes
            if ((error as AuthError).code === 'user_already_exists') {
                return { success: false, message: messages.auth?.emailExists || "An account with this email already exists." };
            }
            return { success: false, message: error.message };
        }
        
        // Don't create the public user profile here. It should be created by the database trigger.
        return { success: true, message: 'Account created! Please check your email for a confirmation link.' };
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setCurrentUser(null);
        // Clear all user-specific data from localStorage for security
        Object.keys(localStorage).forEach(key => {
            if (key.includes('_')) {
                localStorage.removeItem(key);
            }
        });
        router.push('/login');
    };

    const updateUser = (userId: string, updatedData: Partial<User>) => {
        console.log("Updating user (client-side placeholder):", userId, updatedData);
    };

    const deleteUser = (userId: string, isSelfDelete = false) => {
        console.log("Deleting user (client-side placeholder):", userId, isSelfDelete);
    };

    const updateUserStatus = async (userId: string, status: User['status']) => {
       const { error } = await supabase.from('users').update({ status }).eq('id', userId);
       if (error) console.error("Error updating user status:", error);
       else fetchAllUsers(); // Re-fetch to update state
    }
    
    const activateUserAccount = async (userId: string) => {
        const { error } = await supabase.from('users').update({ status: 'active', isAccountActive: true, activatedAt: new Date().toISOString() }).eq('id', userId);
        if(error) console.error("Error activating account:", error);
        else fetchAllUsers();
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
