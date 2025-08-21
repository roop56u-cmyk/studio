
"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type User = {
    email: string;
    password?: string; // Password is now optional for security reasons after login
    isAdmin: boolean;
};

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => { success: boolean, message: string, isAdmin?: boolean };
  signup: (email: string, password: string, referralCode: string) => { success: boolean, message: string };
  logout: () => void;
}

const initialAdminUser: User = {
    email: 'admin@stakinghub.com',
    password: 'admin123',
    isAdmin: true
};

const validReferralCodes = ["ADMINREF001"];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [users, setUsers] = useState<User[]>(() => {
        if (typeof window === 'undefined') {
            return [initialAdminUser];
        }
        try {
            const storedUsers = localStorage.getItem('users');
            if (storedUsers) {
                return JSON.parse(storedUsers);
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

        const userToStore = { email: user.email, isAdmin: user.isAdmin };
        setCurrentUser(userToStore);
        return { success: true, message: 'Logged in successfully!', isAdmin: user.isAdmin };
    };

    const signup = (email: string, password: string, referralCode: string) => {
        if (!validReferralCodes.includes(referralCode)) {
            return { success: false, message: 'Invalid invitation code.' };
        }
        if (users.find(u => u.email === email)) {
            return { success: false, message: 'An account with this email already exists.' };
        }

        const newUser: User = { email, password, isAdmin: false };
        setUsers(prev => [...prev, newUser]);
        
        const userToStore = { email: newUser.email, isAdmin: newUser.isAdmin };
        setCurrentUser(userToStore);

        return { success: true, message: 'Account created successfully!' };
    };

    const logout = () => {
        setCurrentUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ currentUser, login, signup, logout }}>
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
