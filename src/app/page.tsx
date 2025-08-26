

"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { WelcomeAnimation } from '@/components/landing/welcome-animation';
import { Logo } from '@/components/logo';
import { useState, useEffect } from 'react';
import type { CustomButton } from './dashboard/admin/website-ui/page';

export default function Home() {
  const [title, setTitle] = useState("Welcome to TaskReview Hub");
  const [subtitle, setSubtitle] = useState("Your central place to rate, review, and analyze tasks and services. Get started by creating an account or signing in.");
  const [customButtons, setCustomButtons] = useState<CustomButton[]>([]);

  useEffect(() => {
    const savedTitle = localStorage.getItem('website_title');
    if (savedTitle) setTitle(savedTitle);
    
    const savedSubtitle = localStorage.getItem('website_subtitle');
    if (savedSubtitle) setSubtitle(savedSubtitle);

    const savedButtons = localStorage.getItem('website_custom_buttons');
    if(savedButtons) setCustomButtons(JSON.parse(savedButtons));
  }, []);

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background">
      <WelcomeAnimation />
      <div className="absolute inset-0" />
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <Logo className="mb-8 text-5xl md:text-7xl" />
        <h1 className="text-4xl font-bold tracking-tighter text-foreground sm:text-5xl md:text-6xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground md:text-xl">
          {subtitle}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/login">Sign In</Link>
          </Button>
           {customButtons.filter(b => b.enabled).map(button => (
            <Button asChild size="lg" variant="outline" key={button.id}>
              <Link href={button.url} target="_blank" rel="noopener noreferrer">{button.text}</Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
