
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Edit, Trash2, Award } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { levels as defaultLevels, Level } from "@/components/dashboard/level-tiers";

export type TeamReward = {
  id: string;
  title: string;
  description: string;
  level: number; // 0 will mean 'All Levels'
  requiredAmount: number;
  durationDays: number;
  rewardAmount: number;
};

const TeamRewardForm = ({
  reward,
  onSave,
  onCancel,
  availableLevels,
}: {
  reward: Partial<TeamReward> | null;
  onSave: (reward: TeamReward) => void;
  onCancel: () => void;
  availableLevels: Level[];
}) => {
  const [title, setTitle] = useState(reward?.title || "");
  const [description, setDescription] = useState(reward?.description || "");
  const [level, setLevel] = useState(reward?.level ?? 0);
  const [requiredAmount, setRequiredAmount] = useState(reward?.requiredAmount || 1000);
  const [durationDays, setDurationDays] = useState(reward?.durationDays || 7);
  const [rewardAmount, setRewardAmount] = useState(reward?.rewardAmount || 50);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || level < 0 || requiredAmount <= 0 || durationDays <= 0 || rewardAmount <= 0) {
      alert("Please fill all fields with valid positive values.");
      return;
    }
    onSave({
      id: reward?.id || `TRWRD-${Date.now()}`,
      title,
      description,
      level,
      requiredAmount,
      durationDays,
      rewardAmount,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Reward Title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description / Message</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="level">Target Level</Label>
            <Select value={String(level)} onValueChange={(v) => setLevel(Number(v))}>
                <SelectTrigger id="level">
                    <SelectValue placeholder="Select a level" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="0">All Levels</SelectItem>
                    {availableLevels.filter(l => l.level > 0).map(l => (
                        <SelectItem key={l.level} value={String(l.level)}>Level {l.level} - {l.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
         <div className="space-y-2">
            <Label htmlFor="durationDays">Duration (Days)</Label>
            <Input id="durationDays" type="number" value={durationDays} onChange={e => setDurationDays(Number(e.target.value))} required />
        </div>
      </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="space-y-2">
            <Label htmlFor="requiredAmount">Required Team Deposits (USDT)</Label>
            <Input id="requiredAmount" type="number" value={requiredAmount} onChange={e => setRequiredAmount(Number(e.target.value))} required />
        </div>
         <div className="space-y-2">
            <Label htmlFor="rewardAmount">Bonus Reward (USDT)</Label>
            <Input id="rewardAmount" type="number" value={rewardAmount} onChange={e => setRewardAmount(Number(e.target.value))} required />
        </div>
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


export default function ManageTeamRewardsPage() {
  const { toast } = useToast();
  const [rewards, setRewards] = useState<TeamReward[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<TeamReward | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [availableLevels, setAvailableLevels] = useState<Level[]>(defaultLevels);


  useEffect(() => {
    setIsClient(true);
    const storedRewards = localStorage.getItem("platform_team_rewards");
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
      localStorage.setItem("platform_team_rewards", JSON.stringify(rewards));
    }
  }, [rewards, isClient]);

  const handleSaveReward = (reward: TeamReward) => {
    if (editingIndex !== null) {
      const newRewards = [...rewards];
      newRewards[editingIndex] = reward;
      setRewards(newRewards);
      toast({ title: "Reward Updated" });
    } else {
      setRewards([reward, ...rewards]);
      toast({ title: "Reward Added" });
    }
    closeForm();
  };
  
  const handleAddNew = () => {
    setEditingReward(null);
    setEditingIndex(null);
    setIsFormOpen(true);
  };

  const handleEdit = (index: number) => {
    setEditingReward(rewards[index]);
    setEditingIndex(index);
    setIsFormOpen(true);
  };
  
  const handleDelete = (index: number) => {
    const newRewards = rewards.filter((_, i) => i !== index);
    setRewards(newRewards);
    toast({ title: "Reward Deleted", variant: "destructive" });
  };
  
  const closeForm = () => {
    setIsFormOpen(false);
    setEditingReward(null);
    setEditingIndex(null);
  }
    
  return (
    <>
        <div className="grid gap-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manage Team Rewards</h1>
                    <p className="text-muted-foreground">
                        Create special deposit-based bonuses for teams.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="default" onClick={handleAddNew}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New Reward
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Current Rewards ({rewards.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {rewards.map((reward, index) => (
                    <div key={reward.id} className="border p-4 rounded-lg flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                             <Award className="h-5 w-5 text-primary"/>
                            <h3 className="font-semibold">{reward.title}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{reward.description}</p>
                          <div className="text-xs text-muted-foreground grid grid-cols-2 md:flex md:flex-wrap gap-x-4 gap-y-1 mt-2">
                              <span><strong className="text-foreground">Level:</strong> {reward.level === 0 ? 'All' : `${reward.level}+`}</span>
                              <span><strong className="text-foreground">Deposits:</strong> ${reward.requiredAmount.toLocaleString()}</span>
                              <span><strong className="text-foreground">Duration:</strong> {reward.durationDays} days</span>
                              <span><strong className="text-foreground">Reward:</strong> ${reward.rewardAmount.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(index)}>
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
                                            Are you sure you want to delete this team reward? This cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(index)} className="bg-destructive hover:bg-destructive/90">
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                    ))}
                    {rewards.length === 0 && (
                        <p className="text-muted-foreground text-center py-12">No team rewards have been configured yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{editingReward ? 'Edit Reward' : 'Add New Reward'}</DialogTitle>
                </DialogHeader>
                <TeamRewardForm
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
