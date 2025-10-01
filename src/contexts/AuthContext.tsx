
"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { AuthError, SupabaseClient, Session } from '@supabase/supabase-js';

export type User = {
    id: string; // From Supabase auth
    email: string;
    fullName: string;
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
  users: User[]; // This will now be primarily managed by TeamContext for team data
  logout: () => void;
  updateUser: (userId: string, updatedData: Partial<User>) => void;
  deleteUser: (userId: string, isSelfDelete?: boolean) => void;
  updateUserStatus: (userId: string, status: User['status']) => void;
  activateUserAccount: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);
    
    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    const fetchCurrentUserProfile = useCallback(async (sessionUser: any) => {
        const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', sessionUser.id)
            .single();

        if (error) {
            console.error('Error fetching user profile:', error);
            setCurrentUser(null);
        } else {
            setCurrentUser(userData as User);
        }
    }, [supabase]);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                await fetchCurrentUserProfile(session.user);
            } else {
                setCurrentUser(null);
            }
        });

        // Initial check
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                fetchCurrentUserProfile(session.user);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase, fetchCurrentUserProfile]);


    const logout = async () => {
        await supabase.auth.signOut();
        setCurrentUser(null);
        setUsers([]);
        // Clear only user-specific data, not global settings
        Object.keys(localStorage).forEach(key => {
            if (key.includes('@')) { // A simple heuristic for user-specific keys
                localStorage.removeItem(key);
            }
        });
        sessionStorage.clear();
        router.push('/login');
    };

    // These functions are now placeholders for client-side state changes.
    // The real database operations should be handled by server actions.
    const updateUser = (userId: string, updatedData: Partial<User>) => {
        console.log("Updating user (client-side placeholder):", userId, updatedData);
        if (currentUser && currentUser.id === userId) {
            setCurrentUser(prev => prev ? { ...prev, ...updatedData } : null);
        }
    };

    const deleteUser = (userId: string, isSelfDelete = false) => {
        console.log("Deleting user (client-side placeholder):", userId, isSelfDelete);
        if (isSelfDelete) {
            logout();
        }
    };

    const updateUserStatus = (userId: string, status: User['status']) => {
       console.log("Updating status via server action is needed.", userId, status);
       if (currentUser && currentUser.id === userId) {
            setCurrentUser(prev => prev ? { ...prev, status } : null);
        }
    };
    
    const activateUserAccount = (userId: string) => {
       console.log("Activating account via server action is needed.", userId);
       if (currentUser && currentUser.id === userId) {
            setCurrentUser(prev => prev ? { ...prev, isAccountActive: true, status: 'active', activatedAt: new Date().toISOString() } : null);
        }
    };

    const value = {
        currentUser,
        users, // This is kept for any components that might still use it, but its population is now limited.
        logout,
        updateUser,
        deleteUser,
        updateUserStatus,
        activateUserAccount
    };

    return (
        <AuthContext.Provider value={value}>
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
