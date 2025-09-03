
"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Edit, Trash2, Trophy, HandCoins } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { levels as defaultLevels, Level } from "@/components/dashboard/level-tiers";
import { useAuth } from "@/contexts/AuthContext";
import { grantManualReward } from "@/app/actions";
import { Loader2 } from "lucide-react";

export type TeamSizeReward = {
  id: string;
  title: string;
  requiredActiveMembers: number;
  rewardAmount: number;
  level: number; // 0 for All Levels
  enabled: boolean;
  userEmail?: string;
};

const ManualGrantForm = () => {
  const { users } = useAuth();
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGrant = async () => {
    if (!selectedUser || !amount || !reason) {
      toast({ variant: "destructive", title: "Missing fields", description: "Please select a user and fill in all fields." });
      return;
    }
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({ variant: "destructive", title: "Invalid Amount", description: "Please enter a valid positive number." });
      return;
    }

    setIsLoading(true);
    try {
      // Fake server delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mainBalanceKey = `${selectedUser}_mainBalance`;
      const currentBalance = parseFloat(localStorage.getItem(mainBalanceKey) || '0');
      localStorage.setItem(mainBalanceKey, (currentBalance + numericAmount).toString());

      const activityHistoryKey = `${selectedUser}_activityHistory`;
      const currentHistory = JSON.parse(localStorage.getItem(activityHistoryKey) || '[]');
      const newActivity = {
        id: `ACT-MANUAL-${Date.now()}`,
        type: "Manual Team Size Reward",
        description: `Manually granted by admin: ${reason}`,
        amount: numericAmount,
        date: new Date().toISOString(),
      };
      localStorage.setItem(activityHistoryKey, JSON.stringify([newActivity, ...currentHistory]));

      toast({ title: "Team Size Reward Granted", description: `${selectedUser} has been credited with $${numericAmount}.` });
      setSelectedUser("");
      setAmount("");
      setReason("");
    } catch (error) {
       toast({ variant: "destructive", title: "Error", description: "Could not grant reward." });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grant Manual Team Size Reward</CardTitle>
        <CardDescription>Directly credit a team size reward to a user's main wallet.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Select User</Label>
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger><SelectValue placeholder="Select a user..." /></SelectTrigger>
            <SelectContent>
              {users.map(u => <SelectItem key={u.email} value={u.email}>{u.email}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Amount (USDT)</Label>
          <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g., 100" />
        </div>
        <div className="space-y-2">
          <Label>Reason</Label>
          <Input value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g., Reached 50 active members" />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleGrant} disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <HandCoins className="mr-2 h-4 w-4" />}
          Grant Reward
        </Button>
      </CardFooter>
    </Card>
  );
};

const RewardForm = ({
  reward,
  onSave,
  onCancel,
  availableLevels,
}: {
  reward: Partial<TeamSizeReward> | null;
  onSave: (reward: Omit<TeamSizeReward, 'id'>) => void;
  onCancel: () => void;
  availableLevels: Level[];
}) => {
  const { users } = useAuth();
  const [title, setTitle] = useState(reward?.title || "");
  const [requiredActiveMembers, setRequiredActiveMembers] = useState(reward?.requiredActiveMembers || 10);
  const [rewardAmount, setRewardAmount] = useState(reward?.rewardAmount || 100);
  const [level, setLevel] = useState(reward?.level ?? 0);
  const [userEmail, setUserEmail] = useState(reward?.userEmail || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || requiredActiveMembers <= 0 || rewardAmount <= 0) {
      alert("Please fill all fields with valid positive values.");
      return;
    }
    onSave({
      title,
      requiredActiveMembers,
      rewardAmount,
      level,
      enabled: reward?.enabled ?? true,
      userEmail,
    });
  };

  const handleUserSelectChange = (value: string) => {
    if (value === "ALL_USERS") {
      setUserEmail("");
    } else {
      setUserEmail(value);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Reward Title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
       <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="requiredActiveMembers">Required Active Members</Label>
            <Input id="requiredActiveMembers" type="number" value={requiredActiveMembers} onChange={(e) => setRequiredActiveMembers(Number(e.target.value))} required />
        </div>
        <div className="space-y-2">
            <Label htmlFor="rewardAmount">Reward (USDT)</Label>
            <Input id="rewardAmount" type="number" value={rewardAmount} onChange={(e) => setRewardAmount(Number(e.target.value))} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="level">Minimum User Level</Label>
        <Select value={String(level)} onValueChange={(v) => setLevel(Number(v))}>
            <SelectTrigger id="level">
                <SelectValue placeholder="Select a level" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="0">All Levels</SelectItem>
                {availableLevels.filter(l => l.level > 0).map(l => (
                    <SelectItem key={l.level} value={String(l.level)}>Level {l.level}</SelectItem>
                ))}
            </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="userEmail">Specific User (Optional)</Label>
        <Select value={userEmail || "ALL_USERS"} onValueChange={handleUserSelectChange}>
            <SelectTrigger id="userEmail">
                <SelectValue placeholder="All users at level" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="ALL_USERS">All users at level</SelectItem>
                {users.map(u => (
                    <SelectItem key={u.email} value={u.email}>{u.email}</SelectItem>
                ))}
            </SelectContent>
        </Select>
      </div>
      
      <DialogFooter>
        <DialogClose asChild>
            <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        </DialogClose>
        <Button type="submit">Save Reward</Button>
      </DialogFooter>
    </form>
  );
};


export default function ManageTeamSizeRewardsPage() {
  const { toast } = useToast();
  const [rewards, setRewards] = useState<TeamSizeReward[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<TeamSizeReward | null>(null);
  const [availableLevels, setAvailableLevels] = useState<Level[]>(defaultLevels);


  useEffect(() => {
    setIsClient(true);
    const storedRewards = localStorage.getItem("platform_team_size_rewards");
    if (storedRewards) {
      setRewards(JSON.parse(storedRewards));
    }
     const storedLevels = localStorage.getItem("platform_levels");
    if (storedLevels) {
        setAvailableLevels(JSON.parse(storedLevels));
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("platform_team_size_rewards", JSON.stringify(rewards));
    }
  }, [rewards, isClient]);

  const handleSaveReward = (rewardData: Omit<TeamSizeReward, 'id'>) => {
    if (editingReward) {
      setRewards(rewards.map(r => r.id === editingReward.id ? { ...r, ...rewardData } : r));
      toast({ title: "Reward Updated" });
    } else {
      setRewards([...rewards, { ...rewardData, id: `TSR-${Date.now()}` }]);
      toast({ title: "Reward Added" });
    }
    closeForm();
  };
  
  const handleAddNew = () => {
    setEditingReward(null);
    setIsFormOpen(true);
  };

  const handleEdit = (reward: TeamSizeReward) => {
    setEditingReward(reward);
    setIsFormOpen(true);
  };
  
  const handleDelete = (id: string) => {
    setRewards(rewards.filter(r => r.id !== id));
    toast({ title: "Reward Deleted", variant: "destructive" });
  };

  const handleToggle = (id: string, enabled: boolean) => {
      setRewards(rewards.map(r => r.id === id ? {...r, enabled} : r));
      toast({ title: `Reward ${enabled ? "Enabled" : "Disabled"}` });
  }
  
  const closeForm = () => {
    setIsFormOpen(false);
    setEditingReward(null);
  }
    
  return (
    <>
        <div className="grid gap-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manage Team Size Rewards</h1>
                    <p className="text-muted-foreground">
                        Create rewards for users who build large, active teams.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="default" onClick={handleAddNew}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New Reward
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Current Rewards ({rewards.length})</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {rewards.map((reward) => (
                            <div key={reward.id} className="border p-4 rounded-lg flex justify-between items-start gap-4">
                                <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <Trophy className="h-5 w-5 text-primary"/>
                                    <h3 className="font-semibold">{reward.title}</h3>
                                </div>
                                <div className="text-xs text-muted-foreground grid grid-cols-2 md:flex md:flex-wrap gap-x-4 gap-y-1 mt-2">
                                    <span><strong className="text-foreground">Required Members:</strong> {reward.requiredActiveMembers}</span>
                                    <span><strong className="text-foreground">Level:</strong> {reward.level === 0 ? 'All' : `${reward.level}+`}</span>
                                    <span><strong className="text-foreground">Reward:</strong> ${reward.rewardAmount.toLocaleString()}</span>
                                    {reward.userEmail && <span><strong className="text-foreground">User:</strong> {reward.userEmail}</span>}
                                </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch 
                                        checked={reward.enabled}
                                        onCheckedChange={(checked) => handleToggle(reward.id, checked)}
                                    />
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(reward)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Delete Reward?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to delete this team size reward? This cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(reward.id)} className="bg-destructive hover:bg-destructive/90">
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                            ))}
                            {rewards.length === 0 && (
                                <p className="text-muted-foreground text-center py-12">No team size rewards have been configured yet.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div>
                    <ManualGrantForm />
                </div>
            </div>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{editingReward ? 'Edit Reward' : 'Add New Reward'}</DialogTitle>
                </DialogHeader>
                <RewardForm
                    reward={editingReward}
                    onSave={handleSaveReward}
                    onCancel={closeForm}
                    availableLevels={availableLevels}
                />
            </DialogContent>
        </Dialog>
    </>
  );
}
