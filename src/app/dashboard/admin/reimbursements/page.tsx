
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
import { PlusCircle, Edit, Trash2, HandCoins } from "lucide-react";
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
import { useAuth } from "@/contexts/AuthContext";
import { Switch } from "@/components/ui/switch";

export type Reimbursement = {
  id: string;
  title: string;
  description: string;
  amount: number;
  level: number; // 0 for All Levels
  userEmail?: string;
  enabled: boolean;
};

const ReimbursementForm = ({
  item,
  onSave,
  onCancel,
  availableLevels,
}: {
  item: Partial<Reimbursement> | null;
  onSave: (item: Omit<Reimbursement, 'id'>) => void;
  onCancel: () => void;
  availableLevels: Level[];
}) => {
  const { users } = useAuth();
  const [title, setTitle] = useState(item?.title || "");
  const [description, setDescription] = useState(item?.description || "");
  const [amount, setAmount] = useState(item?.amount || 0);
  const [level, setLevel] = useState(item?.level ?? 0);
  const [userEmail, setUserEmail] = useState(item?.userEmail || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || amount <= 0) {
      alert("Please fill all fields with valid values.");
      return;
    }
    onSave({
      title,
      description,
      amount,
      level,
      userEmail,
      enabled: item?.enabled ?? true,
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
        <Label htmlFor="title">Reimbursement Title / Event Name</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="amount">Amount (USDT)</Label>
            <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} required />
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
        <DialogClose asChild><Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button></DialogClose>
        <Button type="submit">Save Reimbursement</Button>
      </DialogFooter>
    </form>
  );
};


export default function ManageReimbursementsPage() {
  const { toast } = useToast();
  const [reimbursements, setReimbursements] = useState<Reimbursement[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Reimbursement | null>(null);
  const [availableLevels, setAvailableLevels] = useState<Level[]>(defaultLevels);

  useEffect(() => {
    setIsClient(true);
    const stored = localStorage.getItem("platform_reimbursements");
    if (stored) {
      setReimbursements(JSON.parse(stored));
    }
    const storedLevels = localStorage.getItem("platform_levels");
    if (storedLevels) {
        setAvailableLevels(JSON.parse(storedLevels));
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("platform_reimbursements", JSON.stringify(reimbursements));
    }
  }, [reimbursements, isClient]);

  const handleSave = (itemData: Omit<Reimbursement, 'id'>) => {
    if (editingItem) {
      setReimbursements(reimbursements.map(r => r.id === editingItem.id ? { ...editingItem, ...itemData } : r));
      toast({ title: "Reimbursement Updated" });
    } else {
      setReimbursements([...reimbursements, { ...itemData, id: `REIM-${Date.now()}` }]);
      toast({ title: "Reimbursement Added" });
    }
    closeForm();
  };
  
  const handleAddNew = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: Reimbursement) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };
  
  const handleDelete = (id: string) => {
    setReimbursements(reimbursements.filter(r => r.id !== id));
    toast({ title: "Reimbursement Deleted", variant: "destructive" });
  };

  const handleToggle = (id: string, enabled: boolean) => {
      setReimbursements(reimbursements.map(r => r.id === id ? {...r, enabled} : r));
      toast({ title: `Reimbursement ${enabled ? "Enabled" : "Disabled"}` });
  }
  
  const closeForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  }
    
  return (
    <>
        <div className="grid gap-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manage Reimbursements</h1>
                    <p className="text-muted-foreground">
                        Create and manage reimbursement packages for user events.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="default" onClick={handleAddNew}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Current Reimbursements ({reimbursements.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {reimbursements.map((item) => (
                    <div key={item.id} className="border p-4 rounded-lg flex justify-between items-start gap-4">
                        <div className="flex-1">
                            <h3 className="font-semibold">{item.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs">
                                <span className="font-bold text-primary">${item.amount.toFixed(2)}</span>
                                <span className="text-muted-foreground">Level: {item.level === 0 ? "All" : `Level ${item.level}`}</span>
                                {item.userEmail && <span className="text-muted-foreground">User: {item.userEmail}</span>}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch checked={item.enabled} onCheckedChange={(checked) => handleToggle(item.id, checked)} />
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
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
                                        <AlertDialogTitle>Delete Reimbursement?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-destructive hover:bg-destructive/90">
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                    ))}
                    {reimbursements.length === 0 && (
                        <p className="text-muted-foreground text-center py-12">No reimbursement packages have been configured yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{editingItem ? 'Edit' : 'Add New'} Reimbursement</DialogTitle>
                </DialogHeader>
                <ReimbursementForm 
                    item={editingItem}
                    onSave={handleSave}
                    onCancel={closeForm}
                    availableLevels={availableLevels}
                />
            </DialogContent>
        </Dialog>
    </>
  );
}
