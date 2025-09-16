

"use client";

import React, { useMemo, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { User } from "@/contexts/AuthContext";
import { levels as defaultLevels, Level } from "@/components/dashboard/level-tiers";
import { SalaryPackage } from "@/app/dashboard/admin/salary/page";
import { TeamReward } from "@/app/dashboard/admin/team-rewards/page";
import { TeamSizeReward } from "@/app/dashboard/admin/team-size-rewards/page";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, DollarSign, UserPlus, Briefcase, Activity, Award, CheckCircle, XCircle, Trophy, HandCoins, Info } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Separator } from "../ui/separator";
import { useTeam, getLevelForUser as getTeamLevelForUser } from "@/contexts/TeamContext";

type TeamMember = User & {
    level: number;
    status: 'active' | 'inactive' | 'disabled';
};

type TeamLevelData = {
    count: number;
    activeCount: number;
    members: TeamMember[];
    totalDeposits: number;
};

type TeamData = {
    level1: TeamLevelData;
    level2: TeamLevelData;
    level3: TeamLevelData;
};

const getTotalDepositsForUser = (userEmail: string): number => {
    if (typeof window === 'undefined') return 0;
    return parseFloat(localStorage.getItem(`${userEmail}_totalDeposits`) || '0');
};

export function TeamDataPanel({ user }: { user: User }) {
    const { users } = useAuth();
    const { salaryPackages, teamRewards, teamSizeRewards } = useTeam();
    const [teamData, setTeamData] = React.useState<TeamData | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        setIsLoading(true);
        const calculateLayer = (members: User[]): TeamLevelData => {
            const activeMembers = members.filter(m => users.find(u => u.email === m.email)?.status === 'active');
            const enrichedMembers: TeamMember[] = members.map(m => ({
                ...m,
                level: getTeamLevelForUser(m, users),
                status: users.find(u => u.email === m.email)?.status || m.status
            }));
            const totalDeposits = enrichedMembers.reduce((sum, m) => sum + getTotalDepositsForUser(m.email), 0);
            return { count: members.length, activeCount: activeMembers.length, members: enrichedMembers, totalDeposits };
        };

        const level1Members = users.filter(u => u.referredBy === user.referralCode);
        const level2Members = level1Members.flatMap(l1User => users.filter(u => u.referredBy === l1User.referralCode));
        const level3Members = level2Members.flatMap(l2User => users.filter(u => u.referredBy === l2User.referralCode));
        
        setTeamData({
            level1: calculateLayer(level1Members),
            level2: calculateLayer(level2Members),
            level3: calculateLayer(level3Members),
        });
        setIsLoading(false);
    }, [user, users]);
    
    const totalTeamBusiness = teamData ? teamData.level1.totalDeposits + teamData.level2.totalDeposits + teamData.level3.totalDeposits : 0;
    const totalActiveMembers = teamData ? teamData.level1.activeCount + teamData.level2.activeCount + teamData.level3.activeCount : 0;

    const renderTeamLayer = (title: string, data: TeamLevelData) => (
        <Card>
            <CardHeader className="p-4">
                <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
                <div className="flex items-center text-sm"><UserPlus className="h-4 w-4 mr-2" /> {data.count} Members ({data.activeCount} Active)</div>
                <div className="flex items-center text-sm"><DollarSign className="h-4 w-4 mr-2" /> ${data.totalDeposits.toFixed(2)} Total Deposits</div>
                 <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger className="text-sm">View Members</AccordionTrigger>
                        <AccordionContent>
                        {data.members.length > 0 ? (
                            <ul className="space-y-2 text-sm text-muted-foreground max-h-48 overflow-y-auto">
                                {data.members.map(member => (
                                    <li key={member.email} className="flex justify-between items-center">
                                        <span className="truncate pr-2">{member.email}</span>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <Badge variant={member.status === 'active' ? 'default' : 'secondary'} className={cn('text-xs py-0.5 px-1.5 h-fit', member.status === 'active' ? 'bg-green-100 text-green-800' : '')}>
                                                {member.status}
                                            </Badge>
                                            <Badge variant="secondary" className="text-xs py-0.5 px-1.5 h-fit">Lvl {member.level}</Badge>
                                        </div>
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
    );

    const renderEligibilityCheck = (key: string, title: string, Icon: React.ElementType, requirement: string, userStat: string, isEligible: boolean) => (
         <div key={key} className="flex items-start gap-3">
            <div><Icon className={cn("h-5 w-5", isEligible ? "text-green-500" : "text-red-500")} /></div>
            <div className="flex-1">
                <p className="font-semibold">{title}</p>
                <p className="text-xs text-muted-foreground">Requirement: {requirement}</p>
                <p className="text-xs text-muted-foreground">User Status: {userStat}</p>
            </div>
            {isEligible ? 
                <Badge variant="default" className="bg-green-100 text-green-800">Eligible</Badge> :
                <Badge variant="destructive">Not Eligible</Badge>
            }
        </div>
    )

    if (isLoading || !teamData) {
        return <div className="p-4"><Skeleton className="h-64 w-full" /></div>
    }

    return (
        <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
            <div className="space-y-6 pr-6 pb-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Team Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <div className="flex items-center"><Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />Total Business: <strong className="ml-1">${totalTeamBusiness.toFixed(2)}</strong></div>
                        <div className="flex items-center"><Activity className="h-4 w-4 mr-2 text-muted-foreground" />Active Members: <strong className="ml-1">{totalActiveMembers}</strong></div>
                    </CardContent>
                </Card>

                <div>
                    <h3 className="text-lg font-semibold mb-2">Team Layers</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {renderTeamLayer("Level 1", teamData.level1)}
                        {renderTeamLayer("Level 2", teamData.level2)}
                        {renderTeamLayer("Level 3", teamData.level3)}
                    </div>
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Smart Analysis</CardTitle>
                        <CardDescription>Automated check for reward eligibility based on team data.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {salaryPackages.length === 0 && teamRewards.length === 0 && teamSizeRewards.length === 0 && (
                             <div className="flex items-center justify-center text-sm text-muted-foreground py-8">
                                <Info className="h-4 w-4 mr-2"/>
                                No claimable rewards are configured in the system.
                            </div>
                        )}
                        {salaryPackages.map(pkg => (
                            <div key={pkg.id}>
                                {renderEligibilityCheck(
                                    `salary-${pkg.id}`,
                                    `Salary: ${pkg.name}`,
                                    HandCoins,
                                    `$${pkg.requiredTeamBusiness.toLocaleString()} business & ${pkg.requiredActiveReferrals} active L1`,
                                    `$${totalTeamBusiness.toFixed(2)} & ${teamData.level1.activeCount} L1`,
                                    totalTeamBusiness >= pkg.requiredTeamBusiness && teamData.level1.activeCount >= pkg.requiredActiveReferrals
                                )}
                            </div>
                        ))}
                        {salaryPackages.length > 0 && (teamRewards.length > 0 || teamSizeRewards.length > 0) && <Separator />}
                        
                        {teamRewards.map(reward => (
                             <div key={reward.id}>
                                {renderEligibilityCheck(
                                    `team-${reward.id}`,
                                    `Team Reward: ${reward.title}`,
                                    Award,
                                    `$${reward.requiredAmount.toLocaleString()} in deposits`,
                                    `$${totalTeamBusiness.toFixed(2)}`,
                                    totalTeamBusiness >= reward.requiredAmount
                                )}
                            </div>
                        ))}

                        {teamRewards.length > 0 && teamSizeRewards.length > 0 && <Separator />}

                        {teamSizeRewards.map(reward => (
                            <div key={reward.id}>
                                {renderEligibilityCheck(
                                    `size-${reward.id}`,
                                    `Size Reward: ${reward.title}`,
                                    Trophy,
                                    `${reward.requiredActiveMembers} active members`,
                                    `${totalActiveMembers}`,
                                    totalActiveMembers >= reward.requiredActiveMembers
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </ScrollArea>
    );
}
