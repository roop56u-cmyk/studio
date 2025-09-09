
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
    const { users, updateUser } = useAuth();
    const [adminUser, setAdminUser] = useState<User | null>(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [referralCode, setReferralCode] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const admin = users.find(u => u.isAdmin);
        if (admin) {
            setAdminUser(admin);
            setEmail(admin.email);
            setPassword(admin.password || "");
            setReferralCode(admin.referralCode);
        }
    }, [users]);
    
    const handleSaveChanges = () => {
        if (!adminUser) return;

        if (!email || !password || !referralCode) {
            toast({ variant: "destructive", title: "Missing Fields", description: "All fields are required."});
            return;
        }

        setIsLoading(true);
        try {
            updateUser(adminUser.email, { email, password, referralCode });
            toast({ title: "Admin Details Updated", description: "Your changes have been saved. You may need to log in again." });
        } catch (error) {
            toast({ variant: "destructive", title: "Update Failed", description: "Could not save changes." });
        } finally {
            setIsLoading(false);
        }
    }

    if (!adminUser) {
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
                        <Label htmlFor="admin-password">Admin Password</Label>
                        <div className="relative">
                            <Input id="admin-password" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} />
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
