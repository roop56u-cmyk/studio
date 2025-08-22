
"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export type User = {
    email: string;
    password?: string; // Password is now optional for security reasons after login
    isAdmin: boolean;
    referralCode: string;
    referredBy: string | null; // Stores the referral code of the user who referred them
    status: 'active' | 'disabled';
};

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (email: string, password: string) => { success: boolean, message: string, isAdmin?: boolean };
  signup: (email: string, password: string, referralCode: string) => { success: boolean, message: string };
  logout: () => void;
  updateUser: (email: string, updatedData: Partial<User>) => void;
  deleteUser: (email: string) => void;
}

const initialAdminUser: User = {
    email: 'admin@stakinghub.com',
    password: 'admin123',
    isAdmin: true,
    referralCode: "ADMINREF001",
    referredBy: null,
    status: 'active',
};


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
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
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
            } else {
                localStorage.removeItem('currentUser');
            }
        } catch (error) {
            console.error("Failed to save currentUser to localStorage", error);
        }
    }, [currentUser]);

    const login = (email: string, password: string) => {
        const user = users.find(u => u.email === email);

        if (!user) {
            return { success: false, message: 'No account found with this email.' };
        }
        if (user.password !== password) {
            return { success: false, message: 'Incorrect password. Please try again.' };
        }
         if (user.status === 'disabled') {
            return { success: false, message: 'Your account has been disabled. Please contact support.' };
        }

        setCurrentUser(user);
        return { success: true, message: 'Logged in successfully!', isAdmin: user.isAdmin };
    };

    const signup = (email: string, password: string, referralCode: string) => {
        const referrer = users.find(u => u.referralCode === referralCode);

        if (!referrer) {
            return { success: false, message: 'Invalid invitation code.' };
        }
        if (users.find(u => u.email === email)) {
            return { success: false, message: 'An account with this email already exists.' };
        }

        const newUser: User = { 
            email, 
            password, 
            isAdmin: false,
            referralCode: "TRH-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
            referredBy: referralCode,
            status: 'active',
        };
        setUsers(prev => [...prev, newUser]);
        
        setCurrentUser(newUser);

        return { success: true, message: 'Account created successfully!' };
    };

    const logout = () => {
        setCurrentUser(null);
        router.push('/login');
    };

    const updateUser = (email: string, updatedData: Partial<User>) => {
        setUsers(prevUsers => prevUsers.map(user => 
            user.email === email ? { ...user, ...updatedData } : user
        ));
         // If the currently logged-in user is being updated, update their session data too
        if (currentUser?.email === email) {
            setCurrentUser(prev => prev ? { ...prev, ...updatedData } : null);
        }
    };

    const deleteUser = (email: string) => {
        // Prevent deleting the main admin account
        if (email === initialAdminUser.email) {
            return;
        }
        setUsers(prevUsers => prevUsers.filter(user => user.email !== email));
    };


    return (
        <AuthContext.Provider value={{ currentUser, users, login, signup, logout, updateUser, deleteUser }}>
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
