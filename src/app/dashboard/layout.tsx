

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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "@/components/logo";
import {
  Home,
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
  Percent,
  Palette,
  LayoutGrid,
  History,
  ClipboardList,
  UserPlus,
  Flame,
  CheckCheck,
  Award,
  Network,
  MessageSquare,
  Trophy,
  CalendarDays,
  ArrowUp,
  Briefcase,
  PieChart,
  ShieldAlert,
  ShoppingCart
} from "lucide-react";
import { WalletBalance } from "@/components/dashboard/wallet-balance";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/contexts/WalletContext";
import { useAuth } from "@/contexts/AuthContext";
import { RechargeDialog } from "@/components/dashboard/recharge-dialog";
import { WithdrawalDialog } from "@/components/dashboard/withdrawal-dialog";
import { useTeamCommission } from "@/hooks/use-team-commission";
import { ActivityHistoryPanel } from "@/components/dashboard/activity-history-panel";
import { TaskHistoryPanel } from "@/components/dashboard/task-history-panel";
import { ReferralCard } from "@/components/dashboard/referral-card";
import { InboxPanel } from "@/components/dashboard/inbox-panel";
import { BoosterStorePanel } from "@/components/dashboard/booster-store-panel";
import { QuestPanel } from "@/components/dashboard/quest-panel";
import { RewardsPanel } from "@/components/dashboard/rewards-panel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { WalletOverviewPanel } from "@/components/dashboard/wallet-overview-panel";
import { AchievementsPanel } from "@/components/dashboard/achievements-panel";
import { useToast } from "@/hooks/use-toast";

// Admin Panel Imports
import UserManagementPage from "./admin/users/page";
import ManageTasksPage from "./admin/tasks/page";
import ManageQuestsPage from "./admin/quests/page";
import ManageBoostersPage from "./admin/boosters/page";
import ManageLevelsPage from "./admin/levels/page";
import TeamCommissionPage from "./admin/team-commission/page";
import AdminNoticesPage from "./admin/notices/page";
import ManageUserPanelsPage from "./admin/user-panels/page";
import WebsiteUIPage from "./admin/website-ui/page";
import SystemSettingsPage from "./admin/settings/page";
import ActivityLogPage from "./admin/activity-log/page";
import ManageRechargeAddressesPage from "./admin/recharge-addresses/page";
import ManageTeamRewardsPage from "./admin/team-rewards/page";
import ManageTeamSizeRewardsPage from "./admin/team-size-rewards/page";
import ManageMessagesPage from "./admin/messages/page";
import ManageDailyRewardsPage from './admin/daily-rewards/page';
import UplineCommissionPage from './admin/upline-commission/page';
import ManageSalaryPage from './admin/salary/page';
import PurchaseHistoryPage from './admin/purchase-history/page';
import type { Notice } from './admin/notices/page';


type PanelType = 'userManagement' | 'taskManagement' | 'questManagement' | 'boosterManagement' | 'levelManagement' | 'teamCommission' | 'uplineCommission' | 'noticeManagement' | 'userPanels' | 'websiteUI' | 'systemSettings' | 'activityLog' | 'inbox' | 'rechargeAddresses' | 'teamRewards' | 'teamSizeRewards' | 'messageManagement' | 'dailyRewards' | 'salaryManagement' | 'purchaseHistory';


const adminPanelComponents: Record<PanelType, React.ComponentType> = {
    userManagement: UserManagementPage,
    taskManagement: ManageTasksPage,
    questManagement: ManageQuestsPage,
    boosterManagement: ManageBoostersPage,
    levelManagement: ManageLevelsPage,
    teamCommission: TeamCommissionPage,
    uplineCommission: UplineCommissionPage,
    noticeManagement: AdminNoticesPage,
    userPanels: ManageUserPanelsPage,
    websiteUI: WebsiteUIPage,
    systemSettings: SystemSettingsPage,
    activityLog: ActivityLogPage,
    inbox: InboxPanel,
    rechargeAddresses: ManageRechargeAddressesPage,
    teamRewards: ManageTeamRewardsPage,
    teamSizeRewards: ManageTeamSizeRewardsPage,
    messageManagement: ManageMessagesPage,
    dailyRewards: ManageDailyRewardsPage,
    salaryManagement: ManageSalaryPage,
    purchaseHistory: PurchaseHistoryPage,
};

const adminPanelTitles: Record<PanelType, { title: string; description: string }> = {
    userManagement: { title: "User Management", description: "Manage all user accounts." },
    taskManagement: { title: "Manage Tasks", description: "Create and configure user tasks." },
    questManagement: { title: "Manage Quests", description: "Manage daily quests for users." },
    boosterManagement: { title: "Manage Boosters", description: "Manage booster packs for the store." },
    levelManagement: { title: "Manage Levels", description: "Configure investment and earning levels." },
    teamCommission: { title: "Team Commission", description: "Set referral commission rates." },
    uplineCommission: { title: "Upline Commission", description: "Set commissions users receive from their upline." },
    noticeManagement: { title: "Manage Notices", description: "Publish announcements for all users." },
    userPanels: { title: "User Panels", description: "Control visibility of user dashboard panels." },
    websiteUI: { title: "Website & UI", description: "Customize the look and feel of the website." },
    systemSettings: { title: "System Settings", description: "Configure global application settings." },
    activityLog: { title: "Activity Log", description: "Review administrative actions." },
    inbox: { title: "Inbox", description: "View and respond to user messages." },
    rechargeAddresses: { title: "Recharge Addresses", description: "Manage official deposit addresses." },
    teamRewards: { title: "Team Rewards", description: "Create and manage team deposit bonuses." },
    teamSizeRewards: { title: "Team Size Rewards", description: "Create and manage rewards for team size milestones." },
    messageManagement: { title: "Manage Messages", description: "Edit platform-wide custom messages and text." },
    dailyRewards: { title: "Daily Login Rewards", description: "Configure rewards for daily check-ins." },
    salaryManagement: { title: "Manage Salary", description: "Create and configure salary packages for users." },
    purchaseHistory: { title: "Purchase History", description: "View user purchases of boosters and quests." },
};

function SidebarContentComponent({ 
    onRechargeClick, 
    onWithdrawalClick, 
    onTransactionHistoryClick, 
    onTaskHistoryClick, 
    onReferralClick, 
    onInboxClick, 
    onBoosterStoreClick, 
    onQuestPanelClick, 
    onRewardsPanelClick, 
    onAdminPanelClick, 
    onWalletOverviewClick, 
    onAchievementsClick,
    onShowInterestWarning,
    onShowTaskWarning
}: { 
    onRechargeClick: () => void, 
    onWithdrawalClick: () => void, 
    onTransactionHistoryClick: () => void, 
    onTaskHistoryClick: () => void, 
    onReferralClick: () => void, 
    onInboxClick: () => void, 
    onBoosterStoreClick: () => void, 
    onQuestPanelClick: () => void, 
    onRewardsPanelClick: () => void, 
    onAdminPanelClick: (panel: PanelType) => void, 
    onWalletOverviewClick: () => void, 
    onAchievementsClick: () => void,
    onShowInterestWarning: () => void,
    onShowTaskWarning: () => void
}) {
  const pathname = usePathname();
  const { logout, currentUser } = useAuth();
  const { toast } = useToast();
  const { 
    mainBalance,
    handleMoveFunds,
    isLoading,
    isFundMovementLocked,
    tasksCompletedToday,
    dailyTaskQuota
  } = useWallet();
  const [amount, setAmount] = React.useState('');
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);
  
  const isAdmin = currentUser?.isAdmin;
  const isMainAdminPage = pathname === "/dashboard/admin";
  
  const handleLocalMoveFunds = (destination: 'Task Rewards' | 'Interest Earnings') => {
    if (destination === 'Task Rewards' && isFundMovementLocked('task')) {
        onShowTaskWarning();
        return;
    }
    if (destination === 'Interest Earnings' && isFundMovementLocked('interest')) {
        onShowInterestWarning();
        return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({ variant: 'destructive', title: 'Invalid Amount', description: 'Please enter a valid positive number to move.' });
      return;
    }
    if (numericAmount > mainBalance) {
      toast({ variant: "destructive", title: "Insufficient Funds", description: `You cannot move more than your main balance of $${mainBalance.toFixed(2)}.` });
      return;
    }

    handleMoveFunds(destination, numericAmount);
    setAmount('');
  };


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
                    <SidebarMenuButton asChild isActive={isMainAdminPage} tooltip={{ children: "Home" }}>
                        <Link href="/dashboard/admin">
                            <Home />
                            <span>Home</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => onAdminPanelClick('userManagement')} tooltip={{ children: "Manage Users" }}>
                        <UserCog />
                        <span>User Management</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => onAdminPanelClick('taskManagement')} tooltip={{ children: "Manage Tasks" }}>
                        <ListChecks />
                        <span>Manage Tasks</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => onAdminPanelClick('questManagement')} tooltip={{ children: "Manage Quests" }}>
                        <CheckCheck />
                        <span>Manage Quests</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => onAdminPanelClick('boosterManagement')} tooltip={{ children: "Manage Boosters" }}>
                        <Flame />
                        <span>Manage Boosters</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => onAdminPanelClick('salaryManagement')} tooltip={{ children: "Manage Salary" }}>
                        <Briefcase />
                        <span>Manage Salary</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => onAdminPanelClick('purchaseHistory')} tooltip={{ children: "Purchase History" }}>
                        <ShoppingCart />
                        <span>Purchase History</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => onAdminPanelClick('levelManagement')} tooltip={{ children: "Manage Levels" }}>
                        <SlidersHorizontal />
                        <span>Manage Levels</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => onAdminPanelClick('teamCommission')} tooltip={{ children: "Team Commission" }}>
                        <Percent />
                        <span>Team Commission</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => onAdminPanelClick('uplineCommission')} tooltip={{ children: "Upline Commission" }}>
                        <ArrowUp />
                        <span>Upline Commission</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => onAdminPanelClick('dailyRewards')} tooltip={{ children: "Daily Rewards" }}>
                        <CalendarDays />
                        <span>Daily Rewards</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => onAdminPanelClick('teamRewards')} tooltip={{ children: "Team Rewards" }}>
                        <Award />
                        <span>Team Rewards</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => onAdminPanelClick('teamSizeRewards')} tooltip={{ children: "Team Size Rewards" }}>
                        <Trophy />
                        <span>Team Size Rewards</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => onAdminPanelClick('noticeManagement')} tooltip={{ children: "Manage Notices" }}>
                        <Megaphone />
                        <span>Manage Notices</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => onAdminPanelClick('messageManagement')} tooltip={{ children: "Manage Messages" }}>
                        <MessageSquare />
                        <span>Manage Messages</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => onAdminPanelClick('rechargeAddresses')} tooltip={{ children: "Recharge Addresses" }}>
                        <Network />
                        <span>Recharge Addresses</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => onAdminPanelClick('userPanels')} tooltip={{ children: "User Panels" }}>
                        <LayoutGrid />
                        <span>User Panels</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => onAdminPanelClick('websiteUI')} tooltip={{ children: "Website & UI" }}>
                        <Palette />
                        <span>Website &amp; UI</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => onAdminPanelClick('systemSettings')} tooltip={{ children: "System Settings" }}>
                        <Settings2 />
                        <span>System Settings</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => onAdminPanelClick('activityLog')} tooltip={{ children: "Activity Log" }}>
                        <Activity />
                        <span>Activity Log</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={onInboxClick} tooltip={{ children: "Inbox" }}>
                        <Mail />
                        <span>Inbox</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </>
        ) : (
            <>
                <SidebarMenuItem>
                <SidebarMenuButton
                    asChild
                    isActive={pathname === "/dashboard/user"}
                    tooltip={{ children: "Home" }}
                >
                    <Link href="/dashboard/user">
                    <Home />
                    <span>Home</span>
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        onClick={onAchievementsClick}
                        tooltip={{ children: "Achievements" }}
                    >
                        <Trophy />
                        <span>Achievements</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton
                        onClick={onWalletOverviewClick}
                        tooltip={{ children: "Wallet Overview" }}
                    >
                        <PieChart />
                        <span>Wallet Overview</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        onClick={onQuestPanelClick}
                        tooltip={{ children: "Daily Quests" }}
                    >
                        <CheckCheck />
                        <span>Daily Quests</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton
                        onClick={onRewardsPanelClick}
                        tooltip={{ children: "Rewards" }}
                    >
                        <Gift />
                        <span>Rewards</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                <SidebarMenuButton
                    onClick={onBoosterStoreClick}
                    tooltip={{ children: "Boosters" }}
                >
                    <Flame />
                    <span>Boosters</span>
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
                    onClick={onReferralClick}
                    tooltip={{ children: "Invite Friends" }}
                >
                    <UserPlus />
                    <span>Invite Friends</span>
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
                    <SidebarMenuButton onClick={onInboxClick} tooltip={{ children: "Inbox" }}>
                        <Mail />
                        <span>Inbox</span>
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
                                <Button variant="outline" size="sm" className="justify-start gap-2 w-full" onClick={() => handleLocalMoveFunds("Task Rewards")}>
                                    <Gift className="h-4 w-4 text-primary" />
                                    <span>Move to Task Rewards</span>
                                </Button>
                                <Button variant="outline" size="sm" className="justify-start gap-2 w-full" onClick={() => handleLocalMoveFunds("Interest Earnings")}>
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
                <SidebarMenuItem>
                    <SidebarMenuButton
                        onClick={onTransactionHistoryClick}
                        tooltip={{ children: "Activity History" }}
                    >
                        <History />
                        <span>Activity History</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        onClick={onTaskHistoryClick}
                        tooltip={{ children: "Task History" }}
                    >
                        <ClipboardList />
                        <span>Task History</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </>
        )}
      </SidebarMenu>
    </SidebarContent>
  );
}

const StarParticle = ({ size, style }: { size: number, style: React.CSSProperties }) => (
    <div style={{
        position: 'absolute',
        width: `${size}px`,
        height: `${size}px`,
        background: 'white',
        borderRadius: '50%',
        boxShadow: '0 0 6px 2px white',
        ...style
    }} />
);

const AnimatedDashboardBackground = () => {
    const [stars, setStars] = React.useState<React.ReactNode[]>([]);
    const [isClient, setIsClient] = React.useState(false);
    const [theme, setTheme] = React.useState('');

    React.useEffect(() => {
        setIsClient(true);
        const savedTheme = localStorage.getItem('landing_theme') || '';
         if (savedTheme === 'cosmic-voyage') {
            setTheme(savedTheme);
        }
    }, []);

    React.useEffect(() => {
        if (!isClient || theme !== 'cosmic-voyage') return;

        const generatedStars = Array.from({ length: 50 }).map((_, i) => {
            const size = Math.random() * 2 + 1;
            const style: React.CSSProperties = {
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `twinkle ${Math.random() * 5 + 2}s linear infinite`,
            };
            return <StarParticle key={i} size={size} style={style} />;
        });
        setStars(generatedStars);
    }, [isClient, theme]);
    
    if (!isClient || theme !== 'cosmic-voyage') {
        return null;
    }

    return (
        <>
            <style>{`
                @keyframes twinkle {
                    0% { opacity: 0; }
                    50% { opacity: 1; }
                    100% { opacity: 0; }
                }
            `}</style>
            <div className="dashboard-background">
                {stars}
            </div>
        </>
    );
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const { logout, currentUser } = useAuth();
    const { isInactiveWarningOpen, setIsInactiveWarningOpen } = useWallet();
    const [isClient, setIsClient] = React.useState(false);
    const [isRechargeOpen, setIsRechargeOpen] = React.useState(false);
    const [isWithdrawalOpen, setIsWithdrawalOpen] = React.useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = React.useState(false);
    const [isTaskHistoryOpen, setIsTaskHistoryOpen] = React.useState(false);
    const [isReferralOpen, setIsReferralOpen] = React.useState(false);
    const [isInboxOpen, setIsInboxOpen] = React.useState(false);
    const [isBoosterStoreOpen, setIsBoosterStoreOpen] = React.useState(false);
    const [isQuestPanelOpen, setIsQuestPanelOpen] = React.useState(false);
    const [isRewardsPanelOpen, setIsRewardsPanelOpen] = React.useState(false);
    const [isWalletOverviewOpen, setIsWalletOverviewOpen] = React.useState(false);
    const [isAchievementsOpen, setIsAchievementsOpen] = React.useState(false);


    // Admin panel states
    const [isAdminPanelOpen, setIsAdminPanelOpen] = React.useState(false);
    const [activeAdminPanel, setActiveAdminPanel] = React.useState<PanelType | null>(null);
    const AdminPanelComponent = activeAdminPanel ? adminPanelComponents[activeAdminPanel] : null;

    // Login Popup Notice State
    const [loginNotice, setLoginNotice] = React.useState<Notice | null>(null);
    const [isLoginNoticeOpen, setIsLoginNoticeOpen] = React.useState(false);
    
    // Main wallet warning popups
    const [isInterestMoveWarningOpen, setIsInterestMoveWarningOpen] = React.useState(false);
    const [isTaskMoveWarningOpen, setIsTaskMoveWarningOpen] = React.useState(false);

    useTeamCommission();

    React.useEffect(() => {
        setIsClient(true);
        const showLoginPopup = sessionStorage.getItem("show_login_popup");
        if (showLoginPopup === "true") {
            const popupEnabled = localStorage.getItem("login_popup_enabled") === "true";
            if (popupEnabled) {
                const noticeId = localStorage.getItem("login_popup_notice_id");
                const allNoticesStr = localStorage.getItem("platform_notices");
                if (noticeId && allNoticesStr) {
                    const allNotices: Notice[] = JSON.parse(allNoticesStr);
                    const noticeToShow = allNotices.find(n => n.id === noticeId);
                    if (noticeToShow) {
                        setLoginNotice(noticeToShow);
                        setIsLoginNoticeOpen(true);
                    }
                }
            }
            sessionStorage.removeItem("show_login_popup");
        }
    }, []);
    
    const handleAdminPanelClick = (panel: PanelType) => {
        setActiveAdminPanel(panel);
        setIsAdminPanelOpen(true);
    }
    
    const handleInboxClick = () => {
        if (currentUser?.isAdmin) {
            handleAdminPanelClick('inbox');
        } else {
            setIsInboxOpen(true);
        }
    }

  return (
      <SidebarProvider>
      <div className="relative flex min-h-screen">
          <Sidebar collapsible="offcanvas">
            <SidebarContentComponent 
                onRechargeClick={() => setIsRechargeOpen(true)}
                onWithdrawalClick={() => setIsWithdrawalOpen(true)}
                onTransactionHistoryClick={() => setIsHistoryOpen(true)}
                onTaskHistoryClick={() => setIsTaskHistoryOpen(true)}
                onReferralClick={() => setIsReferralOpen(true)}
                onInboxClick={handleInboxClick}
                onBoosterStoreClick={() => setIsBoosterStoreOpen(true)}
                onQuestPanelClick={() => setIsQuestPanelOpen(true)}
                onRewardsPanelClick={() => setIsRewardsPanelOpen(true)}
                onAdminPanelClick={handleAdminPanelClick}
                onWalletOverviewClick={() => setIsWalletOverviewOpen(true)}
                onAchievementsClick={() => setIsAchievementsOpen(true)}
                onShowInterestWarning={() => setIsInterestMoveWarningOpen(true)}
                onShowTaskWarning={() => setIsTaskMoveWarningOpen(true)}
            />
          </Sidebar>
          <div className="flex flex-1 flex-col">
           <AnimatedDashboardBackground />
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-transparent px-4 md:px-6">
              <SidebarTrigger />
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
                        <AvatarImage src={`https://placehold.co/40x40/${'673ab7'}/${'ffffff'}.png?text=ME`} alt="User Avatar" data-ai-hint="user avatar" />
                        <AvatarFallback>{currentUser?.email?.[0].toUpperCase() ?? 'U'}</AvatarFallback>
                        </Avatar>
                        <span className="sr-only">Toggle user menu</span>
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                     <DropdownMenuItem asChild>
                        <Link href="/dashboard/profile">
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </Link>
                    </DropdownMenuItem>
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
          <main className="flex-1 px-2 md:p-4 lg:p-6">
              {children}
          </main>
          </div>
      </div>
       <RechargeDialog open={isRechargeOpen} onOpenChange={setIsRechargeOpen} />
       <WithdrawalDialog open={isWithdrawalOpen} onOpenChange={setIsWithdrawalOpen} />
       <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
            <SheetContent className="w-full sm:max-w-lg">
                <SheetHeader>
                    <SheetTitle>Activity History</SheetTitle>
                    <SheetDescription>
                        A log of your recent account activities.
                    </SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
                    <ActivityHistoryPanel />
                </ScrollArea>
            </SheetContent>
        </Sheet>
        <Sheet open={isTaskHistoryOpen} onOpenChange={setIsTaskHistoryOpen}>
            <SheetContent className="w-full sm:max-w-lg">
                <SheetHeader>
                    <SheetTitle>Task History</SheetTitle>
                    <SheetDescription>
                        A log of your recently completed tasks.
                    </SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
                    <TaskHistoryPanel />
                </ScrollArea>
            </SheetContent>
        </Sheet>
         <Sheet open={isReferralOpen} onOpenChange={setIsReferralOpen}>
            <SheetContent className="w-full sm:max-w-sm">
                <SheetHeader>
                    <SheetTitle>Invite Friends</SheetTitle>
                    <SheetDescription>
                        Share your code to earn commissions from your team.
                    </SheetDescription>
                </SheetHeader>
                <div className="mt-4">
                    <ReferralCard />
                </div>
            </SheetContent>
        </Sheet>
        <Sheet open={isInboxOpen} onOpenChange={setIsInboxOpen}>
            <SheetContent className="w-full sm:max-w-2xl">
                <SheetHeader>
                    <SheetTitle>Inbox</SheetTitle>
                    <SheetDescription>
                        {currentUser?.isAdmin ? "Manage all user conversations." : "View messages and communicate with support."}
                    </SheetDescription>
                </SheetHeader>
                <div className="mt-4">
                    <InboxPanel />
                </div>
            </SheetContent>
        </Sheet>
         <Sheet open={isBoosterStoreOpen} onOpenChange={setIsBoosterStoreOpen}>
            <SheetContent className="w-full sm:max-w-lg">
                <SheetHeader>
                    <SheetTitle>Booster Store</SheetTitle>
                    <SheetDescription>
                        Purchase temporary boosts to enhance your earning potential.
                    </SheetDescription>
                </SheetHeader>
                <div className="mt-4">
                    <BoosterStorePanel />
                </div>
            </SheetContent>
        </Sheet>
         <Sheet open={isQuestPanelOpen} onOpenChange={setIsQuestPanelOpen}>
            <SheetContent className="w-full sm:max-w-lg">
                <SheetHeader>
                    <SheetTitle>Daily Quests</SheetTitle>
                    <SheetDescription>
                        Complete daily quests to earn extra rewards.
                    </SheetDescription>
                </SheetHeader>
                <div className="mt-4">
                    <QuestPanel />
                </div>
            </SheetContent>
        </Sheet>
         <Sheet open={isRewardsPanelOpen} onOpenChange={setIsRewardsPanelOpen}>
            <SheetContent className="w-full sm:max-w-lg">
                <SheetHeader>
                    <SheetTitle>Claim Rewards</SheetTitle>
                    <SheetDescription>
                        Claim your sign-up and referral bonuses here.
                    </SheetDescription>
                </SheetHeader>
                <div className="mt-4">
                    <RewardsPanel />
                </div>
            </SheetContent>
        </Sheet>
        <Sheet open={isWalletOverviewOpen} onOpenChange={setIsWalletOverviewOpen}>
             <SheetContent className="w-full sm:max-w-lg">
                <SheetHeader>
                    <SheetTitle>Wallet Overview</SheetTitle>
                    <SheetDescription>Visualize your earnings and financial distribution.</SheetDescription>
                </SheetHeader>
                <div className="mt-4">
                    <WalletOverviewPanel />
                </div>
            </SheetContent>
        </Sheet>
        <Sheet open={isAchievementsOpen} onOpenChange={setIsAchievementsOpen}>
            <SheetContent className="w-full sm:max-w-lg">
                <SheetHeader>
                    <SheetTitle>My Achievements</SheetTitle>
                    <SheetDescription>View your unlocked milestones and badges.</SheetDescription>
                </SheetHeader>
                 <div className="mt-4">
                    <AchievementsPanel />
                </div>
            </SheetContent>
        </Sheet>
        <Sheet open={isAdminPanelOpen} onOpenChange={setIsAdminPanelOpen}>
             <SheetContent className="w-full sm:max-w-4xl overflow-y-auto">
                {activeAdminPanel && (
                    <>
                        <SheetHeader>
                            <SheetTitle>{adminPanelTitles[activeAdminPanel].title}</SheetTitle>
                            <SheetDescription>
                                {adminPanelTitles[activeAdminPanel].description}
                            </SheetDescription>
                        </SheetHeader>
                        <div className="mt-4">
                            {AdminPanelComponent && <AdminPanelComponent />}
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
        {loginNotice && (
            <AlertDialog open={isLoginNoticeOpen} onOpenChange={setIsLoginNoticeOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{loginNotice.title}</AlertDialogTitle>
                        <AlertDialogDescription className="whitespace-pre-wrap">
                            {loginNotice.content}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setIsLoginNoticeOpen(false)}>Close</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        )}
        <AlertDialog open={isInterestMoveWarningOpen} onOpenChange={setIsInterestMoveWarningOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Action Locked</AlertDialogTitle>
                    <AlertDialogDescription>
                        You cannot move funds to the Interest Earnings wallet while the 24-hour interest timer is active. Please wait for the timer to complete.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={() => setIsInterestMoveWarningOpen(false)}>OK</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        <AlertDialog open={isTaskMoveWarningOpen} onOpenChange={setIsTaskMoveWarningOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Action Locked</AlertDialogTitle>
                    <AlertDialogDescription>
                       You cannot move funds to the Task Rewards wallet while your daily tasks are in progress. Please complete all tasks for today to unlock this action.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={() => setIsTaskMoveWarningOpen(false)}>OK</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        <AlertDialog open={isInactiveWarningOpen} onOpenChange={setIsInactiveWarningOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <ShieldAlert className="h-6 w-6 text-destructive" />
                        Account Inactive
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                       Your account is currently inactive. You must make a qualifying deposit to activate your account and access this feature.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={() => setIsInactiveWarningOpen(false)}>OK</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </SidebarProvider>
  );
}
