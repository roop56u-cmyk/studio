
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { TrendingUp, Lock, Percent } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

interface RateDisplayPanelProps {
  isLocked?: boolean;
  rate?: number | null;
  title: string;
}

export function RateDisplayPanel({ isLocked = false, rate = 0, title }: RateDisplayPanelProps) {

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {title}
            </CardTitle>
            {isLocked ? <Lock className="h-4 w-4 text-muted-foreground" /> : <Percent className="h-4 w-4 text-muted-foreground" />}
        </div>
        <CardDescription>Based on your current level</CardDescription>
      </CardHeader>
      <CardContent>
        {isLocked ? (
             <div className="text-2xl font-bold">-.--%</div>
        ) : rate !== null ? (
            <div className="text-2xl font-bold">{rate?.toFixed(2)}%</div>
        ) : (
            <Skeleton className="h-8 w-24" />
        )}
         <p className="text-xs text-muted-foreground pt-2">
            {isLocked ? "Unlock by committing funds." : "Annual Percentage Yield (APY)"}
        </p>
      </CardContent>
    </Card>
  );
}
