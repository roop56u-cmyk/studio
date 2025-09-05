

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
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { gradients } from "@/lib/gradients";


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [gradient, setGradient] = useState(gradients[0].className);
  const [mainLogoDataUrl, setMainLogoDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const savedMainLogo = localStorage.getItem('website_main_logo_data_url');
    if(savedMainLogo) {
      setMainLogoDataUrl(savedMainLogo);
    }

    const savedAuthBg = localStorage.getItem('auth_background') || 'random-cycle';
    if (savedAuthBg === 'random-cycle') {
        const interval = setInterval(() => {
            setGradient(gradients[Math.floor(Math.random() * gradients.length)].className);
        }, 5000);
        return () => clearInterval(interval);
    } else {
        setGradient(savedAuthBg);
    }
  }, []);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const result = login(email, password);

    if (result.success) {
        toast({
            title: "Login Successful",
            description: "Welcome back!",
        });
        
        sessionStorage.setItem("show_login_popup", "true");

        if (result.isAdmin) {
             router.push("/dashboard/admin");
        } else {
             router.push("/dashboard/user");
        }
    } else {
        toast({
            variant: "destructive",
            title: "Login Failed",
            description: result.message,
        });
    }
  };

  const handleForgotPassword = () => {
    toast({
        title: "Forgot Password",
        description: "In a real application, this would trigger a password reset email flow."
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Card className={cn("mx-auto w-full max-w-sm transition-all duration-1000", gradient)}>
        <CardHeader className="text-center">
          {mainLogoDataUrl && (
            <Image src={mainLogoDataUrl} alt="Main Logo" width={128} height={128} className="mx-auto h-32 w-auto object-contain mb-4" unoptimized />
          )}
          <Logo className="justify-center mb-4 text-white"/>
          <CardTitle className="text-2xl text-white">Sign In</CardTitle>
          <CardDescription className="text-white/80">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/20 text-white placeholder:text-white/60 border-white/30"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password" className="text-white">Password</Label>
                 <Button type="button" variant="link" className="ml-auto h-auto p-0 text-xs text-white/80 hover:text-white" onClick={handleForgotPassword}>
                    Forgot password?
                </Button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
             <div className="flex items-center space-x-2">
                <Checkbox id="remember-me" className="border-white/50 data-[state=checked]:bg-white data-[state=checked]:text-primary" />
                <label
                    htmlFor="remember-me"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white/90"
                >
                    Remember me
                </label>
            </div>
            <Button type="submit" className="w-full bg-white/90 text-primary hover:bg-white">
              Sign In
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-white/80">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline text-white">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
