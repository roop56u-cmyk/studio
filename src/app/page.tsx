

"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { WelcomeAnimation } from '@/components/landing/welcome-animation';
import { Logo } from '@/components/logo';
import { useState, useEffect } from 'react';
import type { CustomButton } from './dashboard/admin/website-ui/page';
import { cn } from '@/lib/utils';
import { gradients } from '@/lib/gradients';

export default function Home() {
  const [title, setTitle] = useState("Welcome to TaskReview Hub");
  const [subtitle, setSubtitle] = useState("Your central place to rate, review, and analyze tasks and services. Get started by creating an account or signing in.");
  const [customButtons, setCustomButtons] = useState<CustomButton[]>([]);
  const [gradient, setGradient] = useState(gradients[0].className);
  const [mainLogoDataUrl, setMainLogoDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const savedTitle = localStorage.getItem('website_title');
    if (savedTitle) setTitle(savedTitle);
    
    const savedSubtitle = localStorage.getItem('website_subtitle');
    if (savedSubtitle) setSubtitle(savedSubtitle);

    const savedButtons = localStorage.getItem('website_custom_buttons');
    if(savedButtons) setCustomButtons(JSON.parse(savedButtons));

    const savedMainLogo = localStorage.getItem('website_main_logo_data_url');
    if(savedMainLogo) {
      setMainLogoDataUrl(savedMainLogo);
    }

    const savedAuthBg = localStorage.getItem('auth_background') || 'random-cycle';
    if (savedAuthBg === 'random-cycle') {
        const interval = setInterval(() => {
            setGradient(gradients[Math.floor(Math.random() * gradients.length)].className);
        }, 7000); 
        return () => clearInterval(interval);
    } else {
        setGradient(savedAuthBg);
    }
  }, []);
  
  const handleButtonClick = (button: CustomButton) => {
    if (button.url.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = button.url;
      link.download = button.fileName || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open(button.url, '_blank', 'noopener,noreferrer');
    }
  };


  return (
    <div className={cn("relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden transition-all duration-1000", gradient)}>
      <WelcomeAnimation />
      <div className="absolute inset-0" />
      <div className="relative z-10 flex flex-col items-center justify-center text-center p-4">
        {mainLogoDataUrl && (
          <Image src={mainLogoDataUrl} alt="Main Logo" width={256} height={128} className="max-h-32 w-auto object-contain mb-8" unoptimized />
        )}
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
            <Button size="lg" variant="outline" key={button.id} onClick={() => handleButtonClick(button)} className="bg-transparent text-white border-white/50 hover:bg-white/10 hover:text-white">
              {button.text}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
