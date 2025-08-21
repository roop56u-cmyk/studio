
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
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

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [invitationCode, setInvitationCode] = useState("");

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    const result = signup(email, password, invitationCode);

    if (result.success) {
      toast({
        title: "Account Created!",
        description: "Welcome! You are now being redirected to your dashboard.",
      });
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
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
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
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />
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
