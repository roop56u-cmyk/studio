
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
import { Skeleton } from "@/components/ui/skeleton";
import { User, Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { currentUser } = useAuth();

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
                <AvatarImage src={`https://placehold.co/100x100/${'673ab7'}/${'ffffff'}.png?text=${currentUser?.fullName?.[0].toUpperCase() ?? 'U'}`} alt="User Avatar" />
                <AvatarFallback className="text-4xl">{currentUser?.fullName?.[0].toUpperCase() ?? 'U'}</AvatarFallback>
            </Avatar>
            {currentUser ? (
              <CardTitle>{currentUser.fullName}</CardTitle>
            ) : (
                <Skeleton className="h-7 w-48" />
            )}
            {currentUser ? (
                 <CardDescription>{currentUser.email}</CardDescription>
            ) : (
                <Skeleton className="h-5 w-56 mt-1" />
            )}
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                <User className="h-5 w-5 text-muted-foreground" />
                 {currentUser ? (
                    <span className="text-foreground">{currentUser.fullName}</span>
                 ) : (
                    <Skeleton className="h-5 w-full" />
                 )}
            </div>
             <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                <Mail className="h-5 w-5 text-muted-foreground" />
                 {currentUser ? (
                    <span className="text-foreground">{currentUser.email}</span>
                 ) : (
                    <Skeleton className="h-5 w-full" />
                 )}
            </div>
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
