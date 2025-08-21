
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, DollarSign, CheckSquare, PlayCircle, Lock } from "lucide-react";
import type { Level } from "./level-tiers";

interface LevelDetailDialogProps {
  level: Level;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isCurrentLevel: boolean;
  isTaskLocked: boolean;
  onStartTasks: () => void;
}

export function LevelDetailDialog({
  level,
  open,
  onOpenChange,
  isCurrentLevel,
  isTaskLocked,
  onStartTasks,
}: LevelDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            Level {level.level} Details
            <span className="text-sm font-normal text-primary bg-primary/10 px-2 py-1 rounded-full">
              {level.rate}% APY
            </span>
          </DialogTitle>
          {isCurrentLevel && (
            <DialogDescription className="text-primary font-semibold">
              This is your current level.
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="py-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 mr-3 text-muted-foreground" />
                <div className="text-sm">
                  <p className="font-semibold">
                    ${level.minAmount.toLocaleString()}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Minimum Amount to Unlock
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <CheckSquare className="h-5 w-5 mr-3 text-muted-foreground" />
                <div className="text-sm">
                  <p className="font-semibold">{level.dailyTasks} Tasks / Day</p>
                  <p className="text-muted-foreground text-xs">
                    Daily Task Quota
                  </p>
                </div>
              </div>
              {level.referrals !== null && (
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div className="text-sm">
                    <p className="font-semibold">
                      {level.referrals} Direct Referrals
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Required to Unlock
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        {isCurrentLevel && (
          <DialogFooter>
            <Button onClick={onStartTasks} disabled={isTaskLocked} className="w-full">
              <PlayCircle className="mr-2 h-4 w-4" />
              {isTaskLocked ? "Tasks Locked" : "Start Tasks"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
