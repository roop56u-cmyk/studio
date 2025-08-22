
"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, DollarSign, UserPlus, Briefcase, Activity } from "lucide-react";
import { useTeam } from "@/contexts/TeamContext";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge";

export default function TeamPage() {
  const { teamData, commissionRates, commissionEnabled, isLoading, totalTeamBusiness, totalActivationsToday } = useTeam();

  const totalCommission = useMemo(() => {
      if (!teamData) return 0;
      let total = 0;
      if (commissionEnabled.level1) total += teamData.level1.commission * (commissionRates.level1 / 100);
      if (commissionEnabled.level2) total += teamData.level2.commission * (commissionRates.level2 / 100);
      if (commissionEnabled.level3) total += teamData.level3.commission * (commissionRates.level3 / 100);
      return total;
  }, [teamData, commissionRates, commissionEnabled]);
  
  const totalMembers = (teamData?.level1?.count ?? 0) + (teamData?.level2?.count ?? 0) + (teamData?.level3?.count ?? 0);

  if (isLoading || !teamData) {
      return (
           <div className="grid gap-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Team</h1>
                    <p className="text-muted-foreground">
                    View your team's structure, commissions, and performance.
                    </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
                    ))}
                </div>
                 <div className="grid md:grid-cols-3 gap-4">
                    <Card><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
                    <Card><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
                    <Card><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
                </div>
            </div>
      )
  }

  const teamLevels = [
      { title: "Level 1", data: teamData.level1, rate: commissionRates.level1, enabled: commissionEnabled.level1 },
      { title: "Level 2", data: teamData.level2, rate: commissionRates.level2, enabled: commissionEnabled.level2 },
      { title: "Level 3", data: teamData.level3, rate: commissionRates.level3, enabled: commissionEnabled.level3 },
  ];

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Team</h1>
        <p className="text-muted-foreground">
          View your team's structure, commissions, and performance.
        </p>
      </div>

       <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${totalCommission.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">Daily earnings from your team</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Team Members</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalMembers}</div>
                    <p className="text-xs text-muted-foreground">Across all 3 layers</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Team Business</CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${totalTeamBusiness.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">Total deposits from all members</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Today's Activations</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+{totalActivationsToday}</div>
                    <p className="text-xs text-muted-foreground">New members joined today</p>
                </CardContent>
            </Card>
      </div>
      
      <div className="grid md:grid-cols-3 gap-4">
        {teamLevels.map(level => (
            <Card key={level.title}>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{level.title}</CardTitle>
                        <span className={`text-sm font-bold ${level.enabled ? 'text-primary' : 'text-muted-foreground'}`}>{level.rate}%</span>
                    </div>
                    <CardDescription>Direct Referrals</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center">
                        <UserPlus className="h-5 w-5 text-muted-foreground mr-3" />
                        <p className="font-semibold">{level.data.count} Members</p>
                     </div>
                     <div className="flex items-center">
                        <DollarSign className="h-5 w-5 text-muted-foreground mr-3" />
                        <p className="font-semibold">${(level.data.commission * (level.rate / 100)).toFixed(2)} Commission</p>
                     </div>
                      <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="item-1">
                            <AccordionTrigger>View Members</AccordionTrigger>
                            <AccordionContent>
                              {level.data.members.length > 0 ? (
                                <ul className="space-y-2 text-sm text-muted-foreground max-h-48 overflow-y-auto">
                                    {level.data.members.map(member => (
                                        <li key={member.email} className="flex justify-between items-center">
                                            <span>{member.email}</span>
                                            <Badge variant="secondary">Lvl {member.level}</Badge>
                                        </li>
                                    ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-center text-muted-foreground py-4">No members in this layer yet.</p>
                              )}
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  );
}
