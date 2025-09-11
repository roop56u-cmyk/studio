
"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, ShieldCheck, CalendarCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { useEffect, useState } from "react";

export default function ProfilePage() {
    const { currentUser } = useAuth();
    const [isClient, setIsClient] = useState(false);
    
    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient || !currentUser) {
        return null;
    }

    return (
        <div className="max-w-md mx-auto">
            <div className="flex justify-between items-center mb-4">
                <div>
                <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
                <p className="text-muted-foreground">
                    View your account details.
                </p>
                </div>
            </div>
            <Card>
                <CardHeader className="items-center text-center">
                    <Avatar className="h-24 w-24 mb-4">
                        <AvatarImage src={`https://placehold.co/100x100/${'673ab7'}/${'ffffff'}.png?text=${currentUser?.fullName?.[0].toUpperCase() ?? 'U'}`} alt="User Avatar" data-ai-hint="user avatar" />
                        <AvatarFallback className="text-4xl">{currentUser?.fullName?.[0].toUpperCase() ?? 'U'}</AvatarFallback>
                    </Avatar>
                    <CardTitle>{currentUser?.fullName}</CardTitle>
                    <CardDescription>{currentUser?.email}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <span className="text-foreground">{currentUser?.fullName}</span>
                    </div>
                    <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <span className="text-foreground">{currentUser?.email}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-4">
                            <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                            <span className="text-foreground">Account Status</span>
                        </div>
                        <Badge variant={currentUser?.status === 'active' ? 'default' : 'secondary'} className={cn(currentUser?.status === 'active' && 'bg-green-100 text-green-800')}>
                            {currentUser?.status.charAt(0).toUpperCase()}{currentUser?.status.slice(1)}
                        </Badge>
                    </div>
                    {currentUser?.status === 'active' && currentUser.activatedAt && (
                    <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                        <CalendarCheck className="h-5 w-5 text-muted-foreground" />
                        <div className="text-sm">
                            <p className="text-foreground font-medium">Activated On</p>
                            <p className="text-muted-foreground text-xs">{format(new Date(currentUser.activatedAt), 'PPP p')}</p>
                        </div>
                    </div>
                    )}
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/dashboard/settings">
                            Manage Settings & Password
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
