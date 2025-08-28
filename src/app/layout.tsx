

"use client";

import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/contexts/AuthContext';
import { RequestProvider } from '@/contexts/RequestContext';
import { WalletProvider } from '@/contexts/WalletContext';
import { TeamProvider } from '@/contexts/TeamContext';
import { InboxProvider } from '@/contexts/InboxContext';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [websiteName, setWebsiteName] = useState('TaskReview Hub');
  const [theme, setTheme] = useState('');

  useEffect(() => {
    // This effect runs on the client and can access localStorage
    const savedName = localStorage.getItem('website_name') || 'TaskReview Hub';
    setWebsiteName(savedName);
    document.title = savedName;

    const savedTheme = localStorage.getItem('landing_theme');
    if (savedTheme === 'cosmic-voyage') {
      setTheme('theme-cosmic-voyage');
    } else if (savedTheme === 'digital-matrix') {
      setTheme('theme-digital-matrix');
    }
     else {
      setTheme('');
    }

  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>{websiteName}</title>
        <meta name="description" content="Submit and analyze reviews for various tasks and services." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"></link>
      </head>
      <body className={cn("font-body antialiased", theme)}>
        <AuthProvider>
          <RequestProvider>
            <WalletProvider>
                <TeamProvider>
                    <InboxProvider>
                        {children}
                    </InboxProvider>
                </TeamProvider>
            </WalletProvider>
          </RequestProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
