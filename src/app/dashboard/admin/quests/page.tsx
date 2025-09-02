
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
import { Loader2, PlusCircle, Edit, Trash2 } from "lucide-react";
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

export type Quest = {
  id: string;
  title: string;
  description: string;
  reward: number;
  level: number; // 0 for All Levels
};

const QuestForm = ({
  quest,
  onSave,
  onCancel,
  availableLevels
}: {
  quest: Partial<Quest> | null;
  onSave: (quest: Quest) => void;
  onCancel: () => void;
  availableLevels: Level[];
}) => {
  const [title, setTitle] = useState(quest?.title || "");
  const [description, setDescription] = useState(quest?.description || "");
  const [reward, setReward] = useState(quest?.reward || 0);
  const [level, setLevel] = useState(quest?.level ?? 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || reward <= 0) {
      alert("Please fill all fields with valid values.");
      return;
    }
    onSave({
      id: quest?.id || `QUEST-${Date.now()}`,
      title,
      description,
      reward,
      level,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Quest Title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="reward">Reward (USDT)</Label>
            <Input id="reward" type="number" value={reward} onChange={(e) => setReward(Number(e.target.value))} required />
        </div>
        <div className="space-y-2">
            <Label htmlFor="level">Target Level</Label>
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
      </div>
      
      <DialogFooter>
        <DialogClose asChild>
            <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        </DialogClose>
        <Button type="submit">Save Quest</Button>
      </DialogFooter>
    </form>
  );
};


export default function ManageQuestsPage() {
  const { toast } = useToast();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [availableLevels, setAvailableLevels] = useState<Level[]>(defaultLevels);


  useEffect(() => {
    setIsClient(true);
    const storedQuests = localStorage.getItem("platform_quests");
    if (storedQuests) {
      setQuests(JSON.parse(storedQuests));
    }
    const storedLevels = localStorage.getItem("platform_levels");
    if (storedLevels) {
        setAvailableLevels(JSON.parse(storedLevels));
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("platform_quests", JSON.stringify(quests));
    }
  }, [quests, isClient]);

  const handleSaveQuest = (quest: Quest) => {
    if (editingIndex !== null) {
      const newQuests = [...quests];
      newQuests[editingIndex] = quest;
      setQuests(newQuests);
      toast({ title: "Quest Updated" });
    } else {
      setQuests([...quests, quest]);
      toast({ title: "Quest Added" });
    }
    closeForm();
  };
  
  const handleAddNew = () => {
    setEditingQuest(null);
    setEditingIndex(null);
    setIsFormOpen(true);
  };

  const handleEdit = (index: number) => {
    setEditingQuest(quests[index]);
    setEditingIndex(index);
    setIsFormOpen(true);
  };
  
  const handleDelete = (index: number) => {
    const newQuests = quests.filter((_, i) => i !== index);
    setQuests(newQuests);
    toast({ title: "Quest Deleted", variant: "destructive" });
  };
  
  const closeForm = () => {
    setIsFormOpen(false);
    setEditingQuest(null);
    setEditingIndex(null);
  }
    
  return (
    <>
        <div className="grid gap-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manage Daily Quests</h1>
                    <p className="text-muted-foreground">
                        Create and configure daily quests for users.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="default" onClick={handleAddNew}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New Quest
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Current Quests ({quests.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {quests.map((quest, index) => (
                    <div key={quest.id} className="border p-4 rounded-lg flex justify-between items-start gap-4">
                        <div className="flex-1">
                        <h3 className="font-semibold">{quest.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{quest.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                            <p className="text-sm font-bold text-primary">Reward: ${quest.reward.toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground"><strong className="text-foreground">Level:</strong> {quest.level === 0 ? "All" : `Level ${quest.level}`}</p>
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
                                        <AlertDialogTitle>Delete Quest?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to delete this quest? This cannot be undone.
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
                    {quests.length === 0 && (
                        <p className="text-muted-foreground text-center py-12">No daily quests have been configured yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{editingQuest ? 'Edit Quest' : 'Add New Quest'}</DialogTitle>
                </DialogHeader>
                <QuestForm 
                    quest={editingQuest}
                    onSave={handleSaveQuest}
                    onCancel={closeForm}
                    availableLevels={availableLevels}
                />
            </DialogContent>
        </Dialog>
    </>
  );
}
