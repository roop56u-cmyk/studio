

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { useToast } from "@/hooks/use-toast";
import { signUp } from "@/app/actions";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { gradients } from "@/lib/gradients";


export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [backgroundClass, setBackgroundClass] = useState("bg-background");
  const [backgroundStyle, setBackgroundStyle] = useState<React.CSSProperties>({});
  const [mainLogoDataUrl, setMainLogoDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const savedMainLogo = localStorage.getItem('website_main_logo_data_url');
    if(savedMainLogo) {
      setMainLogoDataUrl(savedMainLogo);
    }
    
    const customBg = localStorage.getItem('auth_background_custom');
    if (customBg) {
        setBackgroundStyle({ backgroundImage: `url(${customBg})`, backgroundSize: 'cover', backgroundPosition: 'center' });
        setBackgroundClass('');
    } else {
        const savedAuthBg = localStorage.getItem('auth_background_gradient') || 'random-cycle';
        if (savedAuthBg === 'random-cycle') {
            const interval = setInterval(() => {
                setBackgroundClass(gradients[Math.floor(Math.random() * gradients.length)].className);
            }, 5000);
            return () => clearInterval(interval);
        } else {
            setBackgroundClass(savedAuthBg);
        }
    }
  }, []);

  const handleSignUp = async (formData: FormData) => {
    setIsLoading(true);
    const result = await signUp(formData);
    setIsLoading(false);

    if (result.success) {
      toast({
        title: "Check Your Email",
        description: result.message,
      });
      router.push("/login");
    } else {
      toast({
        variant: "destructive",
        title: "Sign-up Failed",
        description: result.message,
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4" style={backgroundStyle}>
      <Card className={cn("mx-auto w-full max-w-sm transition-all duration-1000", backgroundClass, backgroundStyle.backgroundImage ? 'bg-black/50 backdrop-blur-sm border-white/20' : '')}>
        <CardHeader className="text-center">
            {mainLogoDataUrl && (
              <Image src={mainLogoDataUrl} alt="Main Logo" width={128} height={128} className="mx-auto h-32 w-auto object-contain mb-4" unoptimized />
            )}
           <Logo className="justify-center mb-4 text-white"/>
          <CardTitle className="text-2xl text-white">Sign Up</CardTitle>
          <CardDescription className="text-white/80">
            Create your account to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSignUp} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="full-name" className="text-white">Full Name</Label>
              <Input 
                id="full-name" 
                name="fullName"
                placeholder="John Doe" 
                required 
                className="bg-white/20 text-white placeholder:text-white/60 border-white/30"
                />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                className="bg-white/20 text-white placeholder:text-white/60 border-white/30"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-white">Password</Label>
               <div className="relative">
                <Input 
                  id="password" 
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required 
                  className="bg-white/20 text-white placeholder:text-white/60 border-white/30"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-white/80 hover:text-white hover:bg-white/20"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">Toggle password visibility</span>
                  </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="invitation-code" className="text-white">Invitation Code</Label>
              <Input
                id="invitation-code"
                name="invitationCode"
                placeholder="Enter referral code"
                required
                className="bg-white/20 text-white placeholder:text-white/60 border-white/30"
              />
            </div>
            <Button type="submit" className="w-full bg-white/90 text-primary hover:bg-white" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-white/80">
            Already have an account?{" "}
            <Link href="/login" className="underline text-white">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
