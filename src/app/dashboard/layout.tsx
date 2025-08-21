
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
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
  TrendingUp
} from "lucide-react";
import { WalletBalance } from "@/components/dashboard/wallet-balance";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");

  const [mainBalance, setMainBalance] = useState(1234.56);
  const [taskRewardsBalance, setTaskRewardsBalance] = useState(0);
  const [interestEarningsBalance, setInterestEarningsBalance] = useState(0);

  const handleMoveFunds = (destination: 'Task Rewards' | 'Interest Earnings') => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
        toast({
            variant: "destructive",
            title: "Invalid Amount",
            description: "Please enter a valid positive number to move.",
        });
        return;
    }

    if (numericAmount > mainBalance) {
        toast({
            variant: "destructive",
            title: "Insufficient Funds",
            description: "You cannot move more than your main balance.",
        });
        return;
    }

    setMainBalance(prev => prev - numericAmount);

    if (destination === "Task Rewards") {
        setTaskRewardsBalance(prev => prev + numericAmount);
    } else if (destination === "Interest Earnings") {
        setInterestEarningsBalance(prev => prev + numericAmount);
    }

    toast({
      title: "Funds Moved",
      description: `${numericAmount.toFixed(2)} USDT has been notionally moved to ${destination}.`,
    });
    setAmount("");
  };

  const childrenWithProps = React.Children.map(children, child => {
    // Check if the child is a valid React element before cloning
    if (React.isValidElement(child)) {
      // Clone the child element and pass the updated balances as props
      return React.cloneElement(child, { 
        taskRewardsBalance, 
        interestEarningsBalance 
      } as any);
    }
    return child;
  });


  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarContent>
            <SidebarHeader>
              <Logo />
            </SidebarHeader>
            <SidebarMenu>
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
                  isActive={pathname.startsWith("/dashboard/review")}
                  tooltip={{ children: "Submit Review" }}
                >
                  <Link href="/dashboard/user">
                    <Star />
                    <span>Submit Review</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith("/dashboard/profile")}
                  tooltip={{ children: "Profile" }}
                >
                  <Link href="/dashboard/user">
                    <User />
                    <span>Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith("/dashboard/referrals")}
                  tooltip={{ children: "Referrals" }}
                >
                  <Link href="/dashboard/user">
                    <Users />
                    <span>Referrals</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith("/dashboard/admin")}
                  tooltip={{ children: "Admin" }}
                >
                  <Link href="/dashboard/admin">
                    <Shield />
                    <span>Admin</span>
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
                            <WalletBalance 
                              title="Main Balance"
                              balance={mainBalance.toFixed(2)}
                              description="Total available funds."
                            />
                            <div className="space-y-2">
                                <Label htmlFor="move-amount">Amount (USDT)</Label>
                                <Input 
                                    id="move-amount"
                                    type="number"
                                    placeholder="e.g., 50.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                <Button variant="outline" size="sm" className="justify-start gap-2" onClick={() => handleMoveFunds("Task Rewards")}>
                                    <Gift className="h-4 w-4 text-primary" />
                                    <span>Move to Task Rewards</span>
                                </Button>
                                <Button variant="outline" size="sm" className="justify-start gap-2" onClick={() => handleMoveFunds("Interest Earnings")}>
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
                  asChild
                  isActive={pathname === "/dashboard/recharge"}
                  tooltip={{ children: "Recharge" }}
                >
                  <Link href="/dashboard/recharge">
                    <ArrowUpCircle />
                    <span>Recharge</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

               <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/dashboard/withdrawal"}
                  tooltip={{ children: "Withdrawal" }}
                >
                  <Link href="/dashboard/withdrawal">
                    <ArrowDownCircle />
                    <span>Withdrawal</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
              <div className="ml-auto flex-1 sm:flex-initial">
                {/* Optional Search */}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="icon" className="rounded-full">
                    <Avatar>
                      <AvatarImage src="https://placehold.co/40x40.png" alt="User Avatar" data-ai-hint="user avatar" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <span className="sr-only">Toggle user menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/login">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            {childrenWithProps}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
