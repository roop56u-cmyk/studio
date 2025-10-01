
"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { AuthError, SupabaseClient, Session, User as SupabaseUser } from '@supabase/supabase-js';

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
  users: User[];
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

    const fetchCurrentUserProfile = useCallback(async (sessionUser: SupabaseUser) => {
        const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', sessionUser.id)
            .single();

        if (error) {
            console.error('Error fetching user profile:', error);
            // This can happen if RLS is on and the policy is not met.
            // Or if the user was created but the profile creation failed.
            // Logging out is a safe fallback.
            await supabase.auth.signOut();
            setCurrentUser(null);
        } else {
            setCurrentUser(userData as User);
        }
    }, [supabase]);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user && (!currentUser || session.user.id !== currentUser.id)) {
                await fetchCurrentUserProfile(session.user);
            } else if (!session?.user) {
                setCurrentUser(null);
            }
        });

        // Initial check in case there's an active session on page load
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                fetchCurrentUserProfile(session.user);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase, fetchCurrentUserProfile, currentUser]);


    const logout = async () => {
        await supabase.auth.signOut();
        setCurrentUser(null);
        setUsers([]); // Clear all user data on logout
        // Clear sensitive data from localStorage
        Object.keys(localStorage).forEach(key => {
            if (key.includes('@') || key.includes('supabase')) {
                localStorage.removeItem(key);
            }
        });
        sessionStorage.clear();
        router.push('/login');
    };

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
        users, // This will be populated securely when needed
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
