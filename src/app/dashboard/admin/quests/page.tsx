
"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";


export default function ManageQuestsPage() {
    
  return (
    <div className="grid gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Manage Daily Quests</h1>
                <p className="text-muted-foreground">
                    Create and configure daily quests for users.
                </p>
            </div>
             <div className="flex gap-2">
                 <Button variant="default">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Quest
                </Button>
            </div>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Current Quests</CardTitle>
                 <CardDescription>
                    This feature is under development. Please check back later.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground text-center py-12">No daily quests have been configured yet.</p>
            </CardContent>
        </Card>
    </div>
  );
}
