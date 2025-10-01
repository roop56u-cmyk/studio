
"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { platformMessages } from '@/lib/platform-messages';
import { createClient } from '@/lib/supabase/client';
import type { AuthError, SupabaseClient, Session } from '@supabase/supabase-js';

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
    const router = useRouter();

    const supabase = useMemo(() => createClient(), []);
    
    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    const fetchAllUsers = useCallback(async () => {
        // This fetch might fail due to RLS, but it's okay for now.
        // The important data is fetched via server actions.
        const { data, error } = await supabase.from('users').select('*');
        if (!error) {
            setUsers(data as User[]);
        }
    }, [supabase]);

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
        
        fetchAllUsers();

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase, fetchAllUsers]);

    const signup = async (email: string, password: string, fullName: string, invitationCode: string) => {
        
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
                data: {
                    full_name: fullName,
                    referred_by: invitationCode,
                },
            },
        });
        
        if (error) {
            if ((error as AuthError).code === 'user_already_exists') {
                return { success: false, message: messages.auth?.emailExists || "An account with this email already exists." };
            }
            return { success: false, message: error.message };
        }
        
        return { success: true, message: 'Account created! Please check your email for a confirmation link.' };
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setCurrentUser(null);
        Object.keys(localStorage).forEach(key => {
            if (key.includes('@')) {
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
       console.log("Updating status via server action is needed.", userId, status);
    }
    
    const activateUserAccount = async (userId: string) => {
       console.log("Activating account via server action is needed.", userId);
    }


    return (
        <AuthContext.Provider value={{ currentUser, users, signup, logout, updateUser, deleteUser, updateUserStatus, activateUserAccount }}>
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
