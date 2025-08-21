
"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

export type Message = {
    id: string;
    sender: string; // user email
    recipient: string; // user email or 'admin'
    content: string;
    date: string;
    read: boolean;
};

interface InboxContextType {
  messages: Message[];
  sendMessage: (content: string) => void;
  isLoading: boolean;
}

const mockMessages: Message[] = [
    {
        id: "MSG-001",
        sender: "admin@stakinghub.com",
        recipient: "user1@example.com",
        content: "Welcome to TaskReview Hub! Let us know if you have any questions.",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        read: true,
    },
    {
        id: "MSG-002",
        sender: "user1@example.com",
        recipient: "admin@stakinghub.com",
        content: "Thanks for the welcome!",
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        read: true,
    },
    {
        id: "MSG-003",
        sender: "admin@stakinghub.com",
        recipient: "user1@example.com",
        content: "Your recent withdrawal request has been approved. You should see the funds in your wallet shortly.",
        date: new Date().toISOString(),
        read: false,
    }
];

const InboxContext = createContext<InboxContextType | undefined>(undefined);

export const InboxProvider = ({ children }: { children: ReactNode }) => {
    const { currentUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    
    const [allMessages, setAllMessages] = useState<Message[]>(() => {
        if (typeof window === 'undefined') {
            return mockMessages;
        }
        try {
            const storedMessages = localStorage.getItem('inbox_messages');
            return storedMessages ? JSON.parse(storedMessages) : mockMessages;
        } catch (error) {
            console.error("Failed to parse messages from localStorage", error);
            return mockMessages;
        }
    });
    
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        try {
            localStorage.setItem('inbox_messages', JSON.stringify(allMessages));
        } catch (error) {
            console.error("Failed to save messages to localStorage", error);
        }
    }, [allMessages]);

    useEffect(() => {
        if (currentUser) {
            setIsLoading(true);
            const userMessages = allMessages.filter(
                m => m.sender === currentUser.email || m.recipient === currentUser.email
            ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            setMessages(userMessages);
            setIsLoading(false);
        } else {
            setMessages([]);
        }
    }, [currentUser, allMessages]);
    

    const sendMessage = useCallback((content: string) => {
        if (!currentUser) return;
        setIsLoading(true);

        const newMessage: Message = {
            id: `MSG-${Date.now()}`,
            sender: currentUser.email,
            recipient: "admin@stakinghub.com", // All user messages go to admin
            content,
            date: new Date().toISOString(),
            read: false,
        };

        // Simulate async operation
        setTimeout(() => {
            setAllMessages(prev => [...prev, newMessage]);
            setIsLoading(false);
        }, 500);

    }, [currentUser]);


    return (
        <InboxContext.Provider value={{ messages, sendMessage, isLoading }}>
            {children}
        </InboxContext.Provider>
    );
};

export const useInbox = () => {
    const context = useContext(InboxContext);
    if (context === undefined) {
        throw new Error('useInbox must be used within an InboxProvider');
    }
    return context;
};
