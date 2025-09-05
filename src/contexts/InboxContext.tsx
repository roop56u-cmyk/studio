
"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';

export type Message = {
    id: string;
    sender: string; // user email
    recipient: string; // user email or 'admin@stakinghub.com'
    content: string;
    date: string;
    read: boolean;
    imageUrl?: string | null;
};

type Conversation = {
    email: string;
    lastMessage: string;
    lastMessageDate: string;
};

interface InboxContextType {
  messages: Message[];
  sendMessage: (content: string, imageUrl?: string | null) => void;
  adminSendMessage: (recipientEmail: string, content: string, imageUrl?: string | null) => void;
  isLoading: boolean;
  conversations: Conversation[];
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
    
    // Derived state for the current user's messages
    const messages = useMemo(() => {
        if (!currentUser || currentUser.isAdmin) return [];
        return allMessages
            .filter(m => m.sender === currentUser.email || m.recipient === currentUser.email)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [currentUser, allMessages]);
    
    // Derived state for admin's conversation list
    const conversations = useMemo(() => {
        if (!currentUser?.isAdmin) return [];
        
        const convos: {[key: string]: Conversation} = {};

        allMessages.forEach(msg => {
            const otherParty = msg.sender === 'admin@stakinghub.com' ? msg.recipient : msg.sender;
            if (otherParty === 'admin@stakinghub.com') return;

            if (!convos[otherParty] || new Date(msg.date) > new Date(convos[otherParty].lastMessageDate)) {
                convos[otherParty] = {
                    email: otherParty,
                    lastMessage: msg.content,
                    lastMessageDate: msg.date,
                };
            }
        });

        return Object.values(convos).sort((a,b) => new Date(b.lastMessageDate).getTime() - new Date(a.lastMessageDate).getTime());

    }, [currentUser, allMessages]);

    useEffect(() => {
        try {
            localStorage.setItem('inbox_messages', JSON.stringify(allMessages));
        } catch (error) {
            console.error("Failed to save messages to localStorage", error);
        }
    }, [allMessages]);

    const sendMessage = useCallback((content: string, imageUrl: string | null = null) => {
        if (!currentUser) return;
        setIsLoading(true);

        const newMessage: Message = {
            id: `MSG-${Date.now()}`,
            sender: currentUser.email,
            recipient: "admin@stakinghub.com",
            content,
            date: new Date().toISOString(),
            read: false,
            imageUrl: imageUrl || null,
        };

        setTimeout(() => {
            setAllMessages(prev => [...prev, newMessage]);
            setIsLoading(false);
        }, 500);

    }, [currentUser]);

    const adminSendMessage = useCallback((recipientEmail: string, content: string, imageUrl: string | null = null) => {
        if (!currentUser || !currentUser.isAdmin) return;
        setIsLoading(true);
        
        const newMessage: Message = {
            id: `MSG-${Date.now()}`,
            sender: currentUser.email,
            recipient: recipientEmail,
            content,
            date: new Date().toISOString(),
            read: false,
            imageUrl: imageUrl || null,
        };
        
        setTimeout(() => {
            setAllMessages(prev => [...prev, newMessage]);
            setIsLoading(false);
        }, 500);

    }, [currentUser]);


    return (
        <InboxContext.Provider value={{ messages, sendMessage, adminSendMessage, isLoading, conversations }}>
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
