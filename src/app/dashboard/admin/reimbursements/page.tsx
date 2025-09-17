
"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Edit, Trash2, HandCoins, Loader2, Upload, X, Gift } from "lucide-react";
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
import { useAuth } from "@/contexts/AuthContext";
import { Switch } from "@/components/ui/switch";

export type CustomReward = {
  id: string;
  title: string;
  description: string;
  amount: number;
  userEmail?: string;
  enabled: boolean;
  imageUrl?: string | null;
};

const ManualGrantForm = () => {
    const { users } = useAuth();
    const { toast } = useToast();
    const [selectedUser, setSelectedUser] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleGrant = async () => {
        if (!selectedUser || !title || !description || !amount) {
            toast({ variant: "destructive", title: "Missing Fields", description: "Please fill in all fields." });
            return;
        }
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            toast({ variant: "destructive", title: "Invalid Amount", description: "Please enter a valid positive number." });
            return;
        }

        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            const mainBalanceKey = `${selectedUser}_mainBalance`;
            const currentBalance = parseFloat(localStorage.getItem(mainBalanceKey) || '0');
            localStorage.setItem(mainBalanceKey, (currentBalance + numericAmount).toString());

            const activityHistoryKey = `${selectedUser}_activityHistory`;
            const currentHistory = JSON.parse(localStorage.getItem(activityHistoryKey) || '[]');
            const newActivity = {
                id: `ACT-MANUAL-${Date.now()}`,
                type: 'Manual Reward',
                description: `${title}: ${description}`,
                amount: numericAmount,
                date: new Date().toISOString(),
            };
            localStorage.setItem(activityHistoryKey, JSON.stringify([newActivity, ...currentHistory]));

            toast({ title: "Reward Granted", description: `${selectedUser} has been credited with $${numericAmount}.` });
            setSelectedUser("");
            setTitle("");
            setDescription("");
            setAmount("");
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not grant reward." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Grant Manual Reward</CardTitle>
                <CardDescription>Directly credit a custom reward to a user's main wallet.</CardDescription>
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
                    <Label>Title</Label>
                    <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Event Prize" />
                </div>
                 <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g., Prize for winning the weekly team challenge." />
                </div>
                <div className="space-y-2">
                    <Label>Amount (USDT)</Label>
                    <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g., 50" />
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

const CustomRewardForm = ({
  item,
  onSave,
  onCancel,
}: {
  item: Partial<CustomReward> | null;
  onSave: (item: Omit<CustomReward, 'id'>) => void;
  onCancel: () => void;
}) => {
  const { users } = useAuth();
  const [title, setTitle] = useState(item?.title || "");
  const [description, setDescription] = useState(item?.description || "");
  const [amount, setAmount] = useState(item?.amount || 0);
  const [userEmail, setUserEmail] = useState(item?.userEmail || "");
  const [image, setImage] = useState<string | null>(item?.imageUrl || null);


  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


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
      userEmail,
      enabled: item?.enabled ?? true,
      imageUrl: image,
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
        <Label htmlFor="title">Reward Title / Event Name</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="amount">Amount (USDT)</Label>
        <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} required />
      </div>
       <div className="space-y-2">
        <Label htmlFor="userEmail">Specific User (Optional)</Label>
        <Select value={userEmail || "ALL_USERS"} onValueChange={handleUserSelectChange}>
            <SelectTrigger id="userEmail">
                <SelectValue placeholder="All users at level" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="ALL_USERS">All users</SelectItem>
                {users.map(u => (
                    <SelectItem key={u.email} value={u.email}>{u.email}</SelectItem>
                ))}
            </SelectContent>
        </Select>
      </div>
       <div className="space-y-2">
        <Label htmlFor="reward-image">Image / GIF (Optional)</Label>
        <Input id="reward-image" type="file" accept="image/*,image/gif" onChange={handleFileChange} />
        {image && (
            <div className="relative mt-2 w-24 h-24">
                 <Image src={image} alt="Reward preview" layout="fill" className="object-cover rounded-md" />
                 <Button size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => setImage(null)}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
        )}
       </div>
      
      <DialogFooter>
        <DialogClose asChild><Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button></DialogClose>
        <Button type="submit">Save Reward</Button>
      </DialogFooter>
    </form>
  );
};


export default function ManageReimbursementsPage() {
  const { toast } = useToast();
  const [rewards, setRewards] = useState<CustomReward[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CustomReward | null>(null);

  useEffect(() => {
    setIsClient(true);
    const stored = localStorage.getItem("platform_reimbursements");
    if (stored) {
      setRewards(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("platform_reimbursements", JSON.stringify(rewards));
    }
  }, [rewards, isClient]);

  const handleSave = (itemData: Omit<CustomReward, 'id'>) => {
    if (editingItem) {
      setRewards(rewards.map(r => r.id === editingItem.id ? { ...editingItem, ...itemData } : r));
      toast({ title: "Custom Reward Updated" });
    } else {
      setRewards([...rewards, { ...itemData, id: `REWARD-${Date.now()}` }]);
      toast({ title: "Custom Reward Added" });
    }
    closeForm();
  };
  
  const handleAddNew = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: CustomReward) => {
    setEditingItem(item);
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
    setEditingItem(null);
    setIsFormOpen(false);
  }
    
  return (
    <>
        <div className="grid gap-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manage Custom Rewards</h1>
                    <p className="text-muted-foreground">
                        Create special, claimable rewards for users.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="default" onClick={handleAddNew}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New
                    </Button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Claimable Custom Rewards ({rewards.length})</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {rewards.map((item) => (
                            <div key={item.id} className="border p-4 rounded-lg flex justify-between items-start gap-4">
                                <div className="flex-1 flex items-start gap-4">
                                    {item.imageUrl && <Image src={item.imageUrl} alt={item.title} width={64} height={64} className="w-16 h-16 rounded-md object-cover" />}
                                    <div>
                                        <h3 className="font-semibold">{item.title}</h3>
                                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs">
                                            <span className="font-bold text-primary">${item.amount.toFixed(2)}</span>
                                            {item.userEmail && <span className="text-muted-foreground">User: {item.userEmail}</span>}
                                        </div>
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
                                                <AlertDialogTitle>Delete Reward?</AlertDialogTitle>
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
                            {rewards.length === 0 && (
                                <p className="text-muted-foreground text-center py-12">No custom rewards have been configured yet.</p>
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
                    <DialogTitle>{editingItem ? 'Edit' : 'Add New'} Custom Reward</DialogTitle>
                </DialogHeader>
                <CustomRewardForm 
                    item={editingItem}
                    onSave={handleSave}
                    onCancel={closeForm}
                />
            </DialogContent>
        </Dialog>
    </>
  );
}
