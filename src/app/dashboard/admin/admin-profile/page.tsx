
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import type { User } from "@/contexts/AuthContext";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function AdminProfilePage() {
    const { toast } = useToast();
    const { currentUser, updateUser } = useAuth();
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [referralCode, setReferralCode] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (currentUser && currentUser.isAdmin) {
            setEmail(currentUser.email);
            setReferralCode(currentUser.referralCode);
        }
    }, [currentUser]);
    
    const handleSaveChanges = () => {
        if (!currentUser) return;

        if (!email || !referralCode) {
            toast({ variant: "destructive", title: "Missing Fields", description: "Email and Referral Code are required."});
            return;
        }

        setIsLoading(true);
        try {
            const updateData: Partial<User> & { password?: string } = { email, referralCode };
            if (newPassword) {
                if (newPassword.length < 6) {
                    toast({ variant: "destructive", title: "Password Too Short", description: "New password must be at least 6 characters."});
                    setIsLoading(false);
                    return;
                }
                updateData.password = newPassword;
            }

            // In a real app, this would be a server-side update.
            // For this demo, we simulate it and rely on client-side state management.
            console.log("Simulating update for:", currentUser.id, updateData);
            
            // This is a placeholder for what would be a secure server-side update.
            // We can't actually update the password from the client like this.
            // The `updateUser` in AuthContext is a placeholder.

            toast({ title: "Admin Details Updated", description: "Your changes have been saved." });
            if (newPassword) {
                 toast({ title: "Password Note", description: "In a real app, changing the password would require re-authentication." });
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Update Failed", description: "Could not save changes." });
        } finally {
            setIsLoading(false);
        }
    }

    if (!currentUser || !currentUser.isAdmin) {
        return <div>Loading admin data...</div>;
    }

    return (
        <div className="grid gap-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Admin Profile</h1>
                <p className="text-muted-foreground">
                    Manage the primary administrator credentials.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Administrator Account</CardTitle>
                    <CardDescription>
                        Use this form to update the core admin login details. Be careful, as changes here are immediate.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="admin-email">Admin Email</Label>
                        <Input id="admin-email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="admin-password">New Password (leave blank to keep current)</Label>
                        <div className="relative">
                            <Input id="admin-password" type={showPassword ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                            <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1.5 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="admin-referral">Admin Referral Code</Label>
                        <Input id="admin-referral" value={referralCode} onChange={e => setReferralCode(e.target.value)} />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSaveChanges} disabled={isLoading}>
                         {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Save Changes
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
