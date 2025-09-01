
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
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
import { useRequests } from "@/contexts/RequestContext";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

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

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { signup } = useAuth();
  const { addActivity } = useRequests();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [invitationCode, setInvitationCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [gradient, setGradient] = useState(gradients[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setGradient(prev => {
        const currentIndex = gradients.indexOf(prev);
        const nextIndex = (currentIndex + 1) % gradients.length;
        return gradients[nextIndex];
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    const result = signup(email, password, fullName, invitationCode);

    if (result.success) {
      toast({
        title: "Account Created!",
        description: "Welcome! You are now being redirected to your dashboard.",
      });

      if (result.referrerEmail) {
        addActivity(result.referrerEmail, {
          type: 'New Referral',
          description: `A new member, ${fullName} (${email}), joined your team.`,
          date: new Date().toISOString()
        });
      }

      router.push("/dashboard");
    } else {
      toast({
        variant: "destructive",
        title: "Sign-up Failed",
        description: result.message,
      });
    }
  };

  return (
    <div className={cn("flex min-h-screen items-center justify-center p-4 transition-all duration-1000", gradient)}>
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader className="text-center">
           <Logo className="justify-center mb-4"/>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>
            Create your account to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input 
                id="full-name" 
                placeholder="John Doe" 
                required 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
               <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"}
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">Toggle password visibility</span>
                  </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="invitation-code">Invitation Code</Label>
              <Input
                id="invitation-code"
                placeholder="Enter referral code"
                required
                value={invitationCode}
                onChange={(e) => setInvitationCode(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">
              Create Account
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline text-primary">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
