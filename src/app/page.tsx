

"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { WelcomeAnimation } from '@/components/landing/welcome-animation';
import { Logo } from '@/components/logo';
import { useState, useEffect } from 'react';
import type { CustomButton } from './dashboard/admin/website-ui/page';
import { cn } from '@/lib/utils';

const gradients = [
    "bg-gradient-purple",
    "bg-gradient-orange",
    "bg-gradient-teal",
    "bg-gradient-sky",
    "bg-gradient-pink",
    "bg-gradient-blue",
    "bg-gradient-amber",
    "bg-gradient-rose",
    "bg-gradient-fuchsia",
    "bg-gradient-violet",
];

export default function Home() {
  const [title, setTitle] = useState("Welcome to TaskReview Hub");
  const [subtitle, setSubtitle] = useState("Your central place to rate, review, and analyze tasks and services. Get started by creating an account or signing in.");
  const [customButtons, setCustomButtons] = useState<CustomButton[]>([]);
  const [gradient, setGradient] = useState(gradients[0]);

  useEffect(() => {
    const savedTitle = localStorage.getItem('website_title');
    if (savedTitle) setTitle(savedTitle);
    
    const savedSubtitle = localStorage.getItem('website_subtitle');
    if (savedSubtitle) setSubtitle(savedSubtitle);

    const savedButtons = localStorage.getItem('website_custom_buttons');
    if(savedButtons) setCustomButtons(JSON.parse(savedButtons));
    
    const interval = setInterval(() => {
      setGradient(prev => {
        const currentIndex = gradients.indexOf(prev);
        const nextIndex = (currentIndex + 1) % gradients.length;
        return gradients[nextIndex];
      });
    }, 7000); // Increased interval to 7 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn("relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden transition-all duration-1000", gradient)}>
      <WelcomeAnimation />
      <div className="absolute inset-0" />
      <div className="relative z-10 flex flex-col items-center justify-center text-center p-4">
        <Logo className="mb-8 text-5xl md:text-7xl text-white" />
        <h1 className="text-4xl font-bold tracking-tighter text-white sm:text-5xl md:text-6xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-white/80 md:text-xl">
          {subtitle}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button asChild size="lg" className="bg-white/90 text-primary hover:bg-white">
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
            <Link href="/login">Sign In</Link>
          </Button>
           {customButtons.filter(b => b.enabled).map(button => (
            <Button asChild size="lg" variant="outline" key={button.id} className="bg-transparent text-white border-white/50 hover:bg-white/10 hover:text-white">
              <Link href={button.url} target="_blank" rel="noopener noreferrer">{button.text}</Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
