

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "@/components/logo";
import {
  Home,
  Star,
  User,
  Users,
  Search,
  LogOut,
  Settings,
  Shield,
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  ChevronDown,
  Gift,
  TrendingUp,
  SlidersHorizontal,
  Mail,
  UserCog,
  Settings2,
  Activity,
  Megaphone,
  ListChecks,
  Percent
} from "lucide-react";
import { WalletBalance } from "@/components/dashboard/wallet-balance";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/contexts/WalletContext";
import { useAuth } from "@/contexts/AuthContext";
import { RechargeDialog } from "@/components/dashboard/recharge-dialog";
import { WithdrawalDialog } from "@/components/dashboard/withdrawal-dialog";
import { useTeamCommission } from "@/hooks/use-team-commission";


function SidebarContentComponent({ onRechargeClick, onWithdrawalClick }: { onRechargeClick: () => void, onWithdrawalClick: () => void }) {
  const pathname = usePathname();
  const { logout, currentUser } = useAuth();
  const { 
    mainBalance,
    amount, 
    setAmount, 
    handleMoveFunds,
    isLoading
  } = useWallet();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);
  
  const isAdmin = currentUser?.isAdmin;

  return (
    <SidebarContent>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarMenu>
        {!isClient ? (
            <div className="p-2 space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
            </div>
        ) : isAdmin ? (
            <>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/dashboard/admin"} tooltip={{ children: "Dashboard" }}>
                        <Link href="/dashboard/admin">
                            <Home />
                            <span>Dashboard</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/admin/users")} tooltip={{ children: "Manage Users" }}>
                        <Link href="/dashboard/admin/users">
                            <UserCog />
                            <span>User Management</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/admin/tasks")} tooltip={{ children: "Manage Tasks" }}>
                        <Link href="/dashboard/admin/tasks">
                            <ListChecks />
                            <span>Manage Tasks</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/admin/levels")} tooltip={{ children: "Manage Levels" }}>
                        <Link href="/dashboard/admin/levels">
                            <SlidersHorizontal />
                            <span>Manage Levels</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/admin/team-commission")} tooltip={{ children: "Team Commission" }}>
                        <Link href="/dashboard/admin/team-commission">
                            <Percent />
                            <span>Team Commission</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/admin/notices")} tooltip={{ children: "Manage Notices" }}>
                        <Link href="/dashboard/admin/notices">
                            <Megaphone />
                            <span>Manage Notices</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/admin/settings")} tooltip={{ children: "System Settings" }}>
                        <Link href="/dashboard/admin/settings">
                            <Settings2 />
                            <span>System Settings</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/admin/activity-log")} tooltip={{ children: "Activity Log" }}>
                        <Link href="/dashboard/admin/activity-log">
                            <Activity />
                            <span>Activity Log</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/inbox")} tooltip={{ children: "Inbox" }}>
                        <Link href="/dashboard/inbox">
                            <Mail />
                            <span>Inbox</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </>
        ) : (
            <>
                <SidebarMenuItem>
                <SidebarMenuButton
                    asChild
                    isActive={pathname === "/dashboard/user"}
                    tooltip={{ children: "Dashboard" }}
                >
                    <Link href="/dashboard/user">
                    <Home />
                    <span>Dashboard</span>
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith("/dashboard/team")}
                    tooltip={{ children: "Team" }}
                >
                    <Link href="/dashboard/team">
                    <Users />
                    <span>Team</span>
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith("/dashboard/notices")}
                    tooltip={{ children: "Notices" }}
                >
                    <Link href="/dashboard/notices">
                    <Megaphone />
                    <span>Notices</span>
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith("/dashboard/inbox")}
                    tooltip={{ children: "Inbox" }}
                >
                    <Link href="/dashboard/inbox">
                    <Mail />
                    <span>Inbox</span>
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                <Collapsible>
                    <CollapsibleTrigger asChild>
                        <SidebarMenuButton>
                            <Wallet />
                            <span>Wallet</span>
                            <ChevronDown className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <div className="p-2 space-y-4">
                            {isLoading ? (
                                <div className="space-y-2">
                                <Skeleton className="h-6 w-24" />
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-4 w-32" />
                                </div>
                            ) : (
                                <WalletBalance 
                                title="Main Balance"
                                balance={mainBalance.toFixed(2)}
                                description="Total available funds."
                                />
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="move-amount">Amount (USDT)</Label>
                                <Input 
                                    id="move-amount"
                                    type="number"
                                    placeholder="e.g., 50.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                <Button variant="outline" size="sm" className="justify-start gap-2" onClick={() => handleMoveFunds("Task Rewards", 0)} disabled={isLoading}>
                                    <Gift className="h-4 w-4 text-primary" />
                                    <span>Move to Task Rewards</span>
                                </Button>
                                <Button variant="outline" size="sm" className="justify-start gap-2" onClick={() => handleMoveFunds("Interest Earnings", 0)} disabled={isLoading}>
                                    <TrendingUp className="h-4 w-4 text-accent" />
                                    <span>Move to Interest</span>
                                </Button>
                            </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
                </SidebarMenuItem>

                <SidebarMenuItem>
                <SidebarMenuButton
                    onClick={onRechargeClick}
                    tooltip={{ children: "Recharge" }}
                >
                    <ArrowUpCircle />
                    <span>Recharge</span>
                </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                <SidebarMenuButton
                    onClick={onWithdrawalClick}
                    tooltip={{ children: "Withdrawal" }}
                >
                    <ArrowDownCircle />
                    <span>Withdrawal</span>
                </SidebarMenuButton>
                </SidebarMenuItem>
            </>
        )}
      </SidebarMenu>
    </SidebarContent>
  );
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const { logout, currentUser } = useAuth();
    const [isClient, setIsClient] = React.useState(false);
    const [isRechargeOpen, setIsRechargeOpen] = React.useState(false);
    const [isWithdrawalOpen, setIsWithdrawalOpen] = React.useState(false);

    useTeamCommission();

    React.useEffect(() => {
        setIsClient(true);
    }, []);

  return (
      <SidebarProvider>
      <div className="flex min-h-screen">
          <Sidebar>
            <SidebarContentComponent 
                onRechargeClick={() => setIsRechargeOpen(true)}
                onWithdrawalClick={() => setIsWithdrawalOpen(true)}
            />
          </Sidebar>
          <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
              <SidebarTrigger className="md:hidden" />
              <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
              <div className="ml-auto flex-1 sm:flex-initial">
                  {/* Optional Search */}
              </div>
              {!isClient ? (
                <Skeleton className="h-8 w-8 rounded-full" />
                ) : (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="rounded-full">
                        <Avatar>
                        <AvatarImage src="https://placehold.co/40x40.png" alt="User Avatar" data-ai-hint="user avatar" />
                        <AvatarFallback>{currentUser?.email?.[0].toUpperCase() ?? 'U'}</AvatarFallback>
                        </Avatar>
                        <span className="sr-only">Toggle user menu</span>
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href="/dashboard/settings">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href="/login" onClick={logout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </Link>
                    </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              )}
              </div>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8">
              {children}
          </main>
          </div>
      </div>
       <RechargeDialog open={isRechargeOpen} onOpenChange={setIsRechargeOpen} />
       <WithdrawalDialog open={isWithdrawalOpen} onOpenChange={setIsWithdrawalOpen} />
      </SidebarProvider>
  );
}

    

    
